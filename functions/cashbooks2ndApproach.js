"use server";
import { Sequelize } from "sequelize";
import { CashBooks, PH_Cash_Bank, US_Cash_Bank } from "../db/models/index.js";
import sequelize from "../db/connection.js";

import { validateRequiredFields } from "./validations.js";
import { Op } from "sequelize";

export async function createCashbookEntry(rangeStart, rangeEnd) {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const startOfNextMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1,
    );

    /*
      Check kung may cashbook na ngayong buwan
    */
    const existingThisMonth = await CashBooks.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth,
        },
      },
    });

    /*
      Auto approve
    */
    if (existingThisMonth > 0) {
      return {
        success: true,
        autoApprove: true,
        message: "Cashbooks already exist this month.",
      };
    }

    /*
      Exact duplicate validation
    */
    const duplicate = await CashBooks.count({
      where: {
        dateRangeStart: new Date(rangeStart),
        dateRangeEnd: new Date(rangeEnd),
      },
    });

    if (duplicate > 0) {
      return {
        success: false,
        message: "This date range already exists.",
      };
    }

    const combinations = [
      { currency: "PH", category: "Cash" },
      { currency: "PH", category: "Bank" },
      { currency: "US", category: "Cash" },
      { currency: "US", category: "Bank" },
    ];

    const created = [];

    for (const combination of combinations) {
      const cashbook = await CashBooks.create({
        currency: combination.currency,
        category: combination.category,
        dateRangeStart: rangeStart,
        dateRangeEnd: rangeEnd,
      });

      created.push(cashbook);
    }

    return {
      success: true,
      autoApprove: false,
      message: "Cashbooks created successfully.",
      cashbooks: created,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: error.message,
    };
  }
}
// get cashbooks entry
export async function getCashbookGroups() {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const startOfNextMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1,
    );

    const cashbooks = await CashBooks.findAll({
      attributes: [
        [Sequelize.fn("MIN", Sequelize.col("cashbook_id")), "group_id"],
        "dateRangeStart",
        "dateRangeEnd",
        [Sequelize.fn("COUNT", "*"), "total"],
      ],
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth,
        },
      },
      group: ["dateRangeStart", "dateRangeEnd"],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return {
      success: true,
      cashbooks,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}
export async function hasCashbookThisMonth() {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const startOfNextMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1,
    );

    const count = await CashBooks.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth,
        },
      },
    });

    return {
      success: true,
      exists: count > 0,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}
export async function insertCashbooks(
  cashbookDetailed,
  voucherType,
  cashbookID,
) {
  const dbTransaction = await sequelize.transaction();

  try {
    const seperate = voucherType.split(" ");
    const currency = seperate[1];
    const cashBankModel = currency === "PHP" ? PH_Cash_Bank : US_Cash_Bank;

    const cashBankEntry = await cashBankModel.create(
      {
        cashbook_id: cashbookID,
        date: cashbookDetailed.date,
        job_No: cashbookDetailed.job_No,
        payee_payer: cashbookDetailed.payee_payer,
        payee_payer_no: cashbookDetailed.payee_payer_no,
        description: cashbookDetailed.description,
        payment: cashbookDetailed.payment,
      },
      { transaction: dbTransaction },
    );

    await dbTransaction.commit();

    return {
      success: true,
      message: "Cashbook entry created successfully",
      cashbookID,
      cashBankEntry,
    };
  } catch (err) {
    await dbTransaction.rollback();
    console.log("error", err.message);
    return {
      success: false,
      message: "Error creating cashbook entry",
      error: err.message,
    };
  }
}
