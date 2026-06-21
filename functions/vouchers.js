"use server";
import { AccountCode, Check, CheckItem, GLcode } from "@/db/models";
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

export async function GetAccountCode() {
  const data = await AccountCode.findAll();

  return {
    dataList: data.map((item) => item.toJSON()),
  };
}
export async function GetGLCode() {
  const data = await GLcode.findAll();

  return {
    dataList: data.map((item) => item.toJSON()),
  };
}

export async function GetCashbookHeaders(voucherType) {
  const data = {
    "US Bank": "ZPA-USD1",
    "US Cash": "ZPC-USD1",
    "PH Bank": "ZPA-LC1",
    "PH Cash": "ZPC-LC1",
  };
  return {
    code: data[voucherType],
  };
}
export async function GetCashNo(voucherType) {
  const data = {
    "US Bank": "033N2",
    "US Cash": "001|2",
    "PH Bank": "003N1",
    "PH Cash": "001|1",
  };
  return {
    code: data[voucherType],
  };
}
export async function GetCashAndBankNo(voucherType) {
  const data = {
    "BANK USD": "033N2",
    "CASH USD": "001|2",
    "CASH PHP": "003N1",
    "BANK PHP": "001|1",
  };
  return {
    code: data[voucherType],
  };
}
export async function GetBDONo(voucherType) {
  const data = {
    "PH Bank": "BDO#005798014647",
    "US BANK": "BD0#105790173323",
  };

  return {
    code: data[voucherType],
  };
}
