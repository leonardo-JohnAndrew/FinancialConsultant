import {
  CashBooks,
  Check,
  CheckItem,
  PH_Cash_Bank,
  US_Cash_Bank,
} from "@/db/models";
import { insertCashbooks } from "@/functions/cashbook";
import { NextResponse } from "next/server";
import { Sequelize, where } from "sequelize";

export async function POST(request, { params }) {
  const { cashbookId } = await params;

  try {
    // find range
    const range = await CashBooks.findOne({
      where: {
        cashbook_id: cashbookId,
      },
      attributes: [
        "cashbook_id",
        "dateRangeStart",
        "dateRangeEnd",
        "is_already_have_subdata",
        "category",
        "currency",
      ],
    });
    if (!range) {
      return NextResponse.json({ error_message: "Not Found" }, { status: 404 });
    }
    const UpperCase = range.category.toUpperCase();
    const voucherType = `${UpperCase} ${range.currency === "PH" ? "PHP" : "USD"}`;
    const start = new Date(range.dateRangeStart);
    const end = new Date(range.dateRangeEnd);

    const voucher = await Check.findAll({
      where: {
        ChiefAccountSignature: {
          [Sequelize.Op.not]: null,
        },
        ChiefAdminSignature: {
          [Sequelize.Op.not]: null,
        },
        createdAt: {
          [Sequelize.Op.between]: [start, end],
        },
      },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: {
            parent_id: null,
            voucherType: voucherType,
          },

          required: false,
          include: [
            {
              model: CheckItem,
              as: "children",
            },
          ],
        },
      ],
    });

    if (range.is_already_have_subdata === false) {
      voucher?.map((v) => {
        v.items?.map((item) => {
          item?.children?.map(async (c) => {
            await insertCashbooks(
              {
                date: item.payment_voucher_date,
                job_No: item.job,
                payee_payer_no: item.payment_item,
                payee_payer: item.title,
                description: c.title,
                payment: c.amount,
              },
              item.voucherType,
              cashbookId,
            );
          });
        });
      });

      range.is_already_have_subdata = true;
      range.save();
    }

    return NextResponse.json({ message: "Success Inserted", voucher });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

// update changes date range
export async function PATCH(request, { params }) {
  const { cashbookId } = await params;
  try {
  } catch (err) {
    return NextResponse.json({ message });
  }
}

//get change all
export async function GET(request, { params }) {
  const { cashbookId } = await params;

  try {
    const cashbookcurrency = await CashBooks.findOne({
      where: {
        cashbook_id: cashbookId,
      },
      attributes: [
        "currency",
        "category",
        "createdAt",
        "A_C_No",
        "project_code",
        "balance_brought_forward_from_previous_month",
        "receipt_brought_forward_from_previous_month",
        "payment_brought_forward_from_previous_month",
        "balance_carried_forward_to_next_month",
        "receipt_carried_forward_to_next_month",
        "payment_carried_forward_to_next_month",
      ],
    });
    // model
    const CashbookModel =
      cashbookcurrency.currency === "PH" ? PH_Cash_Bank : US_Cash_Bank;

    const cashbooksDetails = await CashbookModel.findAll({
      where: {
        cashbook_id: cashbookId,
      },
    });
    return NextResponse.json({
      cashbooksDetails,
      currency: cashbookcurrency.currency,
      category: cashbookcurrency.category,
      createdAt: cashbookcurrency.createdAt,
      A_C_No: cashbookcurrency.A_C_No,
      project_code: cashbookcurrency.project_code,
      balance_brought_forward_from_previous_month:
        cashbookcurrency.balance_brought_forward_from_previous_month,

      receipt_brought_forward_from_previous_month:
        cashbookcurrency.receipt_brought_forward_from_previous_month,

      payment_brought_forward_from_previous_month:
        cashbookcurrency.payment_brought_forward_from_previous_month,
      balance_carried_forward_to_next_month:
        cashbookcurrency.balance_carried_forward_to_next_month,
      receipt_carried_forward_to_next_month:
        cashbookcurrency.receipt_carried_forward_to_next_month,
      payment_carried_forward_to_next_month:
        cashbookcurrency.payment_carried_forward_to_next_month,
    });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
