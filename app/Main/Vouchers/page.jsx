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
  const [rejectedVouchers, setRejectedVouchers] = useState();

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
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [selectedPRs, setSelectedPRs] = useState([]);
  const [viewPR, setViewPR] = useState(null); // holds PR object for the detail modal
  const [loadingPRs, setLoadingPRs] = useState(false);

  const fetchApprovedPRs = async () => {
    setLoadingPRs(true);
    try {
      const res = await axios.get("/api/purchase/approved");
      const unattached = (res.data?.data || []).filter(
        (pr) => pr.id == null || pr.id == "",
      );
      setApprovedPRs(unattached);
    } catch (err) {
      console.error("Error fetching approved PRs", err);
    } finally {
      setLoadingPRs(false);
    }
  };

  // fetch pag bukas ung modal, reset pag sarado
  useEffect(() => {
    if (showModal) {
      fetchApprovedPRs();
    } else {
      setSelectedPRs([]);
      setApprovedPRs([]);
      setViewPR(null);
    }
  }, [showModal]);

  const handleAddPR = (pr) => {
    setSelectedPRs((prev) => [...prev, pr]);
    setApprovedPRs((prev) =>
      prev.filter((p) => p.PurchaseID !== pr.PurchaseID),
    );
  };

  const handleRemovePR = (pr) => {
    setApprovedPRs((prev) => [...prev, pr]);
    setSelectedPRs((prev) =>
      prev.filter((p) => p.PurchaseID !== pr.PurchaseID),
    );
  };

  const handleAddVoucher = async () => {
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

      const payload = {
        ...newVoucher,
        purchaseIds: selectedPRs.map((pr) => pr.PurchaseID),
      };

      const response = await axios.post("/api/vouchers", payload);
      setShowModal(false);
      showSuccess(`Sucessfully Added ${newVoucher.VoucherID}`);
      setNewVoucher({ VoucherID: "", NoPayments: "" });
      setSelectedPRs([]);
      fetchVouchers();
    } catch (error) {
      console.error("Error adding voucher", error);
      const message =
        error.response?.data?.error_message || error.message || "Failed";
      showError(message);
    }
  };
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
    if (activeTab === "rejected") {
      fetchRejectedVouchers();
    } else {
      fetchVouchers();
    }
  }, [page, activeTab]);

  useEffect(() => {
    if (dateStart || dateEnd) {
      if (activeTab === "rejected") {
        fetchRejectedVouchers();
      } else {
        fetchVouchers();
      }
    }
  }, [dateStart, dateEnd]);

  useEffect(() => {
    fetchVouchers();
  }, [userRole]);
  // search button
  useEffect(() => {
    if (voucherId === "") {
      setSearch(false);
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
  const fetchRejectedVouchers = async () => {
    try {
      const response = await axios.get(
        `/api/vouchers/reject?page=${page}&limit=${limit}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
      );
      setRejectedVouchers(response.data?.data || []);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error Fetch Rejected Vouchers", err);
    }
  };
  // const handleAddVoucher = async () => {
  //   // validation
  //   try {
  //     const validation = validateRequiredFields(newVoucher, [
  //       {
  //         name: "NoPayments",
  //         label: "Number of Payments",
  //         required: true,
  //         type: "number",
  //         min: 1,
  //       },
  //     ]);
  //     if (!validation.isValid) {
  //       showError(Object.values(validation.errors).join("\n"));
  //       return;
  //     }
  //     const response = await axios.post("/api/vouchers", newVoucher);
  //     setShowModal(false);
  //     showSuccess(`Sucessfully Added ${newVoucher.VoucherID}`);
  //     setNewVoucher({
  //       VoucherID: "",
  //       NoPayments: "",
  //     });
  //     fetchVouchers();
  //   } catch (error) {
  //     console.error("Error adding voucher", error);

  //     error.response?.data?.error_message || error.message || "Failed";

  //     showError(message);
  //   }
  // };

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
        <div className="border-t w-60 border-gray-300 grid grid-cols-[auto_auto_auto]">
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
          {userRole !== "Chief Accountant" &&
            userRole !== "Chief Administrator Manager" && (
              <button
                onClick={() => setActiveTab("rejected")}
                className={`border border-darkRed  ${
                  activeTab === "rejected" ?
                    "bg-white text-black"
                  : "bg-darkRed text-white"
                }`}
              >
                Rejected
              </button>
            )}
        </div>
      </div>
      <div>
        <VoucherTable
          data={
            search ?
              (activeTab === "pending" ? pendingVouchers
              : activeTab === "approved" ? approvedVouchers
              : rejectedVouchers
              )?.filter((e) => e.id == voucherId)
            : activeTab === "pending" ?
              pendingVouchers
            : activeTab === "approved" ?
              approvedVouchers
            : rejectedVouchers
          }
          header={[
            "No ID",
            "No of Vouchers",
            "Amount",
            "Claimable",
            "Date Created",
          ]}
          onDuplicated={fetchVouchers}
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
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
                  required
                  value={newVoucher.NoPayments}
                  onChange={handleVoucherChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-darkRed"
                  placeholder="Enter number of payments"
                />
              </div>

              {/* PR selector */}
              <div className="grid grid-cols-2 gap-4">
                {/* available approved PRs */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Approved PRs
                  </h3>
                  <div className="border border-gray-300 rounded h-64 overflow-y-auto">
                    {loadingPRs ?
                      <p className="text-center text-sm text-gray-500 p-3">
                        Loading...
                      </p>
                    : approvedPRs.length === 0 ?
                      <p className="text-center text-sm text-gray-500 p-3">
                        No approved PRs
                      </p>
                    : approvedPRs.map((pr) => (
                        <div
                          key={pr.PurchaseID}
                          className="flex items-center justify-between px-3 py-2 border-b border-gray-200 text-sm"
                        >
                          <div className="truncate mr-2">
                            <p className="font-semibold text-black truncate">
                              {pr.PurchaseID}
                            </p>
                            <p className="text-gray-500 truncate">
                              ₱{pr.Total}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setViewPR(pr)}
                              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPR(pr)}
                              className="px-2 py-1 text-xs bg-btnRed text-white rounded hover:bg-black"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* selected PRs */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Added to this Voucher ({selectedPRs.length})
                  </h3>
                  <div className="border border-gray-300 rounded h-64 overflow-y-auto">
                    {selectedPRs.length === 0 ?
                      <p className="text-center text-sm text-gray-500 p-3">
                        None added yet
                      </p>
                    : selectedPRs.map((pr) => (
                        <div
                          key={pr.PurchaseID}
                          className="flex items-center justify-between px-3 py-2 border-b border-gray-200 text-sm"
                        >
                          <div className="truncate mr-2">
                            <p className="font-semibold text-black truncate">
                              {pr.PurchaseID}
                            </p>
                            <p className="text-gray-500 truncate">
                              {"Total"} · ₱{pr.Total}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setViewPR(pr)}
                              className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePR(pr)}
                              className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
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

          {/* PR detail modal - stacked on top */}
          {viewPR && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">
                      {viewPR.PurchaseID}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Dept: {viewPR.RequestorDepartment}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewPR(null)}
                    className="text-gray-500 hover:text-black font-bold"
                  >
                    ✕
                  </button>
                </div>

                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 text-black">
                    <tr>
                      <th className="text-left p-2 border-b">Item</th>
                      <th className="text-left p-2 border-b">Unit</th>
                      <th className="text-right p-2 border-b">Qty</th>
                      <th className="text-right p-2 border-b">Unit Price</th>
                      <th className="text-right p-2 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewPR.purchaseItems?.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="p-2">{item.ItemName}</td>
                        <td className="p-2">{item.Unit}</td>
                        <td className="p-2 text-right">{item.Quantity}</td>
                        <td className="p-2 text-right">{item.UnitPrice}</td>
                        <td className="p-2 text-right">{item.Total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between mt-4 font-semibold text-black">
                  <span>Total</span>
                  <span>₱{viewPR.Total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VouchersList;
