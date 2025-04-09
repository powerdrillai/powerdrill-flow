"use server";

import { getApiCredentials } from "@/lib/cookies/cookie-manager";

import { createApiError, ERROR_MESSAGES, PowerdrillApiError } from "./errors";

const API_BASE_URL = process.env.API_BASE_URL;

type RequestData = Record<string, unknown>;

interface ApiResponse<T> {
  code: number;
  data: T;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const errorCode = errorData.code || response.status;

    const errorMessage =
      ERROR_MESSAGES[errorCode] || `HTTP error: ${response.status}`;

    throw new PowerdrillApiError({
      code: errorCode,
      message: errorMessage,
      httpStatus: response.status,
      details: errorData,
    });
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (result.code !== 0) {
    const errorMessage = ERROR_MESSAGES[result.code] || "API request failed";

    throw new PowerdrillApiError({
      code: result.code,
      message: errorMessage,
      httpStatus: response.status,
    });
  }

  return result.data;
}

export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof PowerdrillApiError) {
    throw error;
  }
  const apiError = handleError(error);
  throw apiError;
}

export async function getApiHeaders(): Promise<HeadersInit> {
  const credentials = await getApiCredentials();

  if (!credentials) {
    throw new Error("API credentials not set");
  }

  const { apiKey } = credentials;

  return {
    "Content-Type": "application/json",
    "x-pd-api-key": apiKey,
  };
}

export async function serverFetchData<T>(endpoint: string): Promise<T> {
  try {
    const credentials = await getApiCredentials();
    if (!credentials) throw new Error("API credentials not set");
    const headers = await getApiHeaders();
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.set("user_id", credentials.userId);

    console.log(`Making API request to: ${url.toString()}`);
    console.log(`With headers: ${JSON.stringify(headers, null, 2)}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      try {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
      } catch (e) {
        console.error("Could not read error response body" + e);
      }
    }

    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error("Error in serverFetchData:", error);
    throw handleError(error);
  }
}

export async function serverPostData<T>(
  endpoint: string,
  data: RequestData
): Promise<T> {
  try {
    const credentials = await getApiCredentials();
    if (!credentials) throw new Error("API credentials not set");
    const headers = await getApiHeaders();
    const requestData = { ...data, user_id: credentials.userId };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    return await handleApiResponse<T>(response);
  } catch (error) {
    throw handleError(error);
  }
}

export async function serverDeleteData<T>(
  endpoint: string,
  data?: RequestData
): Promise<T> {
  try {
    const credentials = await getApiCredentials();
    if (!credentials) throw new Error("API credentials not set");
    const headers = await getApiHeaders();
    const requestData = data
      ? { ...data, user_id: credentials.userId }
      : { user_id: credentials.userId };
    const options: RequestInit = {
      method: "DELETE",
      headers,
      body: JSON.stringify(requestData),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    return await handleApiResponse<T>(response);
  } catch (error) {
    throw handleError(error);
  }
}

function handleError(error: unknown): PowerdrillApiError {
  const apiError = createApiError(error);

  if (apiError.httpStatus === 401 || apiError.httpStatus === 403) {
    // Authentication error handling
    console.error(
      `Authentication failed (${apiError.httpStatus}), please check your User ID and API Key. Error: ${apiError.getFormattedMessage()}`
    );
    if (apiError.details) {
      console.error("Error details:", apiError.details);
    }
  } else if (apiError.httpStatus === 429) {
    // Rate limit exceeded
    console.error("Too many requests, please try again later");
  } else {
    console.error("API request error:", apiError.getFormattedMessage());
    if (apiError.details) {
      console.error("Error details:", apiError.details);
    }
  }

  return apiError;
}
