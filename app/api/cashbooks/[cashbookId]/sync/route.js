import { NextResponse } from "next/server";
import { insertMissingCashbookEntries } from "@/functions/cashbook";

export async function POST(request, { params }) {
  const { cashbookId } = await params;
  try {
    const result = await insertMissingCashbookEntries(cashbookId);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error_message: err.message,
      },
      { status: 500 },
    );
  }
}
