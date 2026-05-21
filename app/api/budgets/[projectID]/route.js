import sequelize from "@/db/connection";
import { BudgetItems, BudgetValue } from "@/db/models";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const transaction = await sequelize.transaction();

  //  return NextResponse.json({message: JSON.stringify(params)});
  try {
    const body = await request.json();
    const { cleanSave } = body;
    const { projectID } = await params;
    const projectId = projectID;
    // get old items
    const existingItem = await BudgetItems.findAll({
      where: {
        project_id: projectId,
      },
      transaction,
    });
    const ids = existingItem.map((i) => i.id);
    // delete old values
    await BudgetValue.destroy({
      where: {
        budget_item_id: ids,
      },
      transaction,
    });
    // delete old items
    await BudgetItems.destroy({
      where: {
        project_id: projectId,
      },
      transaction,
    });

    // recursive save
    const saveItems = async (list, parentId = null) => {
      for (const item of list) {
        // create item
        const created = await BudgetItems.create(
          {
            code: item.code,
            description: item.description,
            level: item.level,
            parent_id: parentId,
            project_id: projectId,
          },
          {
            transaction,
          },
        );
        //create values
        if (item.values) {
          await BudgetValue.create(
            {
              approved_unit: item.values.approved_unit,
              approved_rate: item.values.approved_rate,
              approved_qty: item.values.approved_qty,
              approved_amount: item.values.approved_amount,

              revision_qty: item.values.revision_qty,
              revision_rate: item.values.revision_rate,
              revision_cost: item.values.revision_cost,

              prev_qty: item.values.prev_qty,
              prev_amount: item.values.prev_amount,

              month_qty: item.values.month_qty,
              month_amount: item.values.month_amount,

              cumulative_qty: item.values.cumulative_qty,
              cumulative_amount: item.values.cumulative_amount,

              remaining_qty: item.values.remaining_qty,
              remaining_amount: item.values.remaining_amount,
              budget_item_id: created.id,
            },
            {
              transaction,
            },
          );
        }
        //save children
        if (item.children?.length > 0) {
          await saveItems(item.children, created.id);
        }
      }
    };
    await saveItems(cleanSave);
    //commit

    await transaction.commit();

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    console.log(err.message);
    return NextResponse.json(
      {
        success: false,
        error_message: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
