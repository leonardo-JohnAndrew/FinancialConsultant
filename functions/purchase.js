"use server";
import sequelize from "@/db/connection";
import { Purchase, PurchaseItems, User } from "@/db/models";
import { Sequelize } from "sequelize";
import { NextResponse } from "next/server";

export async function getItemInfo(item_id, items) {
  const requiredBalance =
    items.find((item) => item.ItemsID === item_id)?.RequiredBalance || 0;
  const unitPrice =
    items.find((item) => item.ItemsID === item_id)?.UnitPrice || 0;
  const unit = items.find((item) => item.ItemsID === item_id)?.Unit || " ";
  return {
    requiredBalance,
    unitPrice,
    unit,
  };
}
export async function calculateQuantity(
  requiredBalance = 0,
  endingInventory = 0,
) {
  const quantity = requiredBalance - endingInventory;
  return quantity > 0 ? quantity : 0;
}

//matching the item id with the item info to get the required balance, unit price, and unit for the purchase submit table
//if item is found return the required balance, unit price, and unit, otherwise return 0 for required balance and unit price, and empty string for unit
export async function getItemInfoForPurchaseSubmit(itemsID, items) {
  /* 
   itemsID = ['11','13']
   items = [
0: {ItemRequiredBalance: 0, ItemUnitPrice: 0, EndingInventory: 0, ItemQuantity: 0, ItemTotal: 0, …},
1: {ItemRequiredBalance: 90, ItemUnitPrice: 300, EndingInventory: 0, ItemQuantity: 90, ItemTotal: 27000, …},
2: undefined,
3: undefined,
4: undefined,
5: undefined,
6: undefined,
7: undefined,
8: undefined,
9: undefined,
10:undefined,
11:{ItemRequiredBalance: 3, ItemUnitPrice: 500, EndingInventory: 2, ItemQuantity: 1, ItemTotal: 500},
12:undefined,
13:{ItemRequiredBalance: 25, ItemUnitPrice: 150, EndingInventory: 2, ItemQuantity: 23, ItemTotal: 3450},
]
*/

  return itemsID.map((id) => {
    const item = items.find((item) => item.ItemsID === Number(id));
    return {
      ItemRequiredBalance: item ? item.ItemRequiredBalance : 0,
      ItemUnitPrice: item ? item.ItemUnitPrice : 0,
      EndingInventory: item ? item.EndingInventory : 0,
      ItemQuantity: item ? item.ItemQuantity : 0,
      ItemTotal: item ? item.ItemTotal : 0,
    };
  });
}

export async function GetSpecificRequest(
  role,
  startParam,
  endParam,
  page,
  limit,
) {
  const offset = (page - 1) * limit;

  const isProjectDirector = role === "Project Director";
  const isAdmin = role === "Admin";
  const isChiefAdmin = role === "Chief Administrator Manager";

  // -----------------------------
  // 1. ROLE BASE CONDITION
  // -----------------------------
  const roleConditionMap = {
    "Chief Administrator Manager": {
      ProjectDirectorSign: null,
      ChiefAdminManageSign: null,
    },
    "Project Director": {
      ProjectDirectorSign: null,
    },
    Admin: {
      AdminSign: null,
      ProjectDirectorSign: null,
    },
  };

  const baseCondition = roleConditionMap[role];

  if (!baseCondition) {
    return NextResponse.json(
      { error_message: "UnAuthorized Access" },
      { status: 401 },
    );
  }

  try {
    // -----------------------------
    // 2. DATE RANGE
    // -----------------------------
    const date = await Purchase.findOne({
      attributes: [
        [Sequelize.fn("MIN", Sequelize.col("createdAt")), "earliestDate"],
        [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestDate"],
      ],
    });

    const earliestDate = date?.dataValues?.earliestDate || new Date();
    const latestDate = date?.dataValues?.latestDate || new Date();

    const rangeStart = startParam ? `${startParam} 00:00:00` : earliestDate;

    const rangeEnd = endParam ? `${endParam} 23:59:59` : latestDate;

    // -----------------------------
    // 3. WHERE CLAUSE (CORE RULES)
    // -----------------------------
    const whereClause = {
      ...baseCondition,

      EmployeeSign: {
        [Sequelize.Op.not]: null,
      },

      createdAt: {
        [Sequelize.Op.between]: [rangeStart, rangeEnd],
      },
      isOnTheBudget: 1,
    };

    // -----------------------------
    // 4. CHIEF ADMIN / DIRECTOR FLOW RULE
    // -----------------------------
    if (isProjectDirector) {
      whereClause.AdminSign = {
        [Sequelize.Op.not]: null,
      };
      whereClause.ChiefAdminManageSign = {
        [Sequelize.Op.not]: null,
      };
    } else if (isAdmin) {
      whereClause.ChiefAdminManageSign = null;
    } else if (isChiefAdmin) {
      whereClause.AdminSign = {
        [Sequelize.Op.not]: null,
      };
      whereClause.ChiefAdminManageSign = null;
    }

    // -----------------------------
    // 5. QUERY
    // -----------------------------
    const { rows, count } = await Purchase.findAndCountAll({
      offset,
      limit,
      distinct: true,
      order: [["PurchaseID", "DESC"]],
      where: whereClause,
      include: [{ model: User }, { model: PurchaseItems }],
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
  } catch (error) {
    console.log(error.message);
    return NextResponse.json(
      {
        error_message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
