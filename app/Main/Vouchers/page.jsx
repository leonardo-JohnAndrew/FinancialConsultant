"use client";
import VoucherTable from "@/app/components/Tables/voucher-table";
import { validateRequiredFields } from "@/functions/validations";
import { useBanner } from "@/hooks/Context/banner";
import useUserContext from "@/hooks/Context/UserContext";

import axios from "axios";
import { type } from "node:os";
import React, { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

const VouchersList = () => {
  const [vouchers, setVourchers] = useState();
  const [activeTab, setActiveTab] = useState("pending"); // active tab

  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const { user } = useUserContext();
  const [totalPages, setTotalPages] = useState();
  const [voucherId, setVoucherId] = useState();
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const { showError, showSuccess } = useBanner();
  const [search, setSearch] = useState("");
  const [dateStartDefault, setDateStartDefault] = useState();
  const [dateEndDefault, setDateEndDefault] = useState();
  const [showModal, setShowModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    VoucherID: "",
    NoPayments: "",
  });

  const userRole = user?.role || "";

  const fetchVouchers = async () => {
    if (!userRole && userRole === "") return;
    try {
      let endpoint;
      if (userRole === "Chief Accountant") {
        endpoint = "/api/vouchers/approvals/chiefAccountant";
      } else if (userRole === "Chief Administrator Manager") {
        endpoint = "/api/vouchers/approvals/chiefAdmin";
      } else if (
        userRole !== "Chief Accountant" &&
        userRole !== "Chief Administrator Manager"
      ) {
        endpoint = "/api/vouchers/";
      }

      const response = await axios.get(
        `${endpoint}?page=${page}&limit=${limit}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
      );

      setVourchers(response.data?.data || []);
      setTotalPages(response.data.totalPages);
      setDateStartDefault(response.data.rangeStart?.split("T")[0]);
      setDateEndDefault(response.data.rangeEnd?.split("T")[0]);
    } catch (err) {
      console.error("Error Fetch Vouchers", err);
    }
  };
  useEffect(() => {
    fetchVouchers();
  }, [page]);

  useEffect(() => {
    if (dateStart || dateEnd) {
      fetchVouchers();
    }
  }, [dateStart, dateEnd]);

  useEffect(() => {
    fetchVouchers();
  }, [userRole]);
  // search button
  useEffect(() => {
    if (voucherId === "") {
      setSearch(false);
    } else {
      setSearch(true);
    }
  }, [voucherId]);
  const handleChangeId = useCallback(
    (e) => {
      setVoucherId(e.target.value);
    },
    [voucherId, vouchers],
  );
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
  // handle add
  const handleVoucherChange = (e) => {
    const { name, value } = e.target;

    setNewVoucher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVoucher = async () => {
    // validation
    try {
      const validation = validateRequiredFields(newVoucher, [
        {
          name: "NoPayments",
          label: "Number of Payments",
          required: true,
          type: "number",
          min: 1,
        },
      ]);
      if (!validation.isValid) {
        showError(Object.values(validation.errors).join("\n"));
        return;
      }
      const response = await axios.post("/api/vouchers", newVoucher);
      setShowModal(false);
      showSuccess(`Sucessfully Added ${newVoucher.VoucherID}`);
      setNewVoucher({
        VoucherID: "",
        NoPayments: "",
      });
      fetchVouchers();
    } catch (error) {
      console.error("Error adding voucher", error);

      error.response?.data?.error_message || error.message || "Failed";

      showError(message);
    }
  };

  //signature Fields
  const signatureField =
    userRole === "Chief Accountant" ?
      "ChiefAccountSignature"
    : "ChiefAdminSignature";

  const pendingVouchers = vouchers?.filter((v) => !v[signatureField]);

  const approvedVouchers = vouchers?.filter((v) => !!v[signatureField]);

  return (
    <div className="relative mb-5 w-auto">
      <div className="grid grid-row-3 mb-10">
        <hr className="border-t border-gray-300" />
        <div className="flex text-xl">
          <div className="py-4 grow mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
            <h2 className="text-black text-2xl">Search ID: </h2>
            <input
              type="text"
              className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg"
              onChange={(e) => handleChangeId(e)}
              placeholder="Enter Voucher ID"
            />
            <button onClick={(e) => setSearch(true)}>
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

      {/* handle add  */}
      {user?.role !== "Chief Accountant" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-btnRed text-white px-4 py-2 rounded hover:bg-black"
          >
            + Add Voucher
          </button>
        </div>
      )}

      <div className="flex justify-end items-end mb-3">
        <div className="border-t w-60 border-gray-300 grid grid-cols-[auto_auto]">
          <button
            onClick={() => setActiveTab("pending")}
            className={`border border-darkRed  ${
              activeTab === "pending" ?
                "bg-white text-black"
              : "bg-darkRed text-white"
            }`}
          >
            Pending
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`border border-darkRed  ${
              activeTab === "approved" ?
                "bg-white text-black"
              : "bg-darkRed text-white"
            }`}
          >
            Approved
          </button>
        </div>
      </div>
      <div>
        <VoucherTable
          data={
            search ?
              (activeTab === "pending" ? pendingVouchers : approvedVouchers
              )?.filter((e) => e.id == voucherId)
            : activeTab === "pending" ?
              pendingVouchers
            : approvedVouchers
          }
          header={[
            "No ID",
            "No of Vouchers",
            "Amount",
            "Claimable",
            "Date Created",
          ]}
        />
      </div>

      {/* paginations */}
      <div className="flex justify-center items-center mt-5">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-btnRed outline outline-darkRed hover:bg-white mr-1"
          disabled={page === 1}
        >
          <FiChevronLeft size={22} />
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`px-4 py-1 border-r-2 border-gray-500 ${page === index + 1 ? "bg-darkRed text-white" : "bg-gray-200 hover:bg-darkRed hover:text-white"}  `}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 border-2 border-black bg-black text-white hover:text-black hover:bg-white ml-1"
          disabled={page === totalPages}
        >
          <FiChevronRight size={22} />
        </button>
      </div>

      {/* modal  */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-87.5 p-6">
            <h2 className="text-xl font-bold mb-4 text-black">
              Add New Voucher
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Number Payment Vouchers
                </label>
                <input
                  type="number"
                  name="NoPayments"
                  min={0}
                  required={true}
                  value={newVoucher.NoPayments}
                  onChange={handleVoucherChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-darkRed"
                  placeholder="Enter number of payments"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleAddVoucher}
                className="px-4 py-2 bg-btnRed text-white rounded hover:bg-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersList;
