"use server";
import { Sequelize } from "sequelize";
import {
  CashBooks,
  Check,
  CheckItem,
  PH_Cash_Bank,
  US_Cash_Bank,
} from "../db/models/index.js";
import sequelize from "../db/connection.js";

export async function cashbooks(voucherType) {
  const transaction = await sequelize.transaction();

  try {
    // get all check/voucher by voucher type
    const vouchers = await Check.findAll({
      include: [
        {
          model: CheckItem,
          as: "items",
          attributes: [
            "voucherType",
            "id",
            "slipNo",
            "payment_item",
            "payment_voucher_date",
            "job",
            "parent_id",
            "amount",
          ],

          //   where: {
          //     voucherType,
          //     parent_id: {
          //       [Sequelize.Op.not]: null,
          //     },
          //   },

          required: false,

          include: [
            {
              model: CheckItem,
              as: "children",

              attributes: [
                "voucherType",
                "id",
                "slipNo",
                "payment_item",
                "payment_voucher_date",
                "job",
                "parent_id",
                "amount",
              ],
            },
          ],
        },
      ],
    });

    const [category, currency] = voucherType.split(" ");
    console.log(currency);

    let cashbook;
    let childCashbook;
    let childParent;
    switch (currency) {
      case "PHP":
        // create cashbook
        cashbook = await CashBooks.create(
          {
            PH,
            category,
          },
          { transaction },
        );
        if (vouchers?.length > 0) {
          vouchers.map((child) => {
            if (child.items?.length > 0) {
              child.items.map(async (item) => {
                childCashbook = item.children?.map((ch) => ({
                  cashbook_id: 3,
                  date: item.payment_voucher_date,
                  job_No: item.job,
                  payee_payer_no: item.payment_item,
                  payee_payer: item.title,
                  payment: item.amount,
                }));
                if (vouchers?.length > 0) {
                  childCashbook = vouchers.map((child) => ({
                    cashbook_id: cashbook.cashbook_id,
                    date: child.payment_voucher_date,
                    job_No: child.job,
                    payee_payer_no: child.payee_name,
                    amount: child.amount,
                  }));
                  await US_Cash_Bank.bulkCreate(childCashbook, {
                    transaction,
                  });
                }
              });
            }
          });
        }

        // create children
        break;

      case "USD":
        // create USD cashbook
        cashbook = await CashBooks.create(
          {
            currency,
            category,
          },
          { transaction },
        );
        // create children

        break;

      default:
        return;
    }

    await transaction.commit();

    return {
      success: true,
    };
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return {
      success: false,
      error: error.message,
    };
  }
}
