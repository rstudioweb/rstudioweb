import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwFK1evUb2faH3tJdCfrmOrgDtfhW-jUTFcpOWtUYZp5bkTc1I6nabTTy9MJ0pf6XSs/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    console.log(body);
    console.log(data);

    if (response.ok && data.status === "success") {
      return NextResponse.json({
        status: "success",
        message: "Data submitted to Google Sheet.",
      });
    } else {
      return NextResponse.json(
        { status: "error", message: data.message || "Script error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Submit Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
