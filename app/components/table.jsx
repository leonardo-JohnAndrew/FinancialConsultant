"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/functions/formatCurrency";
import { useRouter } from "next/navigation";

const Table = (props) => {
  const { role, approvalType, ownList, username } = props;
  const router = useRouter();
  const handleChange = (index, field, value) => {
    props?.setItems((prev) => {
      const updated = [...prev];

      const item = {
        ...updated[index],
        [field]: Number(value),
        EndingInventoryDate: props.EndingInventoryDate,
      };

      const required =
        field === "RequiredBalance" ?
          Number(value)
        : Number(item.RequiredBalance || 0);

      const ending =
        field === "EndingInventory" ?
          Number(value)
        : Number(item.EndingInventory || 0);

      item.Quantity = Math.max(required - ending, 0);

      updated[index] = item;

      return updated;
    });
  };
  useEffect(() => {
    console.log(props.items);
  }, []);
  //onChange
  const handleChangeAction = (id, action) => {
    switch (action) {
      case "View":
        // view function
        router.push(`/api/Purchase/MyRequisiton/${id}`);
        return;
      case "Cancel":
        // cancel funtion
        alert("Cancel");
        return;

      default:
        return;
    }
  };
  return (
    <>
      <div className="table-container w-full">
        <table className="border border-gray-300 w-full ">
          <thead className="bg-black text-white border-3 border-darkRed sticky top-0 z-10">
            <tr>
              {props.tableHeader.map((header, index) => (
                <th
                  key={index}
                  className="border-b border-gray-300 text-left px-4 py-2 text-sm font-bold"
                >
                  {header}

                  {header === "ENDING INVENTORY" && (
                    <div className="w-auto pr-10">
                      <input
                        className="bg-white text-red-500 w-full"
                        type="date"
                        value={
                          props.items[0]?.EndingInventoryDate ?
                            props.items[0].EndingInventoryDate.slice(0, 10)
                          : ""
                        }
                        disabled={true}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="px-4 py-2">{parseInt(index + 1)}</td>
                <td className="px-4 py-2">
                  {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200 -"  type="text" defaultValue={item.ItemName} readOnly= {true} /> */}
                  {item.ItemName}
                </td>
                {role === "Admin" && (
                  <>
                    <td className="px-4 py-2">
                      {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="number" value={props.items[index]?.RequiredBalance || 0} onChange={(e) => handleChange(index, "RequiredBalance" , e.target.value)} readOnly= {false} min={0} /> */}
                      {item.RequiredBalance}
                    </td>
                    <td className="px-4 py-2">
                      {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="number" value={props.items[index]?.EndingInventory || 0} onChange={(e) => handleChange(index, "EndingInventory", e.target.value)} readOnly= {false} min={0} /> */}
                      {item.EndingInventory}
                    </td>
                  </>
                )}

                <td className="px-4 py-2">
                  {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="number" value={props.items[index]?.Quantity} readOnly= {false} /> */}
                  {props.items[index]?.Quantity}
                </td>
                <td className="px-4 py-2">{item.Unit}</td>
                <td className="px-4 py-2">
                  {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item?.UnitPrice} readOnly= {true} /> */}
                  {item?.UnitPrice}
                </td>
                <td className="px-4 py-2 ">
                  <h4 className="px-4 py-1 w-fit my-1 bg-darkRed text-white">
                    {formatMoney(
                      item?.Quantity * item?.UnitPrice || 0,
                      "PHP",
                      "en-PH",
                    )}
                  </h4>
                </td>
              </tr>
            ))}
            {/* for list of all purchases */}

            {props.list?.map((purchase, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="px-1 py-3">{purchase.PurchaseID}</td>
                <td className="px-4 py-3">{username || "NAME"}</td>
                <td className="px-4 py-3">{purchase.RequestorDepartment}</td>
                <td className="px-4 py-3">{purchase.purchaseItems.length}</td>
                <td className="px-4 py-3">
                  {formatMoney(
                    purchase.purchaseItems.reduce(
                      (total, item) => total + item.Quantity * item.UnitPrice,
                      0,
                    ),
                    "PHP",
                    "en-PH",
                  )}
                </td>
                <td className="px-4 py-3">{purchase.Status}</td>
                <td className="px-4 py-3">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/Main/Purchase/PurchaseRecommendingApproval/${purchase.PurchaseID}`}
                    className="px-4 py-2 w-auto my-1 border border-darkRed bg-btnRed rounded-xl text-darkRed hover:bg-white text-sm"
                  >
                    View
                  </Link>
                  {/* <a href={`/Main/Purchase/${purchase.PurchaseID}`} className="px-4 py-2 w-auto my-1 border border-darkRed bg-btnRed rounded-xl text-darkRed hover:bg-white text-sm" >
                            View
                          </a> */}
                </td>
              </tr>
            ))}

            {/*for my requisition List */}
            {ownList?.map((purchase, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="px-1 py-3">{purchase.PurchaseID}</td>
                <td className="px-4 py-3">
                  {purchase.purchaseItems?.length || 0}
                </td>
                <td className="px-4 py-3">
                  {formatMoney(
                    purchase.purchaseItems?.reduce(
                      (total, item) => total + item.Quantity * item.UnitPrice,
                      0,
                    ) || 0,
                    "PHP",
                    "en-PH",
                  )}
                </td>
                <td className="px-4 py-3">{purchase.Status}</td>
                <td className="px-4 py-3">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/Main/Purchase/MyRequisition/${purchase.PurchaseID}`}
                    className="bg-btnRed text-white hover:bg-black p-3 rounded-md"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {/* for my requisition ListDetailed */}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
