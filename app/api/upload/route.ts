import { NextRequest, NextResponse } from "next/server";

import {
  completeMultipartUpload,
  initMultipartUpload,
} from "@/services/powerdrill/file.service";

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    let result;
    switch (action) {
      case "initMultipartUpload":
        const { fileName, fileSize } = params;
        result = await initMultipartUpload(fileName, fileSize);
        break;
      case "completeMultipartUpload":
        const { fileObjectKey, uploadId, partEtags } = params;
        result = await completeMultipartUpload(
          fileObjectKey,
          uploadId,
          partEtags
        );
        break;
      default:
        return NextResponse.json(
          { code: 400, data: null, msg: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ code: 0, data: result, msg: "Success" });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        code: 500,
        data: null,
        msg: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
