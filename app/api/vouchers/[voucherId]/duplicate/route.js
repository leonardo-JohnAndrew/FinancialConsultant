import { NextResponse } from "next/server";

import { Check, CheckItem } from "@/db/models";
import sequelize from "@/db/connection";

export async function POST(request, { params }) {
  const { voucherId } = await params;
  const transaction = await sequelize.transaction();

  try {
    //  fetch original check + items (parents lang, kasama children)
    const original = await Check.findOne({
      where: { id: voucherId },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: { parent_id: null },
          required: false,
          include: [{ model: CheckItem, as: "children" }],
        },
      ],
      transaction,
    });

    if (!original) {
      await transaction.rollback();
      return NextResponse.json(
        { error_message: "Voucher not found" },
        { status: 404 },
      );
    }

    // gumawa ng bagong Check/Voucher — same data, pero reset approval-related fields
    const newCheck = await Check.create(
      {
        checkId: original.checkId,
        checkAmount: original.checkAmount,
        claimable: original.claimable,
        ChiefAccountSignature: null,
        ChiefAdminSignature: null,
        forApproval: false,
        cheque_attachment: null,
        isRejected: false,
        Reason: null,
      },
      { transaction },
    );

    // kopyahin ang mga parent CheckItem, sabay tandaan ang old->new id mapping
    const parentIdMap = {}; // oldParentId -> newParentId

    for (const parent of original.items || []) {
      const newParent = await CheckItem.create(
        {
          check_id: newCheck.id,
          parent_id: null,
          slipNo: parent.slipNo,
          title: parent.title,
          amount: parent.amount,
          payment_voucher_date: parent.payment_voucher_date,
          job: parent.job,
          accountCode: parent.accountCode,
          glCode: parent.glCode,
          voucherTypeNumber: parent.voucherTypeNumber,
          voucherType: parent.voucherType,
          receiptOrPayment: parent.receiptOrPayment,
          tinNumber: parent.tinNumber,
          payment_voucher_formatted_date: parent.payment_voucher_formatted_date,
        },
        { transaction },
      );

      parentIdMap[parent.id] = newParent.id;

      // kopyahin ang mga children ng parent na ito
      for (const child of parent.children || []) {
        await CheckItem.create(
          {
            check_id: newCheck.id,
            parent_id: newParent.id,
            slipNo: child.slipNo,
            title: child.title,
            amount: child.amount,
            payment_voucher_date: child.payment_voucher_date,
            job: child.job,
            accountCode: child.accountCode,
            glCode: child.glCode,
            voucherTypeNumber: child.voucherTypeNumber,
            voucherType: child.voucherType,
            receiptOrPayment: child.receiptOrPayment,
            tinNumber: child.tinNumber,
            payment_voucher_formatted_date:
              child.payment_voucher_formatted_date,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    return NextResponse.json(
      { message: "Voucher duplicated successfully", data: newCheck },
      { status: 201 },
    );
  } catch (err) {
    await transaction.rollback();
    console.error("Error duplicating voucher", err);
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
