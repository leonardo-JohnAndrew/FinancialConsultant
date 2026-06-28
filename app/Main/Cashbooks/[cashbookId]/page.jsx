"use client";
import CashbooksTable from "@/app/components/Tables/cashbookTable";
import { getCreditors } from "@/functions/cashbook";
import { GetBDONo, GetCashbookHeaders, GetCashNo } from "@/functions/vouchers";
import { useBanner } from "@/hooks/Context/banner";
import axios from "axios";
import { GetAccountCode } from "@/functions/vouchers";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CashbookDetailed = () => {
  const params = useParams();
  const { showSuccess, showError } = useBanner();
  const [data, setData] = useState([]);
  const [date, setDate] = useState();
  const [previousMonthBalance, setPreviousMonthBalance] = useState(22220976.69);
  const [previousMonthReceipt, setPreviousMontReciept] = useState(0);
  const [previousMonthPayment, setPreviousMonthPayment] = useState(0);
  const [nextMonthBalance, setNextMonthBalance] = useState(0);
  const [nextMonthReceipt, setNextMontReciept] = useState(0);
  const [nextMonthPayment, setNextMonthPayment] = useState(0);
  const [projectCode, setProjectCode] = useState("");

  const [A_C_No, setA_C_No] = useState("");
  const [acNo1, setAcNo1] = useState("");
  const [acNo2, setAcNo2] = useState("");
  const [currency, setCurrency] = useState();
  const [category, setCategory] = useState();
  const [creditors, setCreditors] = useState([]);
  const [accountCodes, setAccountCodes] = useState([]);
  // fetch data
  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/cashbooks/${params.cashbookId}`);
      const res = await getCreditors();
      const ac = await GetAccountCode();
      setAccountCodes(ac.dataList || []);
      setCreditors(res.dataList || []);
      setData(response?.data?.cashbooksDetails || []);
      setCategory(response.data.category);
      setCurrency(response.data.currency);
      setDate(response.data?.createdAt.split("T")[0]);
      const accountNo = response.data?.A_C_No || "";

      setA_C_No(accountNo);

      const bdo = await GetBDONo(
        `${response.data?.currency} ${response.data?.category}`,
      );

      setAcNo1(response.data?.category === "Bank" ? bdo?.code || "" : "");

      const cash = await GetCashNo(
        `${response.data?.currency} ${response.data?.category}`,
      );

      setAcNo2(cash?.code || "");

      const header = await GetCashbookHeaders(
        `${response.data?.currency} ${response.data?.category}`,
      );

      setProjectCode(header?.code || "");
      setNextMonthBalance(response.data?.balance_carried_forward_to_next_month);
      setNextMontReciept(response.data?.receipt_carried_forward_to_next_month);
      setNextMonthPayment(response.data?.payment_carried_forward_to_next_month);
      setPreviousMonthBalance(
        response.data?.balance_brought_forward_from_previous_month,
      );
      setPreviousMontReciept(
        response.data?.receipt_brought_forward_from_previous_month,
      );
      setPreviousMonthPayment(
        response.data?.payment_brought_forward_from_previous_month,
      );
      setNextMonthPayment(response.data?.payment_carried_forward_to_next_month);
    } catch (err) {
      showError("Failed to fetch the data");
    }
  };

  // first render
  useEffect(() => {
    fetchData();
    setNextMontReciept(
      Number(previousMonthBalance || 0) +
        Number(nextMonthReceipt || 0) -
        Number(nextMonthPayment || 0),
    );
  }, []);

  // recompute
  const recomputeBalances = (rows, openingBalance) => {
    let runningBalance = Number(openingBalance || 0);

    return rows.map((item) => {
      runningBalance =
        runningBalance + Number(item.receipt || 0) - Number(item.payment || 0);

      return {
        ...item,
        balance: runningBalance,
      };
    });
  };

  //handle change
  const handleChange = (index, field, value) => {
    setData((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]:
          ["receipt", "payment", "slipNo"].includes(field) ?
            Number(value) || 0
          : value,
      };

      return recomputeBalances(updated, previousMonthBalance);
    });
  };

  useEffect(() => {
    setData((prev) => recomputeBalances(prev, previousMonthBalance));
  }, [previousMonthBalance]);

  //handleHeaderChange
  const handleHeaderChange = (field, value) => {
    if (field === "A_C_No_1" || field === "A_C_No_2") {
      const [first = "", second = ""] = (A_C_No || "").split(" ");

      const newValue =
        field === "A_C_No_1" ?
          `${value} ${second}`.trim()
        : `${first} ${value}`.trim();

      setA_C_No(newValue);
      return;
    }

    if (field === "project_code") {
      setProjectCode(value);
      return;
    }
  };
  // handleMonthChange
  const handleMonthChange = (field, value) => {
    const num = Number(value) || 0;

    switch (field) {
      case "balance_brought_forward_from_previous_month":
        setPreviousMonthBalance(num);
        break;

      case "receipt_brought_forward_from_previous_month":
        setPreviousMontReciept(num);
        break;

      case "payment_brought_forward_from_previous_month":
        setPreviousMonthPayment(num);
        break;

      default:
        break;
    }
  };
  useEffect(() => {
    const totalReceipt = data.reduce(
      (sum, item) => sum + Number(item.receipt || 0),
      0,
    );

    const totalPayment = data.reduce(
      (sum, item) => sum + Number(item.payment || 0),
      0,
    );

    const totalBalance =
      Number(previousMonthBalance || 0) + totalReceipt - totalPayment;

    setNextMontReciept(totalReceipt);
    setNextMonthPayment(totalPayment);
    setNextMonthBalance(totalBalance);
  }, [data, previousMonthBalance]);

  // handleSubmit
  const handleSubmit = async () => {
    try {
      const payload = {
        project_code: projectCode,
        A_C_No: `${acNo1} ${acNo2}`,

        balance_brought_forward_from_previous_month: previousMonthBalance,

        receipt_brought_forward_from_previous_month: previousMonthReceipt,

        payment_brought_forward_from_previous_month: previousMonthPayment,

        balance_carried_forward_to_next_month: nextMonthBalance,

        receipt_carried_forward_to_next_month: nextMonthReceipt,

        payment_carried_forward_to_next_month: nextMonthPayment,

        cashbooksDetails: data,
      };

      await axios.put(`/api/cashbooks/${params.cashbookId}`, payload);

      showSuccess("Cashbook updated successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to update cashbook");
    }
  };
  useEffect(() => {
    setNextMonthBalance(
      Number(previousMonthBalance || 0) +
        Number(nextMonthReceipt || 0) -
        Number(nextMonthPayment || 0),
    );
  }, [previousMonthBalance, nextMonthReceipt, nextMonthPayment]);
  return (
    <>
      <div>
        {/* header */}
        <table className="border">
          <tbody>
            <tr className="border-b border-gray-300 text-left ">
              <td className="p-2 border border-l bg-black text-white">
                Project
              </td>
              <td className="p-2">9665R7268</td>
              <td>
                <input
                  type="text"
                  placeholder="ZPC-LC1"
                  className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                  value={projectCode || ""}
                  readOnly
                  onChange={(e) =>
                    handleHeaderChange("project_code", e.target.value)
                  }
                />
              </td>
              <td className="p-2">{date?.replaceAll("-", "/")}</td>
            </tr>
            <tr className="border-b border-gray-300 text-left">
              <td className="border border-l p-2 bg-black text-white">
                {" "}
                Currency
              </td>
              <td colSpan={2} className="p-2">
                {currency === "PH" ? "PHilippine Peso" : "US DOLLAR"}
              </td>
              <td className="p-2">{currency === "PH" ? "PHP" : "USD"}</td>
            </tr>

            <tr className="border-b border-gray-300 text-left">
              <td className="border border-l p-2 bg-black text-white">
                {" "}
                Cash/Bank
              </td>
              <td className="p-2">
                <span
                  className={`px-3 rounded-full ${category === "Cash" ? "border border-black" : ""} `}
                >
                  Cash
                </span>
                <span
                  className={`px-3 rounded-full ${category === "Bank" ? "border border-black" : ""} `}
                >
                  Bank
                </span>
              </td>
              {/* AC_NO_1 */}
              <td>
                {"(A/C No."}
                <input
                  type="text"
                  readOnly={true}
                  value={acNo1 || ""}
                  className="border border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                />
                {")"}
              </td>
              {/* AC_NO_2 */}
              <td className="p-2">
                <input
                  type="text"
                  placeholder="003N1"
                  readOnly
                  value={acNo2 || ""}
                  className="border w-15 border-gray-300 bg-gray-200 text-black print:border-0 print:outline-none print:bg-transparent"
                />
              </td>
            </tr>
          </tbody>
        </table>
        {/* cashbooksTable Component */}
        <div className="mt-3 max-h-[700px] overflow-y-auto ">
          <CashbooksTable
            tableHeader={
              currency === "PH" ?
                [
                  "Slip No",
                  "Date",
                  "Description",
                  "Account Code",
                  "Job No",
                  "Reference No",
                  "Payee/Payer No",
                  "Payee/Payor",
                  "Reciept",
                  "Payment",
                  "Balance",
                  "Others",
                  "GL Count",
                  // OUTSIDE THE TABLE
                  "CRM",
                  "length",
                  "SI#",
                  "AR/OR#",
                  "Company",
                  "Claimable/Non-Claimable",
                  "Code In Invoice to DOTR",
                  "Description",
                ]
              : [
                  "Slip No",
                  "Date",
                  "Description",
                  "Account Code",
                  "Job No",
                  "Reference No",
                  "Payee/Payer No",
                  "Payee/Payor",
                  "Reciept",
                  "Payment",
                  "Balance",
                  "Others",
                  "GL Count",
                  // OUTSIDE THE TABLE
                  "CRM",
                  "length",
                  "Company",
                  "Claimable/Non-Claimable",
                  "Code In Invoice to DOTR",
                  "Description",
                ]
            }
            tbdatDetailes={data}
            handleChange={handleChange}
            previousMonthBalance={previousMonthBalance}
            previousMonthPayment={previousMonthPayment}
            previousMonthReceipt={previousMonthReceipt}
            nextMonthBalance={nextMonthBalance}
            nextMonthPayment={nextMonthPayment}
            nextMonthReceipt={nextMonthReceipt}
            handleMonthChange={handleMonthChange}
            creditors={creditors}
            currency={currency}
            accountCodes={accountCodes}
          />
        </div>
        <div className="flex justify-end items-end mt-5 mr-4">
          <button
            className="bg-btnRed text-white hover:bg-black"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default CashbookDetailed;
