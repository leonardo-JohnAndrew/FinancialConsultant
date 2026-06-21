import {
  CashBooks,
  Check,
  CheckItem,
  PH_Cash_Bank,
  US_Cash_Bank,
} from "@/db/models";
import sequelize from "@/db/connection";
import { insertMissingCashbookEntries } from "@/functions/cashbook";
import { NextResponse } from "next/server";

import { Sequelize, Transaction, where } from "sequelize";

// update changes date range
export async function PATCH(request, { params }) {
  const { cashbookId } = await params;

  const body = await request.json();
  console.log(body);
  try {
    const cashbook = await CashBooks.findByPk(cashbookId);

    cashbook.dateRangeStart = body.dateRangeStart;
    cashbook.dateRangeEnd = body.dateRangeEnd;

    await cashbook.save();

    const result = await insertMissingCashbookEntries(cashbookId);

    return NextResponse.json({
      message: "Range updated successfully",
      inserted: result.inserted,
    });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error: err }, { status: 500 });
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

export async function PUT(request, { params }) {
  const { cashbookId } = await params;
  const body = await request.json();

  const transaction = await sequelize.transaction();

  try {
    const currency = await CashBooks.findOne({
      where: {
        cashbook_id: cashbookId,
      },
      attribute: ["currency"],
      transaction,
    });
    await CashBooks.update(
      {
        project_code: body.project_code,
        A_C_No: body.A_C_No,

        balance_brought_forward_from_previous_month:
          body.balance_brought_forward_from_previous_month,

        receipt_brought_forward_from_previous_month:
          body.receipt_brought_forward_from_previous_month,

        payment_brought_forward_from_previous_month:
          body.payment_brought_forward_from_previous_month,

        balance_carried_forward_to_next_month:
          body.balance_carried_forward_to_next_month,

        receipt_carried_forward_to_next_month:
          body.receipt_carried_forward_to_next_month,

        payment_carried_forward_to_next_month:
          body.payment_carried_forward_to_next_month,
      },
      {
        where: {
          cashbook_id: cashbookId,
        },
        transaction,
      },
    );

    const Model = currency.currency === "PH" ? PH_Cash_Bank : US_Cash_Bank;

    for (const item of body.cashbooksDetails) {
      await Model.update(
        {
          slipNo: item.slipNo,
          date: item.date,
          description: item.description,
          A_C_code: item.A_C_code,
          job_No: item.job_No,
          reference_no: item.reference_no,
          payee_payer_no: item.payee_payer_no,
          payee_payer: item.payee_payer,
          receipt: item.receipt,
          payment: item.payment,
          balance: item.balance,
          CRM: item.CRM,

          others: item.others,
          glCount: item.glCount,

          SIno: item.SIno,
          A_ORNo: item.A_ORNo,
          company: item.company,
          Claimable: item.Claimable,
          code_invoice_DOTR: item.code_invoice_DOTR,
          reimbursable_description: item.reimbursable_description,
        },
        {
          where: {
            id: item.id,
          },
          transaction,
        },
      );
    }

    await transaction.commit();

    return NextResponse.json({
      success: true,
      message: "Cashbook updated successfully",
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cashbook",
      },
      {
        status: 500,
      },
    );
  }
}
