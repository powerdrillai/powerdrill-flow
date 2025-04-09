import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/serverApiClient";
import { createJob } from "@/services/powerdrill/job.service";
import { CreateJobParams } from "@/types/job";

export async function POST(req: Request) {
  const params = await req.json();

  try {
    const response = await createJob(params as CreateJobParams);
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    return new NextResponse(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    handleApiError(error);
  }
}
