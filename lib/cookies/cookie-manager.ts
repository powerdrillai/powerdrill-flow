"use server";

import { cookies } from "next/headers";

import { decryptData, encryptData } from "./cookie-encryption";

// API Credentials Type
interface ApiCredentials {
  userId: string;
  apiKey: string;
}

// Set API credentials in cookies
export async function setApiCredentials(userId: string, apiKey: string) {
  const cookieStore = await cookies();

  // Set user ID with 7-day expiry and security options enabled
  cookieStore.set("api_user_id", encryptData(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "strict",
  });

  // Set Project API key with 1-day expiry and security options enabled
  cookieStore.set("api_key", encryptData(apiKey), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "strict",
  });
}

// Get API credentials from cookies
export async function getApiCredentials(): Promise<ApiCredentials | null> {
  const cookieStore = await cookies();

  const userId = cookieStore.get("api_user_id");
  const apiKey = cookieStore.get("api_key");

  if (!userId || !apiKey) {
    return null;
  }

  return {
    userId: decryptData(userId.value),
    apiKey: decryptData(apiKey.value),
  };
}

// Check if API credentials are set
export async function hasApiCredentials(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has("api_user_id") && cookieStore.has("api_key");
}

// Clear API credentials from cookies
export async function clearApiCredentials() {
  const cookieStore = await cookies();
  cookieStore.delete("api_user_id");
  cookieStore.delete("api_key");
}
