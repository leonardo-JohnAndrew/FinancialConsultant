"use client";
import { useBanner } from "@/hooks/Context/banner";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";

const CashbooksTable = (props) => {
  let {
    tableHeader,
    tbdata,
    tbdatDetailes,
    previousMonthReceipt,
    previousMonthPayment,
    previousMonthBalance,
    handleChange,
    nextMonthReceipt,
    nextMonthPayment,
    nextMonthBalance,
    handleMonthChange,
    creditors = [],
    accountCodes = [],
    currency,
    fetchCashbooks,
  } = props;
  const [modal, setModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCashbook, setSelectedCashbook] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const { showError, showSuccess } = useBanner();
  const [editRange, setEditRange] = useState({
    dateRangeStart: "",
    dateRangeEnd: "",
  });
  const handleUpdateRange = async () => {
    try {
      const res = await axios.patch(
        `/api/cashbooks/${selectedCashbook.cashbook_id}`,
        editRange,
      );

      showSuccess("Range updated");

      /*
      Kung may existing children,
      automatic mag-aadd ng bagong pasok sa range.
      Kung wala pa, inserted = 0 lang.
    */

      if (res.data.inserted > 0) {
        showSuccess(`${res.data.inserted} additional entries synced`);
      }

      setOpenEditModal(false);

      fetchCashbooks();
    } catch (err) {
      showError("Failed to update range");
    }
  };
  return (
    <>
      <div className="table-container w-full">
        <table className="border border-gray-300 w-full ">
          <thead className="bg-black text-white border-3  sticky  top-0 z-10 ">
            <tr>
              {tableHeader.map((header, index) => (
                <th
                  key={index}
                  className="border-b border-gray-300 text-left px-4 py-2 text-sm font-bold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* for list books */}
            {tbdata?.map((data, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td>
                  <h3 className="px-4 py-3">{data.project}</h3>
                </td>
                <td>
                  <h3 className="px-4 py-3">{data.currency}</h3>
                </td>
                <td>
                  <h3 className="px-4 py-3">{data.category}</h3>
                </td>
                <td>
                  <h3 className="px-4 py-3">
                    {data.dateRangeStart?.split("T")[0]}
                  </h3>
                </td>
                <td>
                  <h3 className="px-4 py-3">
                    {data.dateRangeEnd?.split("T")[0]}
                  </h3>
                </td>
                <td>
                  <div className="flex gap-2">
                    {/* EDIT RANGE */}
                    {/* <button
                      className="px-4 py-1 bg-yellow-500 text-white font-bold rounded-lg"
                      onClick={() => {
                        setSelectedCashbook(data);
                        setEditRange({
                          dateRangeStart: data.dateRangeStart?.split("T")[0],
                          dateRangeEnd: data.dateRangeEnd?.split("T")[0],
                        });
                        setOpenEditModal(true);
                      }}
                    >
                      Edit
                    </button> */}
                    {/* VIEW / SYNC */}
                    {/* {data.hasChildren ? (
                      
                    )} */}
                    <Link
                      className="px-4 py-1 bg-btnRed text-white font-bold rounded-lg"
                      href={`/Main/Cashbooks/${data.cashbook_id}`}
                    >
                      View
                    </Link>

                    <button
                      className="px-4 py-1 bg-green-600 text-white font-bold rounded-lg"
                      onClick={async () => {
                        const res = await axios.post(
                          `/api/cashbooks/${data.cashbook_id}/sync`,
                        );

                        showSuccess(`${res.data.inserted} entries synced`);

                        fetchCashbooks();
                      }}
                    >
                      Sync
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* cashbooks detailed parts*/}
            {/* previous Month*/}
            {tbdatDetailes && (
              <>
                <tr className="border-b">
                  <td colSpan={9} className="p-2">
                    <h4>
                      前月繰越額　　(Balance Brougtht Forward from Previous
                      Month )
                    </h4>
                  </td>
                  {/* receipt */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={previousMonthReceipt}
                      onChange={(e) =>
                        handleMonthChange(
                          "receipt_brought_forward_from_previous_month",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  {/* payment */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={previousMonthPayment}
                      onChange={(e) =>
                        handleMonthChange(
                          "payment_brought_forward_from_previous_month",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  {/* balance */}
                  <td className="p-2">
                    <input
                      type="number"
                      className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                      value={previousMonthBalance}
                      onChange={(e) =>
                        handleMonthChange(
                          "balance_brought_forward_from_previous_month",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                </tr>

                {/* // nextMonth */}
                <tr className="border-b">
                  <td colSpan={9} className="p-2">
                    <h4>
                      次月繰越額　　(Balance Carried Forward to Next Month )
                    </h4>
                  </td>
                  {/* receipt */}
                  <td className="p-2">
                    <input type="number" value={nextMonthReceipt} readOnly />
                  </td>
                  {/* payment */}
                  <td className="p-2">
                    <input type="number" value={nextMonthPayment} readOnly />
                  </td>
                  <td className="p-2">
                    <input type="number" value={nextMonthBalance} readOnly />
                  </td>
                </tr>
              </>
            )}
            {tbdatDetailes?.map((data, index) => (
              <tr key={index} className="border-b border-gray-300">
                {/* slip No */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent w-10"
                    type="number"
                    readOnly
                    value={data.check_parent || 0}
                    //slip number
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent w-10"
                    type="number"
                    onChange={(e) =>
                      handleChange(index, "slipNo", Number(e.target.value))
                    }
                    value={data.slipNo || 0}
                    //slip number
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent "
                    type="date"
                    value={data.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleChange(index, "slipNo", e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-2">
                  <textarea
                    className="border border-gray-300 bg-gray-200 text-black h-30 w-50 print:border-0 print:outline-none print:bg-transparent"
                    type="text"
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    // style={{
                    //   width: `${String(data.description || "").length + 3}ch`,
                    // }}
                    value={data.description || ""}
                  />
                </td>
                {/* Account Code */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    type="text"
                    value={data.A_C_code || " "}
                    onChange={(e) =>
                      handleChange(index, "A_C_code", e.target.value)
                    }
                  />

                  {/* description ng account code, black bg / white text */}
                  <div className="bg-black text-white text-xs px-2 py-1 mt-1 text-center print:bg-black print:text-white">
                    {accountCodes.find(
                      (ac) => String(ac.code) === String(data.A_C_code),
                    )?.description || ""}
                  </div>
                </td>
                {/* Job No */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-25 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    type="text"
                    onChange={(e) =>
                      handleChange(index, "job_No", e.target.value)
                    }
                    value={data.job_No || ""}
                  />
                </td>
                {/* Reference No */}
                <td className="px-2 py-2">
                  <input
                    type="text"
                    className=" border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    onChange={(e) =>
                      handleChange(index, "reference_no", e.target.value)
                    }
                    value={data.reference_no || ""}
                  />
                </td>
                {/* Payee Payee No */}
                <td>
                  <input
                    type="text"
                    className="border border-gray-300 w-25 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    value={data.payee_payer_no || ""}
                    onChange={(e) =>
                      handleChange(index, "payee_payer_no", e.target.value)
                    }
                  />
                </td>
                {/* payee/payor */}
                <td className="px-2 py-2 relative">
                  <textarea
                    className="border border-gray-300 bg-gray-200 h-20 w-50 text-black"
                    value={data.payee_payer || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      handleChange(index, "payee_payer", value);

                      setActiveSuggestion(index);
                    }}
                    onFocus={() => setActiveSuggestion(index)}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveSuggestion(null);
                      }, 150);
                    }}
                  />

                  {activeSuggestion === index && (
                    <div className="absolute bg-white border shadow-md max-h-48 overflow-y-auto w-80 z-50">
                      {creditors
                        .filter((item) =>
                          item.creditorsName
                            ?.toLowerCase()
                            .includes((data.payee_payer || "").toLowerCase()),
                        )
                        .slice(0, 10)
                        .map((item) => (
                          <div
                            key={item.code}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              handleChange(
                                index,
                                "payee_payer",
                                item.creditorsName,
                              );

                              handleChange(index, "CRM", item.code);
                              setActiveSuggestion(null);
                            }}
                          >
                            <div className="font-medium">
                              {item.creditorsName}
                            </div>

                            <div className="text-xs text-gray-500">
                              CRM: {item.code}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </td>
                {/* receipt */}
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className="border border-gray-300 w-30 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    value={data.receipt || 0}
                    onChange={(e) =>
                      handleChange(index, "receipt", e.target.value)
                    }
                  />
                </td>
                {/* payment */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200 text-black"
                    type="number"
                    value={data.payment || 0}
                    onChange={(e) =>
                      handleChange(index, "payment", e.target.value)
                    }
                  />
                </td>
                {/* balance */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200 text-black"
                    type="number"
                    value={data.balance || 0}
                    readOnly
                  />
                </td>
                {/* others  */}
                <td className="p-2">
                  <textarea className="w-50 h-20 border border-gray-300  bg-gray-200 text-black "></textarea>
                </td>
                {/* GL Count */}
                <td className="p-2">
                  <textarea
                    className="w-50 h-20 border border-gray-300  bg-gray-200 text-black "
                    onChange={(e) =>
                      handleChange(index, "glCount", e.target.value)
                    }
                    value={data.glCount}
                  ></textarea>
                </td>

                {/* crm */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200"
                    value={data.CRM || ""}
                    readOnly
                  />
                </td>
                {/* char length ni description */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200"
                    value={data.description?.length || 0}
                    readOnly
                  />
                </td>

                {/*  */}
                {currency === "PH" && (
                  <>
                    <td className="px-2 py-2">
                      <input
                        className="border border-gray-300 w-30 bg-gray-200"
                        value={data.SIno || ""}
                        onChange={(e) =>
                          handleChange(index, "SIno", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="border border-gray-300 w-30 bg-gray-200"
                        value={data.A_ORNo || ""}
                        onChange={(e) =>
                          handleChange(index, "A_ORNo", e.target.value)
                        }
                      />
                    </td>
                  </>
                )}
                {/* company inputed lng  */}
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200"
                    value={data.company || ""}
                    onChange={(e) =>
                      handleChange(index, "company", e.target.value)
                    }
                  />
                </td>
                {/* claimable or non claimable changeable dropdown  */}
                <td className="px-2 py-2">
                  <select
                    className="border border-gray-300  bg-gray-200"
                    value={data.Claimable || ""}
                    onChange={(e) =>
                      handleChange(index, "Claimable", e.target.value)
                    }
                  >
                    <option value="">Select</option>

                    <option value="Claimable">Claimable</option>

                    <option value="Non-Claimable">Non Claimable</option>
                  </select>
                </td>
                {/* code invoice to dotr inputed lng din */}
                <td className="p-2">
                  <input
                    className="border border-gray-300 w-30 bg-gray-200"
                    value={data.code_invoice_DOTR || ""}
                    onChange={(e) =>
                      handleChange(index, "code_invoice_DOTR", e.target.value)
                    }
                  />
                </td>
                {/* description reimbursable tinatype sya */}
                <td className="p-2">
                  <textarea
                    className="w-50 h-20 border border-gray-300 bg-gray-200"
                    value={data.reimbursable_description || ""}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "reimbursable_description",
                        e.target.value,
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openEditModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Edit Cashbook Range</h2>

            <div className="space-y-4">
              <input
                type="date"
                value={editRange.dateRangeStart}
                onChange={(e) =>
                  setEditRange((prev) => ({
                    ...prev,
                    dateRangeStart: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="date"
                value={editRange.dateRangeEnd}
                onChange={(e) =>
                  setEditRange((prev) => ({
                    ...prev,
                    dateRangeEnd: e.target.value,
                  }))
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setOpenEditModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleUpdateRange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CashbooksTable;
