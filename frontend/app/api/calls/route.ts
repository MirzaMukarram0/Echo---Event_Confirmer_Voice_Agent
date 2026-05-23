import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/v1/calls`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input shape validation
    if (!body || typeof body !== "object") {
      return NextResponse.json({ detail: "Request body must be a valid JSON object." }, { status: 400 });
    }

    const { phone_number, scenario, scenario_config } = body;

    if (typeof phone_number !== "string" || !phone_number.trim()) {
      return NextResponse.json({ detail: "phone_number is required and must be a string." }, { status: 400 });
    }

    if (!phone_number.trim().startsWith("+")) {
      return NextResponse.json({ detail: "Phone number must start with '+'." }, { status: 400 });
    }

    if (typeof scenario !== "string" || !scenario.trim()) {
      return NextResponse.json({ detail: "scenario is required and must be a string." }, { status: 400 });
    }

    if (!scenario_config || typeof scenario_config !== "object") {
      return NextResponse.json({ detail: "scenario_config is required and must be an object." }, { status: 400 });
    }

    const res = await fetch(`${FASTAPI_URL}/api/v1/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phone_number.trim(),
        scenario: scenario.trim(),
        scenario_config,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Backend unavailable";
    return NextResponse.json(
      { detail },
      { status: 502 }
    );
  }
}
