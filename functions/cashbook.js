"use server";
import { Sequelize } from "sequelize";
import {
  CashBooks,
  PH_Cash_Bank,
  US_Cash_Bank,
  CheckItem,
  Check,
  Creditor,
} from "../db/models/index.js";
import sequelize from "../db/connection.js";

import { validateRequiredFields } from "./validations.js";
import { Op } from "sequelize";

export async function createCashbookEntry() {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    const startOfNextMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1,
    );

    const combinations = [
      { currency: "PH", category: "Cash" },
      { currency: "PH", category: "Bank" },
      { currency: "US", category: "Cash" },
      { currency: "US", category: "Bank" },
    ];

    for (const combination of combinations) {
      const cashbook = await CashBooks.findOne({
        where: {
          currency: combination.currency,
          category: combination.category,
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: startOfNextMonth,
          },
        },
      });

      if (!cashbook) {
        await CashBooks.create({
          project: "9665R7268",
          currency: combination.currency,
          category: combination.category,

          // default range ng current month
          dateRangeStart: startOfMonth,
          dateRangeEnd: endOfMonth,
        });
      }
    }

    return {
      success: true,
      message: "Cashbook entries checked successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
}
export async function insertCashbooks(
  cashbookDetailed,
  voucherType,
  cashbookID,
) {
  // const validation = validateRequiredFields(
  //   {
  //     date: cashbookDetailed.date,
  //     job_No: cashbookDetailed.job_No,
  //     payee_payer: cashbookDetailed.payee_payer,
  //     payee_payer_no: cashbookDetailed.payment_item,
  //     description: cashbookDetailed.description,
  //     payment: cashbookDetailed.payment,
  //   },
  //   [
  //     {
  //       name: "date",
  //       label: "Date",
  //       required: true,
  //       type: "date",
  //     },
  //     {
  //       name: "job_No",
  //       label: "Job No",
  //       required: true,
  //     },
  //     {
  //       name: "payee_payer_no",
  //       label: "Payee/Payer No",
  //       required: true,
  //     },
  //     {
  //       name: "amount",
  //       label: "Amount",
  //       required: true,
  //       type: "number",
  //       min: 0,
  //     },
  //   ],
  // );

  // if (!validation.isValid) {
  //   return {
  //     success: false,
  //     message: "Validation failed",
  //     errors: validation.errors,
  //   };
  // }

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
// export async function insertMissingCashbookEntries(cashbookId) {
//   try {
//     const range = await CashBooks.findByPk(cashbookId, {
//       attributes: [
//         "cashbook_id",
//         "dateRangeStart",
//         "dateRangeEnd",
//         "currency",
//         "category",
//       ],
//     });

//     if (!range) {
//       return {
//         success: false,
//         message: "Cashbook not found",
//       };
//     }

//     const voucherType = `${range.category.toUpperCase()} ${
//       range.currency === "PH" ? "PHP" : "USD"
//     }`;

//     const CashBankModel = range.currency === "PH" ? PH_Cash_Bank : US_Cash_Bank;

//     const checks = await Check.findAll({
//       where: {
//         ChiefAccountSignature: {
//           [Op.not]: null,
//         },
//         ChiefAdminSignature: {
//           [Op.not]: null,
//         },
//       },
//       include: [
//         {
//           model: CheckItem,
//           as: "items",
//           required: true,
//           where: {
//             parent_id: null,
//             voucherType,
//             payment_voucher_date: {
//               [Op.between]: [range.dateRangeStart, range.dateRangeEnd],
//             },
//           },
//           include: [
//             {
//               model: CheckItem,
//               as: "children",
//             },
//           ],
//         },
//       ],
//     });
//     let inserted = 0;

//     for (const check of checks) {
//       for (const item of check.items) {
//         for (const child of item.children) {
//           /*
//             duplicate checking
//           */
//           const existing = await CashBankModel.findOne({
//             where: {
//               cashbook_id: cashbookId,
//               slipNo: id,
//               date: item.payment_voucher_date,
//               description: child.title,
//               payment: item.receiptOrPayment === "payment" ? child.amount : 0,
//               receipt: item.receiptOrPayment === "receipt" ? child.amount : 0,
//             },
//           });

//           if (existing) {
//             continue;
//           }

//           await CashBankModel.create({
//             cashbook_id: cashbookId,

//             date: item.payment_voucher_date,

//             description: child.title,

//             A_C_code: item.accountCode,

//             job_No: item.job,

//             receipt: item.receiptOrPayment === "receipt" ? child.amount : 0,

//             payment: item.receiptOrPayment === "payment" ? child.amount : 0,

//             glCount: item.glCode,

//             Claimable: check.claimable ? "Claimable" : "Non-Claimable",
//           });

//           inserted++;
//         }
//       }
//     }

//     return {
//       success: true,
//       inserted,
//       message: `${inserted} entries inserted.`,
//     };
//   } catch (err) {
//     console.log(err);

//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// }
export async function insertMissingCashbookEntries(cashbookId) {
  try {
    const range = await CashBooks.findByPk(cashbookId, {
      attributes: [
        "cashbook_id",
        "dateRangeStart",
        "dateRangeEnd",
        "currency",
        "category",
      ],
    });

    if (!range) {
      return { success: false, message: "Cashbook not found" };
    }

    const voucherType = `${range.category.toUpperCase()} ${
      range.currency === "PH" ? "PHP" : "USD"
    }`;

    const CashBankModel = range.currency === "PH" ? PH_Cash_Bank : US_Cash_Bank;

    const checks = await Check.findAll({
      where: {
        ChiefAccountSignature: { [Op.not]: null },
        ChiefAdminSignature: { [Op.not]: null },
      },
      include: [
        {
          model: CheckItem,
          as: "items",
          required: true,
          where: {
            parent_id: null,
            voucherType,
            payment_voucher_date: {
              [Op.between]: [range.dateRangeStart, range.dateRangeEnd],
            },
          },
          include: [{ model: CheckItem, as: "children" }],
        },
      ],
    });

    let inserted = 0;

    for (const check of checks) {
      for (const item of check.items) {
        for (const child of item.children) {
          // duplicate check gamit ang check_item_id
          const existing = await CashBankModel.findOne({
            where: {
              cashbook_id: cashbookId,
              check_item_id: child.id,
            },
          });

          if (existing) continue;

          await CashBankModel.create({
            cashbook_id: cashbookId,
            check_item_id: child.id,
            date: item.payment_voucher_date,
            description: child.title,
            A_C_code: item.accountCode,
            payee_payer: item.title,
            CRM: (await getCreditorsNumber(item.tinNumber || "")).code,
            job_No: item.job,
            receipt: item.receiptOrPayment === "receipt" ? child.amount : 0,
            payment: item.receiptOrPayment === "payment" ? child.amount : 0,
            glCount: item.glCode,
            Claimable: check.claimable ? "Claimable" : "Non-Claimable",
          });

          inserted++;
        }
      }
    }

    return {
      success: true,
      inserted,
      message: `${inserted} entries inserted.`,
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: err.message };
  }
}
export async function getCreditors() {
  const data = await Creditor.findAll();

  return {
    dataList: data.map((item) => item.toJSON()),
  };
}

export async function getCreditorsNumber(tin) {
  if (!tin) {
    return { code: "" };
  }

  // e.g. "000-117-296-00000" -> ["000", "117", "296", "00000"]
  const parts = tin.split("-").filter(Boolean);

  let prefix = "";
  let matches = [];

  for (let i = 0; i < parts.length; i++) {
    prefix = prefix ? `${prefix}-${parts[i]}` : parts[i];

    matches = await Creditor.findAll({
      where: {
        tin1: {
          [Op.like]: `${prefix}%`,
        },
      },
    });

    console.log(`prefix: "${prefix}" -> ${matches.length} match(es)`);

    // pag isa na lang natira (o wala na), stop na
    if (matches.length <= 1) {
      break;
    }
  }

  return {
    code: matches[0]?.code || "",
  };
}
