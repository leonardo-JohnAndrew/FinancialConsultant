import { NextResponse } from "next/server";

import { Summary } from "@/db/models";

// GET all summaries
export async function GET() {
  try {
    const summaries = await Summary.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return NextResponse.json({ success: true, data: summaries });
  } catch (error) {
    console.error("GET summaries error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST create new summary
export async function POST(request) {
  try {
    const body = await request.json();
    const { projec_name, projec_code, period_start, period_end } = body;

    if (!projec_name || !projec_code || !period_start || !period_end) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const summary = await Summary.create({
      projec_name,
      projec_code,
      period_start,
      period_end,
    });

    return NextResponse.json({ success: true, data: summary }, { status: 201 });
  } catch (error) {
    console.error("POST summaries error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
