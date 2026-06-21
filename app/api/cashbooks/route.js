import { NextResponse } from "next/server";
import { CashBooks, PH_Cash_Bank, US_Cash_Bank } from "@/db/models";
import { createCashbookEntry } from "@/functions/cashbook";

export async function POST() {
  try {
    // Auto create PH Cash, PH Bank, US Cash, US Bank
    await createCashbookEntry();

    // Return all cashbooks this month
    const cashbooks = await CashBooks.findAll({
      order: [["cashbook_id", "ASC"]],
    });
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
    return NextResponse.json({
      success: true,
      cashbooks: result,
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
    return NextResponse.json({ cashbooks: re }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
