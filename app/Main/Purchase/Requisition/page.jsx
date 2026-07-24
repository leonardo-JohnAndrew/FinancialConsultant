"use client";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PurchaseSubmitTable from "@/app/components/Tables/purchase-submit-table";
import { formatDates } from "@/functions/formattDate";
import { FiMinus, FiPlus } from "react-icons/fi";
import { formatMoney } from "@/functions/formatCurrency";
import useUserContext from "@/hooks/Context/UserContext";
import { useBanner } from "@/hooks/Context/banner";
import { findDepartment } from "@/functions/notification";
import { sendPurchaseForwardedEmail } from "@/lib/sendWelcomeEmail";

const CreateRequisition = () => {
  const [data, setData] = useState([]);
  const [row, setRow] = useState([]);
  const { showError, showSuccess } = useBanner();
  const [itemIds, setItemIds] = useState([]);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("Small Amount");
  const [isRendered, setRendered] = useState(false);
  const [disable, setDisable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ guard para sa double-submit
  const [itemInfo, setItemInfo] = useState([]);
  const { user } = useUserContext();
  const [endindInventoryDate, setEndingInventoryDate] = useState(null);

  // ✅ Stable — no external deps, uses only setter
  const addTableRow = useCallback((added = 1) => {
    setRow((prevData) => {
      const newRows = Array.from({ length: added }, (_, i) => ({
        id: prevData.length + i + 1,
        ItemName: "New Item",
        RequiredBalance: 0,
        EndingInventory: 0,
        Quantity: 0,
        Unit: "pcs",
        UnitPrice: 0,
      }));
      return [...prevData, ...newRows];
    });
  }, []);

  // ✅ Stable reset — depends only on addTableRow which is stable
  const resetTable = useCallback(() => {
    setRow([]);
    setItemInfo([]);
    setItemIds([]);
    addTableRow(3);
  }, [addTableRow]);

  // ✅ All real dependencies listed explicitly
  const handleSubmitInfo = useCallback(async () => {
    // ✅ Double-submit guard
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (itemInfo.length === 0) {
        showError("No Items Inputed");
        return;
      }

      const limitedItemInfo =
        itemInfo.length > row.length ? itemInfo.slice(0, row.length) : itemInfo;
      const limitedItemIds =
        itemIds.length > row.length ? itemIds.slice(0, row.length) : itemIds;

      setItemInfo(limitedItemInfo);
      setItemIds(limitedItemIds);

      const filtered = limitedItemInfo.filter(
        (item) => item.ItemName && parseFloat(item.Total) > 0,
      );

      if (
        (user.role === "Admin" || user.department === "Admin") &&
        !endindInventoryDate
      ) {
        showError("Ending Inventory Date is Required");
        return;
      }
      if (!user.e_sign) {
        showError("You must have a e_signature");
        return;
      }

      const itemInfoWithDate = filtered.map((item) => ({
        ...item,
        UserID: user.id,
        EndingInventoryDate: endindInventoryDate,
      }));

      if (itemInfoWithDate.length === 0) {
        showError("Total must be greater than 0");
        return;
      }

      const forms = {
        TotalItem: total,
        mode,
        EmployeeSign: user.e_sign,
        purchaseItem: itemInfoWithDate,
      };

      try {
        const response = await axios.post("/api/purchase", forms);
        if (response.status === 200 || response.status === 201) {
          const accounting = await findDepartment("Accounting");

          // ✅ Parallel — lahat ng notifications + emails sabay-sabay, hindi isa-isa
          await Promise.all(
            (accounting?.data || []).map((forward) =>
              Promise.all([
                axios.post("/api/notification", {
                  userId: forward.userID,
                  title: "Purchase Requisition Submition",
                  message: `${user.name} is Submitted a Purchase Requisitions`,
                  type: "info",
                  link: "/Main/SubmittedRequisition/BudgetConfirmation",
                }),
                sendPurchaseForwardedEmail({
                  toEmail: forward.email,
                  requestNo: response.data?.id,
                  forwardedBy: user.name,
                  forwardedByRole: user.role,
                  forwardedTo: `${forward.firstname} ${forward.lastname}`,
                  appUrl: "",
                }),
              ]),
            ),
          );

          showSuccess(response?.data?.message);
          resetTable();
          addTableRow(5);
        }
      } catch (error) {
        const data = error?.response?.data;
        if (data?.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
            .join(" | ");
          showError(`${data.message} ${"->" + errorMessages}`);
        } else {
          showError(data?.message || "Something went wrong");
        }
      }
    } finally {
      // ✅ Palaging i-reset ang isSubmitting kahit may error
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    itemInfo,
    itemIds,
    row,
    endindInventoryDate,
    user,
    total,
    mode,
    showError,
    showSuccess,
    resetTable,
    addTableRow,
  ]);

  // ✅ Fetch once on mount only — hindi na naka-depend sa handleSubmitInfo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/purchase/items");
        setData(response.data.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // ✅ Initial rows — once on mount
  useEffect(() => {
    if (!isRendered) {
      setRendered(true);
      addTableRow(3);
    }
  }, []);

  // ✅ Memoized tableHeader — hindi na bago sa bawat render
  const tableHeader = useMemo(() => {
    return user?.role !== "Admin" || user?.department !== "Admin" ?
        [
          "NO",
          "ITEM CATALOG # COMPLETE ITEM DESCRIPTION",
          "QUANTITY",
          "UNIT",
          "UNIT PRICE",
          "TOTAL",
        ]
      : [
          "NO",
          "ITEM",
          "REQUIRED BALANCE",
          "ENDING INVENTORY",
          "QUANTITY",
          "UNIT",
          "UNIT PRICE",
          "TOTAL",
        ];
  }, [user?.role]);

  const handleRowChange = useCallback(
    (value) => {
      if (value === row.length) return;
      if (value > row.length) {
        addTableRow(value - row.length);
      } else {
        setRow((prev) => prev.slice(0, value));
      }
    },
    [row.length, addTableRow],
  );

  const handleDeleteRow = useCallback(() => {
    setRow((prevData) => prevData.slice(0, prevData.length - 1));
    setItemInfo((prevData) => prevData.slice(0, prevData.length - 1));
    setItemIds((prevData) => prevData.slice(0, prevData.length - 1));
  }, []);

  // ✅ Compute total + disable state
  useEffect(() => {
    const fillable = itemInfo.filter(
      (item) => item.ItemName && parseFloat(item.Total) > 0,
    );
    if (!fillable || fillable.length === 0) {
      setDisable(true);
      setTotal(0);
    } else {
      const computedTotal = fillable.reduce(
        (sum, item) => sum + (parseFloat(item?.Total) || 0),
        0,
      );
      setTotal(computedTotal);
      setDisable(false);
    }
  }, [itemInfo]);

  if (!user) {
    return <div>Please Wait....</div>;
  }

  return (
    <>
      <div className="flex relative mb-5 w-auto">
        <div className="w-1/2 flex flex-row gap-2">
          <h5 className="text-xl font-bold">Requestor Department: </h5>
          <h5 className="display-inline text-red-950 text-xl font-extrabold">
            {user?.department}
          </h5>
        </div>
      </div>

      <div className="grid grid-row-3 mb-5">
        <hr className="border-t border-gray-300" />
        <div className="flex text-xl">
          <h5 className="display-inline text-black-500 font-bold text-xl p-5 px-0">
            Requisition Date: {formatDates(new Date())}
          </h5>
        </div>
        <hr className="border-t border-gray-300" />
      </div>

      <div className="flex relative flex-row justify-between items-center mb-5 w-auto print:hidden">
        {/* LEFT SIDE */}
        <div className="flex flex-row items-center gap-3">
          <label className="font-bold text-lg">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border border-gray-300 outline outline-gray-300 bg-white px-3 py-1 rounded"
          >
            <option value="Small Amount">Small Amount</option>
            <option value="Service Invoice">Service Invoice</option>
          </select>
        </div>

        {/* RIGHT SIDE */}
        <div className="grid-cols-[auto_auto_auto] place-content-end flex flex-row">
          <button
            className="text-white outline outline-darkRed font-bold rounded-tl-lg rounded-bl-lg bg-black pl-2 py-1 w-10 hover:bg-gray-300 hover:text-black text-sm flex flex-row"
            onClick={handleDeleteRow}
          >
            <FiMinus size={20} />
          </button>

          <input
            type="Number"
            className="bg-gray-100 border border-gray-300 outline outline-gray-400 w-20 mx-1 text-center"
            value={row.length || 0}
            onChange={(e) => handleRowChange(parseInt(e.target.value) || 0)}
          />

          <button
            className="bg-darkRed text-white pl-2 py-1 w-10 text-sm outline outline-darkRed rounded-tr-lg rounded-br-lg hover:bg-btnRed hover:text-black flex flex-row"
            onClick={() => addTableRow(1)}
          >
            <FiPlus size={20} />
          </button>
        </div>
      </div>

      <div className="print:overflow-hidden">
        <PurchaseSubmitTable
          data={row}
          item={data}
          tableHeader={tableHeader}
          setData={setData}
          setItemInfo={setItemInfo}
          itemInfo={itemInfo}
          setItemIds={setItemIds}
          itemIds={itemIds}
          setEndingInventoryDate={setEndingInventoryDate}
        />
      </div>

      <div className="mt-5 mr-3 flex relative flex-row place-content-end mb-5 w-auto">
        <div className="grid-cols-[auto_auto_auto] place-content-end">
          <div className="w-auto h-auto bg-darkRed p-2 text-lg font-bold text-white">
            <h4>
              Total: {formatMoney(parseFloat(total) || 0, "PHP", "en-PH")}
            </h4>
          </div>
        </div>
      </div>

      <div className="mt-10 flex relative flex-row place-content-end mb-5 w-auto">
        <div className="grid-cols-[auto_auto_auto] place-content-end">
          <button
            className="bg-darkRed text-white py-1 w-30 text-lg outline outline-darkRed rounded-lg hover:bg-btnRed hover:text-black disabled:bg-gray-400 disabled:cursor-not-allowed disabled:outline disabled:outline-white disabled:hover:text-white"
            disabled={disable || isSubmitting}
            onClick={handleSubmitInfo}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateRequisition;
