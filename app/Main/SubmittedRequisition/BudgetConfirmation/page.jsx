"use client";
import { use, useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useUserContext from "@/hooks/Context/UserContext";
import BudgetConfirmationTable from "@/app/components/Tables/budgetConfirmationTable";
export default function BudgetConfirmation() {
  const [purchaseDetails, setPurchaseDetails] = useState();
  const [fomatted, setFormatted] = useState();
  const [purchaseID, setPurchaseId] = useState("");
  const [limit] = useState(15);
  const { user } = useUserContext();
  const [page, setPage] = useState(1);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" = Confirmation, "approved" = PR Approval
  const [dateStartDefault, setDateStartDefault] = useState();
  const [dateEndDefault, setDateEndDefault] = useState();
  const [totalPages, setTotalPages] = useState();
  const [approvalType, setApprovalType] = useState("Admin");

  const fetchPurchaseDetails = async () => {
    try {
      const response = await axios.get(
        `/api/purchase/Approvals/BudgetConfirmation?page=${page}&limit=${limit}&dateStart=${dateStart}&dateEnd=${dateEnd}&tab=${activeTab}`,
      );
      setPurchaseDetails(response.data.data);
      setTotalPages(response.data.totalPages);
      setDateStartDefault(response.data.rangeStart?.split("T")[0]);
      setDateEndDefault(response.data.rangeEnd?.split("T")[0]);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIs404(true);
      } else {
        console.error("Error fetching purchase details:", error);
      }
    }
  };

  useEffect(() => {
    fetchPurchaseDetails();
  }, [page, approvalType, activeTab]);

  useEffect(() => {
    if (dateStart || dateEnd) {
      fetchPurchaseDetails();
    }
  }, [dateStart, dateEnd]);

  // i-reset pabalik sa page 1 kapag nagpalit ng tab para hindi maiwan sa stale page number
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // LIVE SEARCH — client-side, real-time as you type
  const handleChangeId = useCallback((e) => {
    setPurchaseId(e.target.value);
  }, []);

  //handle date range
  const handleChangeDate = (e) => {
    switch (e.target.name) {
      case "dateStart":
        setDateStart(e.target.value);
        break;
      case "dateEnd":
        setDateEnd(e.target.value);
        break;
      default:
        break;
    }
  };

  const displayedList = useMemo(() => {
    const list = purchaseDetails || [];
    if (!purchaseID || purchaseID.trim() === "") {
      return list;
    }
    return list.filter((e) =>
      String(e.PurchaseID)
        .toLowerCase()
        .includes(purchaseID.trim().toLowerCase()),
    );
  }, [purchaseID, purchaseDetails]);

  return (
    <>
      <div className="flex relative mb-5 w-auto"></div>
      <div className="grid grid-row-3 mb-10">
        <hr className="border-t border-gray-300" />
        <div className="flex text-xl">
          <div className="py-4 grow mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
            <h2 className="text-black text-2xl">Search ID: </h2>
            <input
              type="text"
              className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg"
              value={purchaseID}
              onChange={handleChangeId}
              placeholder="Enter Purchase ID"
            />
            <button>
              <FiSearch
                size={28}
                className="ml-2 text-white hover:text-black hover:bg-btnRed cursor-pointer font-extrabold outline outline-darkRed 
           bg-darkRed p-1 w-10"
              />
            </button>
          </div>
          <div className="basis-64 py-4 ml-30 w-50 h-10 flex flex-row items-start justify-center  ">
            <h2 className="text-black text-2xl font-bold">Start: </h2>
            <input
              type="date"
              name="dateStart"
              className="bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg w-35"
              onChange={(e) => handleChangeDate(e)}
              value={dateStart || dateStartDefault || ""}
            />
          </div>
          <div className="basis-64 w-50 h-10 flex flex-row items-start justify-center p-4">
            <h2 className="text-black text-2xl font-bold">End: </h2>
            <input
              type="date"
              name="dateEnd"
              className="bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg "
              value={dateEnd || dateEndDefault || ""}
              onChange={(e) => handleChangeDate(e)}
            />
          </div>
        </div>
        <hr className="border-t border-gray-300" />
      </div>
      {/* filter  */}
      <div className=" flex justify-end items-end mb-3">
        <button
          onClick={() => setActiveTab("pending")}
          className={`border border-darkRed px-4 py-2 ${
            activeTab === "pending"
              ? "bg-white text-black"
              : "bg-darkRed text-white"
          }`}
        >
          Confirmation
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`border border-darkRed px-4 py-2 ${
            activeTab === "approved"
              ? "bg-white text-black"
              : "bg-darkRed text-white"
          }`}
        >
          PR Approval
        </button>
      </div>
      <div className="max-h-200 overflow-hidden">
        <BudgetConfirmationTable
          approve={false}
          tableHeader={[
            "REQUEST ID",
            "REQUESTOR NAME",
            "DEPARTMENT",
            "ITEMS",
            "TOTAL",
            "STATUS",
            "REQUISITION DATE",
            "ACTION",
          ]}
          list={displayedList}
        />
      </div>
      {/* paginations */}
      <div className="flex justify-center items-center mt-5 ">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 bg-btnRed outline outline-darkRed mr-1 ${page !== 1 && "hover:bg-white"} `}
          disabled={page === 1}
        >
          <FiChevronLeft size={22} />
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`px-4 py-1 border-r-2 border-gray-500 ${
              page === index + 1
                ? "bg-darkRed text-white"
                : "bg-gray-200 hover:bg-darkRed hover:text-white"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className={`px-3 py-1 border-2 border-black bg-black text-white  ml-1 ${page !== totalPages && " hover:bg-white hover:text-black"} `}
          disabled={page === totalPages}
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    </>
  );
}
