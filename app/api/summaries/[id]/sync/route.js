import { NextResponse } from "next/server";
import { Op } from "sequelize";
import {
  AccountCode,
  CashBooks,
  PH_Cash_Bank,
  Summary,
  SummaryDetailed,
  US_Cash_Bank,
} from "@/db/models";

function extractItemCode(acCode) {
  if (!acCode) return null;
  const match = acCode.toString().match(/^(\d+)/);
  return match ? match[1] : acCode.toString().trim();
}

async function findName(acCode) {
  const item = await AccountCode.findOne({
    where: {
      code: acCode,
    },
  });
  console.log(`${acCode}: ${JSON.stringify(item)}`);
  return item.description;
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const summary = await Summary.findByPk(id);
    if (!summary) {
      return NextResponse.json(
        { success: false, message: "Summary not found" },
        { status: 404 },
      );
    }

    const { period_start, period_end } = summary;

    // Get all cashbooks in this period
    const cashbooks = await CashBooks.findAll({
      where: {
        dateRangeStart: period_start,
        dateRangeEnd: period_end,
      },
      raw: true,
    });

    if (!cashbooks.length) {
      return NextResponse.json(
        { success: false, message: "No cashbooks found for this period" },
        { status: 404 },
      );
    }

    const cashbookIds = cashbooks.map((c) => c.cashbook_id);

    // ── Separate by category ──
    const bankCashbooks = cashbooks.filter((c) => c.category === "Bank");
    const cashCashbooks = cashbooks.filter((c) => c.category === "Cash");

    const sumField = (arr, field) =>
      arr.reduce((acc, c) => acc + parseFloat(c[field] || 0), 0);

    // ── Previous month balance (brought forward INTO this period) ──
    // US cashbooks
    const usBankCashbooks = bankCashbooks.filter((c) => c.currency === "US");
    const usCashCashbooks = cashCashbooks.filter((c) => c.currency === "US");

    const us_prev_bank = sumField(
      usBankCashbooks,
      "balance_brought_forward_from_previous_month",
    );
    const us_prev_cash = sumField(
      usCashCashbooks,
      "balance_brought_forward_from_previous_month",
    );
    const us_balance_from_prev =
      Math.round((us_prev_bank + us_prev_cash) * 100) / 100;

    // PH cashbooks
    const phBankCashbooks = bankCashbooks.filter((c) => c.currency === "PH");
    const phCashCashbooks = cashCashbooks.filter((c) => c.currency === "PH");

    const ph_prev_bank = sumField(
      phBankCashbooks,
      "balance_brought_forward_from_previous_month",
    );
    const ph_prev_cash = sumField(
      phCashCashbooks,
      "balance_brought_forward_from_previous_month",
    );
    const ph_balance_from_prev =
      Math.round((ph_prev_bank + ph_prev_cash) * 100) / 100;

    // ── Carried forward to next month (end balance) ──
    const us_cash_in_bank = sumField(
      usBankCashbooks,
      "balance_carried_forward_to_next_month",
    );
    const us_cash_on_hand = sumField(
      usCashCashbooks,
      "balance_carried_forward_to_next_month",
    );
    const ph_cash_in_bank = sumField(
      phBankCashbooks,
      "balance_carried_forward_to_next_month",
    );
    const ph_cash_on_hand = sumField(
      phCashCashbooks,
      "balance_carried_forward_to_next_month",
    );

    const us_balance_for_next =
      Math.round((us_cash_in_bank + us_cash_on_hand) * 100) / 100;
    const ph_balance_for_next =
      Math.round((ph_cash_in_bank + ph_cash_on_hand) * 100) / 100;

    // ── Get transactions ──
    const phRows = await PH_Cash_Bank.findAll({
      where: { cashbook_id: { [Op.in]: cashbookIds } },
      attributes: ["A_C_code", "receipt", "payment"],
      raw: true,
    });

    const usRows = await US_Cash_Bank.findAll({
      where: { cashbook_id: { [Op.in]: cashbookIds } },
      attributes: ["A_C_code", "receipt", "payment"],
      raw: true,
    });
    const allCodes = [
      ...new Set([...phRows, ...usRows].map((r) => r.A_C_code).filter(Boolean)),
    ];

    const accounts = await AccountCode.findAll({
      where: {
        code: {
          [Op.in]: allCodes,
        },
      },
      raw: true,
    });

    const accountMap = {};

    accounts.forEach((acc) => {
      accountMap[acc.code] = acc.description;
    });
    // ── Aggregate by item code ──
    const aggregateByCode = (rows, currency) => {
      const map = {};

      for (const row of rows) {
        const code = extractItemCode(row.A_C_code);

        if (!code) continue;

        const name = accountMap[row.A_C_code] || "";

        if (!map[code]) {
          map[code] = {
            item_code: code,
            item_name: name,
            currency,
            receipt_in: 0,
            payment_out: 0,
          };
        }

        map[code].receipt_in += parseFloat(row.receipt || 0);
        map[code].payment_out += parseFloat(row.payment || 0);
      }

      return Object.values(map);
    };
    const phItems = aggregateByCode(phRows, "PH");
    const usItems = aggregateByCode(usRows, "US");

    const allItems = [...phItems, ...usItems];

    // ── Totals per currency ──
    const us_total_receipt_in =
      Math.round(usItems.reduce((a, i) => a + i.receipt_in, 0) * 100) / 100;
    const us_total_payment_out =
      Math.round(usItems.reduce((a, i) => a + i.payment_out, 0) * 100) / 100;
    const us_balance =
      Math.round((us_total_receipt_in - us_total_payment_out) * 100) / 100;

    const ph_total_receipt_in =
      Math.round(phItems.reduce((a, i) => a + i.receipt_in, 0) * 100) / 100;
    const ph_total_payment_out =
      Math.round(phItems.reduce((a, i) => a + i.payment_out, 0) * 100) / 100;
    const ph_balance =
      Math.round((ph_total_receipt_in - ph_total_payment_out) * 100) / 100;

    // ── Delete old, insert new ──
    await SummaryDetailed.destroy({ where: { summary_id: id } });

    const createItem = (item, isUS) =>
      SummaryDetailed.create({
        summary_id: id,
        item_code: item.item_code,
        item_name: item.item_name,
        currency: item.currency,
        receipt_in: Math.round(item.receipt_in * 100) / 100,
        payment_out: Math.round(item.payment_out * 100) / 100,
        cash_in_bank:
          isUS ?
            Math.round(us_cash_in_bank * 100) / 100
          : Math.round(ph_cash_in_bank * 100) / 100,
        cash_on_hand:
          isUS ?
            Math.round(us_cash_on_hand * 100) / 100
          : Math.round(ph_cash_on_hand * 100) / 100,
        check_not_shown: 0,
        balance_for_next_month:
          isUS ? us_balance_for_next : ph_balance_for_next,
        total_receipt_in: isUS ? us_total_receipt_in : ph_total_receipt_in,
        total_payment_out: isUS ? us_total_payment_out : ph_total_payment_out,
        balance: isUS ? us_balance : ph_balance,
      });

    // Insert "Balance from Previous Month" as first item per currency
    await SummaryDetailed.create({
      summary_id: id,
      item_code: null,
      item_name: "Balance from Previous Month",
      currency: "US",
      receipt_in: us_balance_from_prev,
      payment_out: 0,
      cash_in_bank: Math.round(us_cash_in_bank * 100) / 100,
      cash_on_hand: Math.round(us_cash_on_hand * 100) / 100,
      check_not_shown: 0,
      balance_for_next_month: us_balance_for_next,
      total_receipt_in: us_total_receipt_in,
      total_payment_out: us_total_payment_out,
      balance: us_balance,
    });

    await SummaryDetailed.create({
      summary_id: id,
      item_code: null,
      item_name: "Balance from Previous Month",
      currency: "PH",
      receipt_in: ph_balance_from_prev,
      payment_out: 0,
      cash_in_bank: Math.round(ph_cash_in_bank * 100) / 100,
      cash_on_hand: Math.round(ph_cash_on_hand * 100) / 100,
      check_not_shown: 0,
      balance_for_next_month: ph_balance_for_next,
      total_receipt_in: ph_total_receipt_in,
      total_payment_out: ph_total_payment_out,
      balance: ph_balance,
    });

    // Insert regular transaction items
    for (const item of allItems) {
      await createItem(item, item.currency === "US");
    }

    return NextResponse.json({
      success: true,
      message: "Sync complete",
      data: {
        itemsCount: allItems.length,
        US: {
          previous_balance: us_balance_from_prev,
          cash_in_bank: Math.round(us_cash_in_bank * 100) / 100,
          cash_on_hand: Math.round(us_cash_on_hand * 100) / 100,
          balance_for_next_month: us_balance_for_next,
          total_receipt_in: us_total_receipt_in,
          total_payment_out: us_total_payment_out,
          balance: us_balance,
        },
        PH: {
          previous_balance: ph_balance_from_prev,
          cash_in_bank: Math.round(ph_cash_in_bank * 100) / 100,
          cash_on_hand: Math.round(ph_cash_on_hand * 100) / 100,
          balance_for_next_month: ph_balance_for_next,
          total_receipt_in: ph_total_receipt_in,
          total_payment_out: ph_total_payment_out,
          balance: ph_balance,
        },
      },
    });
  } catch (error) {
    console.error("SYNC error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
