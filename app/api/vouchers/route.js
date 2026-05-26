import sequelize from "@/db/connection";
import { Check, CheckItem } from "@/db/models";
import { validateFields } from "@/functions/validations";

import { NextResponse } from "next/server";
import { Op } from "sequelize";
export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit; // skip page
  try {
    // earliest and latest
    const date = await Check.findOne({
      attributes: [
        [
          sequelize.Sequelize.fn("MIN", sequelize.col("createdAt")),
          "earliestDate",
        ],
        [
          sequelize.Sequelize.fn("MAX", sequelize.col("createdAt")),
          "latestDate",
        ],
      ],
    });
    const startParam = searchParams.get("dateStart");
    const endParam = searchParams.get("dateEnd");
    const rangeStart = startParam
      ? `${startParam} 00:00:00`
      : date.dataValues.earliestDate;
    const rangeEnd = endParam
      ? `${endParam} 23:59:59`
      : date.dataValues.latestDate;

    const { rows, count } = await Check.findAndCountAll({
      offset: offset,
      limit: limit,
      distinct: true,
      order: [["id", "DESC"]],
      where: {
        createdAt: {
          [Op.between]: [rangeStart, rangeEnd],
        },
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
    });
    return NextResponse.json(
      {
        data: rows,
        total: count,
        page,
        rangeStart,
        rangeEnd,
        totalPages: Math.ceil(count / limit),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
export async function POST(request) {
  const transaction = await sequelize.transaction();
  try {
    //payload =
    const body = await request.json();
    // validation
    // VoucherID Number of payments voucher
    const error_message = await validateFields(
      ["VoucherID", "NoPayments"],
      body,
    );

    if (Object.keys(error_message).length > 0) {
      return NextResponse.json({ error_message }, { status: 400 });
    }

    // create
    const parent = await Check.create({
      checkId: body.VoucherID,
    });

    if (body.NoPayments > 0) {
      // loops
      const checkItemsData = Array.from(
        { length: body.NoPayments },
        (_, i) => ({
          check_id: parent.id,
          parent_id: null,
          amount: 0,
        }),
      );
      await CheckItem.bulkCreate(checkItemsData, { transaction });
    }

    await transaction.commit();
    return NextResponse.json(
      { message: "Successfully Created" },
      { status: 200 },
    );
  } catch (err) {
    await transaction.rollback();
    return NextResponse.json({ error_message: err.message }, { status: 500 });
  }
}
