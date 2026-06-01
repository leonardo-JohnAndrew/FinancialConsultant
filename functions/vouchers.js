"use server";
import { Check, CheckItem } from "@/db/models";
import { NextResponse } from "next/server";
import { Sequelize } from "sequelize";

export async function GetFilterizeVoucher(
  role,
  startParam,
  endParam,
  page,
  limit,
) {
  const offset = (page - 1) * limit;
  // permisions
  const isChiefAccountant = role === "Chief Accountant";
  const isChiefAdministrator = role === "Chief Admin";

  //role base condtions
  const roleConditionMap = {
    "Chief Accountant": {},
    "Chief Admin": {},
  };

  const baseCondition = roleConditionMap[role];

  if (!baseCondition) {
    return NextResponse.json(
      { error_message: "UnAuthorized Access" },
      { status: 401 },
    );
  }

  try {
    // date Range

    const date = await Check.findOne({
      attributes: [
        [Sequelize.fn("MIN", Sequelize.col("createdAt")), "earliestDate"],
        [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestDate"],
      ],
    });

    const earliestDate = date?.dataValues?.earliestDate || new Date();
    const latestDate = date?.dataValues?.latestDate || new Date();

    const rangeStart = startParam ? `${startParam} 00:00:00` : earliestDate;

    const rangeEnd = endParam ? `${endParam} 23:59:59` : latestDate;

    // Where clause
    const whereClause = {
      ...baseCondition,

      createdAt: {
        [Sequelize.Op.between]: [rangeStart, rangeEnd],
      },

      forApproval: true,
    };

    // role flow rules
    if (isChiefAdministrator) {
      whereClause.ChiefAccountSignature = {
        [Sequelize.Op.not]: null,
      };
    }

    // query
    const { rows, count } = await Check.findAndCountAll({
      offset,
      limit,
      distinct: true,
      order: [["id", "DESC"]],
      where: whereClause,
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
        limit,
        rangeStart,
        rangeEnd,
        totalPages: Math.ceil(count / limit),
        message: `${role} purchase request fetched successfully`,
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      {
        error_message: err.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
