import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Example body expected:
    // {
    //   name: "Rishav",
    //   dob: "1988-12-10",
    //   location: "Kolkata",
    //   experience: "Yes",
    //   contact: "1231231231",
    //   marital: "No",
    //   aadhaar: "Yes",
    //   fileId: "1XXWVrneEQk1UvikCaYHwIm0_4NWLgFj8"
    // }

    const response = await fetch("https://script.google.com/macros/s/AKfycby4zyUE5bybZdY7A2lglMuGd9nFHqORN2k4s72hfT8Co6bTo2HS_3hCVLHl0m1oF1EI/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      return NextResponse.json({ status: "success", message: "Data submitted to Google Sheet." });
    } else {
      return NextResponse.json({ status: "error", message: data.message || "Script error" }, { status: 500 });
    }

  } catch (error) {
    console.error("API Submit Error:", error);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}
