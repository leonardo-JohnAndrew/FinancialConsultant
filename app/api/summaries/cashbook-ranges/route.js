import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { CashBooks } from "@/db/models";

export async function GET() {
  try {
    const ranges = await CashBooks.findAll({
      attributes: ["dateRangeStart", "dateRangeEnd"],
      where: {
        dateRangeStart: { [Op.ne]: null },
        dateRangeEnd: { [Op.ne]: null },
      },
      group: ["dateRangeStart", "dateRangeEnd"],
      order: [["dateRangeStart", "DESC"]],
      raw: true,
    });

    const unique = Array.from(
      new Map(
        ranges.map((r) => [
          `${r.dateRangeStart}_${r.dateRangeEnd}`,
          {
            dateRangeStart: r.dateRangeStart,
            dateRangeEnd: r.dateRangeEnd,
          },
        ]),
      ).values(),
    );

    return NextResponse.json({ success: true, data: unique });
  } catch (error) {
    console.error("cashbook-ranges error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
