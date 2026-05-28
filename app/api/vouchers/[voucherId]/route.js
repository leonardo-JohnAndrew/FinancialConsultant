import sequelize from "@/db/connection";
import { Check, CheckItem } from "@/db/models";
import { formatVoucherDate } from "@/functions/formattDate";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { voucherId } = await params;

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
    cash,
    payment_item,
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
        cash,
        payment_voucher_date,
        payment_voucher_formatted_date: formatVoucherDate(payment_voucher_date),
        payment_item,
        job,
        slipNo,
        voucherType,
        pm,
        amount: children
          ? children.reduce((sum, child) => sum + child.amount, 0)
          : 0, // total amount of the children
      },
      { transaction },
    );
    //create children
    if (children && children.length > 0) {
      const childrenData = children.map((child) => ({
        check_id: voucherId,
        parent_id: parentVoucher.id,
        title: child.title,
        amount: child.amount,
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
    });

    // updated js
    specificCheck.checkAmount = specificCheck.items.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    await specificCheck.save({ transaction });
    await transaction.commit();
    return NextResponse.json(
      { message: "Voucher created successfully" },
      { status: 201 },
    );
  } catch (err) {
    transaction.rollback();
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}

// delete check item and its children
export async function DELETE(request, { params }) {
  const { voucherId } = await params;
  const transaction = await sequelize.transaction();
  try {
    // delete children first
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
      cash,
      payment_item,
      payment_voucher_date,
      voucherType,
      slipNo,
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

    // update parent
    await parentVoucher.update(
      {
        title,
        cash,
        payment_item,
        voucherType,
        slipNo,
        payment_voucher_date,
        payment_voucher_formatted_date: formatVoucherDate(payment_voucher_date),
        job,
        pm,
        amount: children
          ? children.reduce((sum, child) => sum + Number(child.amount || 0), 0)
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

    specificCheck.checkAmount = specificCheck.items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

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

    return NextResponse.json(
      {
        error_message: err.message,
      },
      { status: 500 },
    );
  }
}
