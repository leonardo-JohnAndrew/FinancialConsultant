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
  } = props;
  const [modal, setModal] = useState(false);

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
                    {data.dateRangeStart.split("T")[0]}
                  </h3>
                </td>
                <td>
                  <h3 className="px-4 py-3">
                    {data.dateRangeEnd.split("T")[0]}
                  </h3>
                </td>
                <td>
                  <Link
                    className="px-4 py-1 bg-btnRed text-white font-bold rounded-lg border hover:border hover:border-darkRed hover:text-black hover:bg-white"
                    href={`/Main/Cashbooks/${data.cashbook_id}`}
                  >
                    view
                  </Link>
                </td>
              </tr>
            ))}
            {/* cashbooks detailed parts*/}
            {/* previous Month*/}
            {tbdatDetailes && (
              <>
                <tr className="border-b">
                  <td colSpan={8} className="p-2">
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
                  <td colSpan={8} className="p-2">
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
                    onChange={(e) =>
                      handleChange(index, "slipNo", Number(e.target.value))
                    }
                    value={data.slipNo || index + 1}
                    //slip number
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent "
                    type="date"
                    value={data.date.split("T")[0] || ""}
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
                <td className="px-2 py-2">
                  <input
                    className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                    type="text"
                    value={data.A_C_code || " "}
                    onChange={(e) =>
                      handleChange(index, "A_C_code", e.target.value)
                    }
                  />
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
                <td className="px-2 py-2">
                  <textarea
                    className="border border-gray-300 bg-gray-200 h-20 text-black print:border-0 print:outline-none print:bg-transparent"
                    type="text"
                    // style={{
                    //   width: `${String(data.payee_payer || "").length + 3}ch`,
                    // }}
                    value={data.payee_payer || ""}
                    onChange={(e) =>
                      handleChange(index, "payee_payer", e.target.value)
                    }
                  />
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
                  <textarea className="w-50 h-20 border border-gray-300  bg-gray-200 text-black "></textarea>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CashbooksTable;
