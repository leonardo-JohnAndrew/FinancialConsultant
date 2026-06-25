"use server";

import { CashBooks, PH_Cash_Bank, US_Cash_Bank } from "@/db/models";

export async function collectcashbookData(range_start, range_end) {
  const us_books = [];
  const ph_books = [];
  const cashbook = await CashBooks.findAll({
    where: {
      dateRangeStart: range_start,
      dateRangeEnd: range_end,
    },
  });

  const phCashbooks = cashbook.filter((c) => c.currency === "PH");
  const usCashbooks = cashbook.filter((c) => c.currency === "US");

  for (const uscb of usCashbooks) {
    const sql = await CashBooks.findOne({
      where: { cashbook_id: uscb.cashbook_id },
      include: {
        model: US_Cash_Bank,
      },
    });
    us_books.push(sql);
  }
  for (const phcb of phCashbooks) {
    const sql = await CashBooks.findOne({
      where: { cashbook_id: phcb.cashbook_id },
      include: {
        model: PH_Cash_Bank,
      },
    });
    ph_books.push(sql);
  }

  return {
    ph_books,
    us_books,
  };
}
