import sequelize from "@/db/connection";
import { Purchase, PurchaseItems, ItemsLists, User } from "@/db/models";
import { createNextApprovalNotification } from "@/functions/notification";
import { updateStatus } from "@/functions/status";
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
    console.log(error.message);
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
  const { purchaseid } = await params;
  const body = await request.json();

  try {
    const pr = await Purchase.findOne({
      where: { PurchaseID: purchaseid },
    });

    if (!pr) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    pr.isOnTheBudget = true;
    pr.PRCode = body.prcode;

    // Update each purchase item's Claimable, TypeOfExpenses, and Remarks
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        await PurchaseItems.update(
          {
            Claimable: item.Claimable,
            TypeOfExpenses: item.TypeOfExpenses,
            Remarks: item.Remarks,
          },
          {
            where: { id: item.id }, // use whatever your PK field is
          },
        );
      }
    }

    const statusResult = await updateStatus("PR Approval", purchaseid);

    await pr.save();

    return NextResponse.json({ message: "Budget Confirm" }, { status: 200 });
  } catch (err) {
    console.log(err.message);
    return NextResponse.json(
      { message: "Error Find", error: err.message },
      { status: 500 },
    );
  }
}
