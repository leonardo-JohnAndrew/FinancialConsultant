import { NextResponse } from "next/server";
import { CashBooks, PH_Cash_Bank, US_Cash_Bank } from "@/db/models";
import { createCashbookEntry } from "@/functions/cashbook";

// POST - create new cashbook
// POST - create new cashbook
export async function POST(request) {
  try {
    const body = await request.json();
    const { project, combination, dateRangeStart, dateRangeEnd } = body;

    if (!combination || !dateRangeStart || !dateRangeEnd) {
      return NextResponse.json(
        {
          success: false,
          error_message: "Currency/Category and date range are required.",
        },
        { status: 400 },
      );
    }

    const VALID_COMBINATIONS = {
      "PH Cash": { currency: "PH", category: "Cash" },
      "PH Bank": { currency: "PH", category: "Bank" },
      "US Bank": { currency: "US", category: "Bank" },
      "US Cash": { currency: "US", category: "Cash" },
    };

    const parsed = VALID_COMBINATIONS[combination];
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error_message: "Invalid currency/category combination.",
        },
        { status: 400 },
      );
    }

    const start = new Date(dateRangeStart);
    const end = new Date(dateRangeEnd);

    // check kung existing na ang same range start/end PARA SA SAME currency+category
    const existing = await CashBooks.findOne({
      where: {
        currency: parsed.currency,
        category: parsed.category,
        dateRangeStart: start,
        dateRangeEnd: end,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error_message: `A ${combination} cashbook with the same date range already exists.`,
        },
        { status: 400 },
      );
    }

    const projectValue = project || "9665R7268";

    const newCashbook = await CashBooks.create({
      project: projectValue,
      currency: parsed.currency,
      category: parsed.category,
      dateRangeStart: start,
      dateRangeEnd: end,
    });

    return NextResponse.json({
      success: true,
      cashbook: newCashbook,
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      {
        success: false,
        error_message: err.message,
      },
      { status: 500 },
    );
  }
}
export async function GET(request) {
  try {
    const cashbooks = await CashBooks.findAll();
    const result = await Promise.all(
      cashbooks.map(async (cashbook) => {
        const Model = cashbook.currency === "PH" ? PH_Cash_Bank : US_Cash_Bank;

        const totalEntries = await Model.count({
          where: {
            cashbook_id: cashbook.cashbook_id,
          },
        });

        return {
          ...cashbook.toJSON(),
          hasChildren: totalEntries > 0,
        };
      }),
    );
    return NextResponse.json({ cashbooks: result }, { status: 200 });
  } catch (err) {
    console.log(err.message);

    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
