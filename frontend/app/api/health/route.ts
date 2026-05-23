import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/v1/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: "error", detail: "Backend returned error status" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: "error", detail: "Backend unavailable" },
      { status: 502 }
    );
  }
}
