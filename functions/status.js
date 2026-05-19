import { Purchase } from "@/db/models/index.js";

export async function updateStatus(status, PRCODE) {
  //Update
  try {
    const user = await Purchase.findOne({
      where: {
        PurchaseID: PRCODE,
      },
    });

    if (user !== undefined || user !== null) {
      user.Status = status;
    }

    await user.save();
    return true;
  } catch (err) {
    return false;
  }
}
