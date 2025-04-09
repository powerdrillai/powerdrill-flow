"use server";

import { redirect } from "next/navigation";

import { PowerdrillApiError } from "@/lib/api/errors";
import { serverFetchData, serverPostData } from "@/lib/api/serverApiClient";
import {
  clearApiCredentials,
  hasApiCredentials,
  setApiCredentials as setCookieApiCredentials,
} from "@/lib/cookies/cookie-manager";

// Generic request data type
interface RequestData {
  [key: string]: unknown;
}

// Submit API credentials form action
export async function submitApiCredentials(formData: FormData) {
  const userId = formData.get("userId") as string;
  const apiKey = formData.get("apiKey") as string;
  console.log(userId, apiKey);
  if (!userId || !apiKey) {
    return {
      success: false,
      message: "User ID and API Key are required",
    };
  }

  try {
    // Save credentials to cookie
    await setCookieApiCredentials(userId, apiKey);

    console.log('Credentials saved to cookies, attempting to validate with API call...');

    // Try an API call to validate credentials
    await serverFetchData("/sessions");

    console.log('API validation successful');
    return {
      success: true,
      message: "API credentials saved",
    };
  } catch (error) {
    // Credentials validation failed, clear the cookie
    console.error('API validation failed:', error);
    await clearApiCredentials();

    let errorMessage = "Failed to set API credentials, please check your input";

    // If it's a PowerdrillApiError, get more specific error message
    if (error instanceof PowerdrillApiError) {
      errorMessage = `API validation failed: ${error.getFormattedMessage()}`;
      console.error('API Error details:', error);
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Check API credentials and redirect if needed
export async function checkApiCredentialsRedirect(
  redirectPath: string = "/setup"
) {
  const isConfigured = await hasApiCredentials();

  if (!isConfigured) {
    redirect(redirectPath);
  }

  return { isConfigured };
}

// Fetch API data
export async function fetchApiData(endpoint: string) {
  try {
    return {
      data: await serverFetchData(endpoint),
      success: true,
    };
  } catch (error) {
    let message = "Failed to fetch data";
    if (error instanceof PowerdrillApiError) {
      message = error.getFormattedMessage();
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}

// Post API data
export async function postApiData(endpoint: string, data: RequestData) {
  try {
    return {
      data: await serverPostData(endpoint, data),
      success: true,
    };
  } catch (error) {
    let message = "Failed to submit data";
    if (error instanceof PowerdrillApiError) {
      message = error.getFormattedMessage();
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}

// Logout/clear API credentials
export async function logoutApiCredentials() {
  await clearApiCredentials();
  return { success: true };
}
