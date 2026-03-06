import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbx-dTHHHk5WYQMTaPcCBfr17QbMwbA4G7lt4Ixi5eupyh7gBy_OYGh7EdaJFJtmagIBGQ/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const raw = await response.text();
    let data: { status?: string; message?: string } | null = null;

    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (response.ok && data?.status === "success") {
      return NextResponse.json({
        status: "success",
        message: "Application submitted successfully.",
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message:
          data?.message ||
          `Apps Script request failed (${response.status}).`,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("API Recruits Apply Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}