import sequelize from "@/db/connection";
import { Check, CheckItem } from "@/db/models";
import { formatVoucherDate } from "@/functions/formattDate";
import { TotalAmount } from "@/functions/vouchers";
import { NextResponse } from "next/server";

function computeCheckAmount(items) {
  return items.reduce((sum, item) => {
    const amount = Number(item.amount || 0);

    switch (item.receiptOrPayment?.toLowerCase()) {
      case "payment":
        return sum + amount;

      case "receipt":
        return sum - amount;

      default:
        return sum;
    }
  }, 0);
}
export async function GET(request, { params }) {
  const { voucherId } = await params;
  ``;
  try {
    const specificCheck = await Check.findOne({
      where: { id: voucherId },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: {
            parent_id: null,
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
    return NextResponse.json({ specificCheck }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
export async function POST(request, { params }) {
  const body = await request.json();
  // use transacttion
  const transaction = await sequelize.transaction();
  // find the voucher/check id
  const { voucherId } = await params;
  const {
    title,
    receiptOrPayment,
    voucherTypeNumber,
    tinNumber,
    accountCode,
    glCode,
    payment_voucher_date,
    voucherType,
    slipNo,
    job,
    pm,
    children,
  } = body;
  // validation requirements
  try {
    // parent
    // create parent
    const parentVoucher = await CheckItem.create(
      {
        check_id: voucherId,
        parent_id: null,
        title,
        receiptOrPayment,
        voucherTypeNumber,
        payment_voucher_date,
        payment_voucher_formatted_date: formatVoucherDate(payment_voucher_date),
        accountCode,
        tinNumber,
        glCode,
        job,
        slipNo,
        voucherType,
        pm,
        amount:
          children ?
            children.reduce((sum, child) => sum + Number(child.amount || 0), 0)
          : 0,
      },
      { transaction },
    );
    console.log(JSON.stringify(children));
    //create children
    if (children && children.length > 0) {
      const childrenData = children.map((child) => ({
        check_id: voucherId,
        parent_id: parentVoucher.id,
        title: child.title,
        amount: child.amount,
        payment_voucher_date,
        payee_name: title,
      }));
      await CheckItem.bulkCreate(childrenData, { transaction });
    }

    // where clause totalAccount
    const specificCheck = await Check.findOne({
      where: { id: voucherId },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: {
            parent_id: null,
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
      transaction,
    });

    // updated js
    specificCheck.checkAmount = computeCheckAmount(specificCheck.items);

    await specificCheck.save({ transaction });
    await transaction.commit();
    return NextResponse.json(
      { message: "Voucher created successfully" },
      { status: 201 },
    );
  } catch (err) {
    transaction.rollback();
    console.log(err.message);
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

// delete check item and its children
export async function DELETE(request, { params }) {
  const { voucherId } = await params;
  const transaction = await sequelize.transaction();

  try {
    // get parent voucher first
    const voucher = await CheckItem.findByPk(voucherId, {
      transaction,
    });

    if (!voucher) {
      await transaction.rollback();

      return NextResponse.json(
        { error_message: "Voucher not found" },
        { status: 404 },
      );
    }

    const checkId = voucher.check_id;

    // delete children
    await CheckItem.destroy({
      where: {
        parent_id: voucherId,
      },
      transaction,
    });

    // delete parent
    await CheckItem.destroy({
      where: {
        id: voucherId,
      },
      transaction,
    });

    // get updated check
    const specificCheck = await Check.findOne({
      where: {
        id: checkId,
      },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: {
            parent_id: null,
          },
          required: false,
        },
      ],
      transaction,
    });

    // recompute
    specificCheck.checkAmount = specificCheck.items.reduce((sum, item) => {
      const amount = Number(item.amount || 0);

      if (item.receiptOrPayment?.toLowerCase() === "payment") {
        return sum + amount;
      }

      if (item.receiptOrPayment?.toLowerCase() === "receipt") {
        return sum - amount;
      }

      return sum;
    }, 0);

    await specificCheck.save({ transaction });

    await transaction.commit();

    return NextResponse.json(
      { message: "Check item and its children deleted successfully" },
      { status: 200 },
    );
  } catch (err) {
    await transaction.rollback();

    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
export async function PATCH(request, { params }) {
  const { voucherId } = await params;
  try {
    const check = await Check.findByPk(voucherId);
    if (!check) {
      return NextResponse.json(
        { error_message: "Check item not found" },
        { status: 404 },
      );
    }
    // update for approval
    await check.update({ forApproval: true });
    return NextResponse.json(
      { message: "Check item marked for approval successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
export async function PUT(request, { params }) {
  const transaction = await sequelize.transaction();

  try {
    const body = await request.json();

    const { voucherId } = await params;

    const {
      title,
      receiptOrPayment,
      voucherTypeNumber,
      accountCode,
      glCode,
      payment_voucher_date,
      voucherType,
      slipNo,
      job,
      tinNumber,
      pm,
      children,
    } = body;

    // find parent voucher
    const parentVoucher = await CheckItem.findByPk(voucherId, {
      include: [
        {
          model: CheckItem,
          as: "children",
        },
      ],
      transaction,
    });

    if (!parentVoucher) {
      await transaction.rollback();

      return NextResponse.json(
        { error_message: "Voucher not found" },
        { status: 404 },
      );
    }
    console.log("data", parentVoucher);
    // update parent
    await parentVoucher.update(
      {
        title,
        voucherTypeNumber,
        accountCode,
        glCode,
        voucherType,
        receiptOrPayment,
        tinNumber,
        slipNo,
        payment_voucher_date,
        payment_voucher_formatted_date: formatVoucherDate(payment_voucher_date),
        job,
        pm,
        amount:
          children ?
            children.reduce((sum, child) => sum + Number(child.amount || 0), 0)
          : 0,
      },
      { transaction },
    );

    // delete old children
    await CheckItem.destroy({
      where: {
        parent_id: parentVoucher.id,
      },
      transaction,
    });

    // recreate children
    if (children && children.length > 0) {
      const childrenData = children.map((child) => ({
        check_id: parentVoucher.check_id,
        parent_id: parentVoucher.id,
        title: child.title,
        amount: child.amount,
      }));

      await CheckItem.bulkCreate(childrenData, {
        transaction,
      });
    }

    // recompute total check amount
    const specificCheck = await Check.findOne({
      where: {
        id: parentVoucher.check_id,
      },
      include: [
        {
          model: CheckItem,
          as: "items",
          where: {
            parent_id: null,
          },
          required: false,
        },
      ],
      transaction,
    });

    specificCheck.checkAmount = computeCheckAmount(specificCheck.items);

    await specificCheck.save({ transaction });

    await transaction.commit();

    return NextResponse.json(
      {
        message: "Voucher updated successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    await transaction.rollback();
    console.log(err.message);
    return NextResponse.json(
      {
        error_message: err.message,
      },
      { status: 500 },
    );
  }
}
