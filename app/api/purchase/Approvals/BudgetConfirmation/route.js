import sequelize from "@/db/connection";
import { Purchase, User, PurchaseItems } from "@/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit; // skip page
  try {
    const dates = await Purchase.findOne({
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
      : dates.dataValues.earliestDate;
    const rangeEnd = endParam
      ? `${endParam} 23:59:59`
      : dates.dataValues.latestDate;

    const { rows, count } = await Purchase.findAndCountAll({
      offset: offset,
      limit: limit,
      distinct: true,
      order: [["PurchaseID", "DESC"]],
      where: {
        createdAt: {
          [Op.between]: [rangeStart, rangeEnd],
        },
      
      },
      include: [
        { model: User },
        {
          model: PurchaseItems,
        },
      ],
    });

    //  const purchases = await Purchase.findAll({
    //     include: [{
    //      model: User
    //     }],
    //     include: [{
    //         model: PurchaseItems,
    //         include: [{
    //             model: ItemsLists,
    //         }]
    //     }]
    //  });
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
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
