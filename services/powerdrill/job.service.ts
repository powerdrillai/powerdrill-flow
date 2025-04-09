import { getApiHeaders } from "@/lib/api/serverApiClient";
import { getApiCredentials } from "@/lib/cookies/cookie-manager";
import { CreateJobParams } from "@/types/job";

export async function createJob(params: CreateJobParams): Promise<Response> {
  const credentials = await getApiCredentials();
  if (!credentials) throw new Error("API credentials not set");

  const headers = await getApiHeaders();
  const requestData = {
    ...params,
    stream: true,
    user_id: credentials.userId,
  };

  const response = await fetch(`${process.env.API_BASE_URL}/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create job: ${response.statusText}`);
  }

  return response;
}
