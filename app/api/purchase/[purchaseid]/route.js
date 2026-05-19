import sequelize from "@/db/connection";
import { Purchase, PurchaseItems, ItemsLists, User } from "@/db/models";
import { NextResponse } from "next/server";

// get purchase by id
export async function GET(request, { params }) {
  await sequelize.sync();
  const { purchaseid } = await params;
  try {
    const purchase = await Purchase.findByPk(purchaseid, {
      include: [
        {
          model: PurchaseItems,
        },
        {
          model: User,
          required: true,
        },
      ],
    });
    if (!purchase) {
      return NextResponse.json(
        {
          message: "record not found",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        purchase,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching purchase", error: error.message },
      { status: 500 },
    );
  }
}

// update purchase by id
// PurchaseItems: fields EndingInventoryDate , EndingInventory ,UnitPrice , updatedAt
// Purchase: fields EmployeeSign , ChiefSign , ProjectDirectorSign
// remark , isClaimable

export async function PATCH(request, { params }) {
  // approve pr and find the prid
  const { purchaseid } = await params;
  try {
    const pr = await Purchase.findOne({
      where: {
        PurchaseID: purchaseid,
      },
    });
    if (!pr) {
      return NextResponse.json(
        {
          message: "Not Found",
        },
        { status: 404 },
      );
    } else {
      pr.isOnTheBudget = true;
      await pr.save();
      return NextResponse.json({ message: "Budget Confirm" }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Error Find", error: err.message },
      { status: 500 },
    );
  }
}
