"use server";
import { AccountCode, Check, CheckItem, Creditor, GLcode } from "@/db/models";
import { NextResponse } from "next/server";
import { json, Sequelize } from "sequelize";

import fs from "fs/promises";
import path from "path";

import { revalidatePath } from "next/cache";

export async function clearCreditors() {
  try {
    await Creditor.destroy({
      where: {},
      truncate: true,
      force: true,
    });

    revalidatePath("/creditors");

    return {
      success: true,
      message: "All creditors deleted.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to clear creditors.",
    };
  }
}
export async function UpdateAttachment({ id, file }) {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Unique filename
    const fileName = `${Date.now()}-${file.name}`;

    // Save to public/uploads
    const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

    await fs.writeFile(uploadPath, buffer);

    // Save URL/path to DB
    await Check.update(
      {
        cheque_attachment: `/uploads/${fileName}`,
      },
      {
        where: { id },
      },
    );

    return {
      success: true,
      path: `/uploads/${fileName}`,
    };
  } catch (err) {
    console.log(err);
    return {
      error_message: err.message,
    };
  }
}
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
      isRejected: false,
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
    "US Cash": "001I2",
    "PH Bank": "003N1",
    "PH Cash": "001I1",
  };
  return {
    code: data[voucherType],
  };
}
export async function GetCashAndBankNo(voucherType) {
  const data = {
    "BANK USD": "003N2",
    "CASH USD": "001I2",
    "CASH PHP": "001I1",
    "BANK PHP": "003N1",
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

export async function TotalAmount(data) {
  return { data };
}

export async function GetChiefAccountantSign({ id }) {
  const chiefAccountant = await Check.findOne({
    where: { id: id },
  });
  // console.log(chiefAccountant);

  return {
    signature: chiefAccountant?.ChiefAccountSignature,
  };
}
