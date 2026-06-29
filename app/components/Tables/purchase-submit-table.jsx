"use client";
import React, { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/functions/formatCurrency";
import AutoSuggestInput from "../modals/autosuggested";
import useUserContext from "@/hooks/Context/UserContext";
import axios from "axios";

const PurchaseSubmitTable = React.memo((props) => {
  const {
    item,
    setItemIds,
    itemIds,
    setItemInfo,
    itemInfo,
    setData,
    setEndingInventoryDate,
  } = props;

  const { user } = useUserContext();
  const [listItem, setListItem] = useState([]);
  const [unit, setUnit] = useState([]);

  // ✅ ALL hooks taas pa ng early return — Rules of Hooks
  useEffect(() => {
    if (!item || item.length === 0) return;
    setListItem(item.map((i) => i.ItemName));
  }, [item]);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await axios.get("/api/purchase/items/suggested");
        if (res.status === 200) {
          setUnit(res.data.Unit.map((u) => u.Unit));
        }
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };
    fetchUnit();
  }, []);

  // ✅ useCallback — stable reference, hindi magre-re-render ang React.memo children
  const handleChange = useCallback(
    (index, field, value) => {
      const isAdmin = user?.role === "Admin";

      setItemInfo((prev) => {
        const update = [...prev];
        if (!update[index]) update[index] = {};

        // =========================
        // ITEM SELECT
        // =========================
        if (field === "ItemName") {
          update[index].ItemName = value;

          const selectedItem = item.find(
            (i) =>
              i.ItemName.trim().toLowerCase() === value.trim().toLowerCase(),
          );

          if (selectedItem) {
            update[index] = {
              ...update[index],
              ItemName: selectedItem.ItemName,
              Unit: selectedItem.Unit,
              UnitPrice: selectedItem.UnitPrice,
              isManualQuantity: false,
              ...(isAdmin && {
                RequiredBalance: selectedItem.RequiredBalance || 0,
                EndingInventory: selectedItem.RequiredBalance || 0,
              }),
            };
          }
        } else {
          update[index][field] = value;
          update[index].isManualQuantity = field === "Quantity";
        }

        // =========================
        // ADMIN AUTO LOGIC
        // =========================
        if (isAdmin) {
          const required = parseFloat(update[index].RequiredBalance) || 0;
          const ending = parseFloat(update[index].EndingInventory) || 0;
          if (!update[index].isManualQuantity) {
            update[index].Quantity = required - ending;
          }
        }

        // =========================
        // TOTAL
        // =========================
        const qty = parseFloat(update[index].Quantity) || 0;
        const unitPrice = parseFloat(update[index].UnitPrice) || 0;
        update[index].Total = qty * unitPrice;

        return update;
      });
    },
    // ✅ item at user.role lang ang nagbabago — setItemInfo ay stable mula useState
    [item, user?.role, setItemInfo],
  );

  // ✅ Early return PAGKATAPOS ng lahat ng hooks
  if (!user) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  return (
    <div>
      <table className="border border-gray-300 w-full">
        <thead className="bg-black text-white border-3 border-darkRed sticky top-0 z-10">
          <tr>
            {props.tableHeader.map((header, index) => (
              <th
                key={index}
                className="border-b border-gray-300 text-left px-4 py-2 text-sm font-bold print:text-black"
              >
                {header}
                {header === "ENDING INVENTORY" && (
                  <div className="w-auto pr-10">
                    <input
                      className="bg-gray-300 text-red-500 w-full"
                      name="EndingInventoryDate"
                      onChange={(e) => setEndingInventoryDate(e.target.value)}
                      type="date"
                      defaultValue={
                        props.data.purchase?.purchaseItems[0]
                          ?.EndingInventoryDate
                          ? props.data.purchase.purchaseItems[0].EndingInventoryDate.split(
                              "T",
                            )[0]
                          : ""
                      }
                    />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.data?.map((item, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-4 py-2">{index + 1}</td>

              <td className="px-1 py-2">
                <AutoSuggestInput
                  item={listItem}
                  index={index}
                  onChange={handleChange}
                  name="ItemName"
                  readOnly={false}
                  value={itemInfo[index]?.ItemName || ""}
                />
              </td>

              {user?.role === "Admin" && (
                <>
                  <td>
                    <input
                      type="number"
                      name="ItemRequiredBalance"
                      className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                      value={itemInfo[index]?.RequiredBalance || 0}
                      onChange={(e) =>
                        handleChange(index, "RequiredBalance", e.target.value)
                      }
                      readOnly={!itemInfo[index]?.ItemName}
                      disabled={!itemInfo[index]?.ItemName}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="bg-gray-200 min-w-30 border border-gray-300"
                      name="EndingInventory"
                      type="number"
                      value={itemInfo[index]?.EndingInventory || 0}
                      onChange={(e) =>
                        handleChange(index, "EndingInventory", e.target.value)
                      }
                      readOnly={!itemInfo[index]?.ItemName}
                      disabled={!itemInfo[index]?.ItemName}
                      min={0}
                      max={itemInfo[index]?.RequiredBalance || 0}
                    />
                  </td>
                </>
              )}

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="bg-gray-200 min-w-30 border border-gray-300 outline-1 outline-gray-200 print:border-0 print:outline-none print:bg-transparent"
                  onChange={(e) =>
                    handleChange(index, "Quantity", e.target.value)
                  }
                  value={itemInfo[index]?.Quantity || 0}
                  max={
                    user?.role === "Admin"
                      ? (itemInfo[index]?.RequiredBalance || 0) -
                        (itemInfo[index]?.EndingInventory || 0)
                      : undefined
                  }
                  min={0}
                  readOnly={!itemInfo[index]?.ItemName}
                  disabled={!itemInfo[index]?.ItemName}
                />
              </td>

              <td className="px-4 py-2" name="Unit">
                <AutoSuggestInput
                  item={unit}
                  index={index}
                  onChange={handleChange}
                  name="Unit"
                  value={itemInfo[index]?.Unit || ""}
                  readOnly={!itemInfo[index]?.ItemName}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200 print:border-0 print:outline-none print:bg-transparent"
                  type="number"
                  name="UnitPrice"
                  readOnly={!itemInfo[index]?.ItemName}
                  onChange={(e) =>
                    handleChange(index, "UnitPrice", e.target.value)
                  }
                  value={itemInfo[index]?.UnitPrice || 0}
                  disabled={!itemInfo[index]?.ItemName}
                />
              </td>

              <td className="px-4 py-2">
                <h4 className="px-2 py-1 w-full my-1 bg-darkRed text-white">
                  {formatMoney(itemInfo[index]?.Total || 0, "PHP", "en-PH")}
                </h4>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

PurchaseSubmitTable.displayName = "PurchaseSubmitTable";

export default PurchaseSubmitTable;
