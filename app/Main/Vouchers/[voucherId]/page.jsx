"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import VoucherComponent from "@/app/components/vouchers";
import { useParams, useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import ConfirmBox from "@/app/components/modals/confirmbox";
import { useBanner } from "@/hooks/Context/banner";
import { getSuppliers } from "@/functions/supplier";
import useUserContext from "@/hooks/Context/UserContext";
const PaymentVouchers = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user } = useUserContext();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const { showError, showSuccess } = useBanner();
  const [DisplayedAmount, setDisplayedAmount] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [ChiefAdminSignature, setChiefAdminSignature] = useState(null);
  const [ChiefAccountSignature, setChiefAccountSignature] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [claimableStatus, setClaimableStatus] = useState({
    claimable: false,
    nonClaimable: false,
  });
  const userRole = user?.role;
  const params = useParams();
  // EXISTING VOUCHERS
  const [checks, setChecks] = useState([]);

  // FORM DATA
  const [formData, setFormData] = useState({
    title: "",
    voucherTypeNumber: "",
    // payment_item: "",
    accountCode: "", // ✅ bago
    glCode: "", // ✅ bago
    payment_voucher_date: new Date().toISOString().split("T")[0],
    voucherType: "CASH USD",
    slipNo: "",
    job: "9665R7268",
    pm: "",
    receiptOrPayment: "", // ✅ dagdag dito
    children: [
      {
        title: "",
        amount: "",
      },
    ],
  });
  // FETCH EXISTING VOUCHERS
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`/api/vouchers/${params.voucherId}`);
      setChecks(response.data?.specificCheck || []);
      console.log("response", response.data);
      setClaimableStatus({
        claimable: response.data?.specificCheck?.claimable === true,
        nonClaimable: response.data?.specificCheck?.claimable === false,
      });
      // supplier name
      const payeeName = await getSuppliers();
      console.log("payeeName", payeeName.data);

      setSuppliers(payeeName.data);
    } catch (error) {
      console.log(error);
    }
  };

  // HANDLE CLAIMABLE STATUS
  const handleClaimableChange = async (type) => {
    setClaimableStatus({
      claimable: type === "claimable",
      nonClaimable: type === "nonClaimable",
    });
    try {
      // make api call to update claimable status
      await axios.put(`/api/vouchers/claimable/${params.voucherId}`, {
        claimable: type === "claimable",
      });

      showSuccess(` ${type} status updated`);
    } catch (error) {
      showError("Failed to update claimable status");
      console.log(error);
    }
  };

  //DELETE VOUCHER
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/vouchers/${id}`);
      //  console.log("delete id", id);
      setChecks((prev) => ({
        ...prev,
        items: prev.items.filter((v) => v.id !== id),
      }));

      showSuccess(`Voucher ${id} deleted successfully`);
      fetchVouchers(); // Refresh the list after deletion
    } catch (error) {
      showError("Failed to delete voucher");
      console.log(error);
    }
  };
  // HANDLE PARENT
  const handleParentChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handlePayeeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, title: value }));

    if (value.trim() === "") {
      setFilteredSuppliers([]);
      setShowSuggestions(false);
      return;
    }

    const matches = suppliers
      .map((s) => s.supplierName)
      .filter((name) => name.toLowerCase().includes(value.toLowerCase()));

    setFilteredSuppliers(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelectSupplier = (name) => {
    setFormData((prev) => ({ ...prev, title: name }));
    setShowSuggestions(false);
    setFilteredSuppliers([]);
  };
  // HANDLE CHILD ROW
  const handleRowChange = (index, e) => {
    const { name, value } = e.target;

    const updatedRows = [...formData.children];

    updatedRows[index][name] = value;

    setFormData((prev) => ({
      ...prev,
      children: updatedRows,
    }));
  };

  // ADD ROW
  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          title: "",
          amount: "",
        },
      ],
    }));
  };

  // DELETE ROW
  const handleDeleteRow = (index) => {
    const filtered = formData.children.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      children: filtered,
    }));
  };

  // SAVE
  const handleSubmit = async () => {
    try {
      if (isEdit) {
        // UPDATE;
        await axios.put(`/api/vouchers/${editId}`, {
          check_id: params.voucherId,
          ...formData,
        });

        // console.log("edit", formData));
        showSuccess(`Voucher updated successfully`);
      } else {
        //CREATE;
        await axios.post(`/api/vouchers/${params.voucherId}`, {
          check_id: params.voucherId,
          ...formData,
        });
        // console.log("add", formData);
        showSuccess("Voucher created successfully");
      }

      fetchVouchers();

      // RESET
      setFormData({
        title: "",
        voucherTypeNumber: "",
        accountCode: "", // ✅
        glCode: "", // ✅
        payment_voucher_date: new Date().toISOString().split("T")[0],
        voucherType: "CASH USD",
        slipNo: "",
        job: "",
        pm: "",
        receiptOrPayment: "", // ✅ dagdag dito
        children: [
          {
            title: "",
            amount: "",
          },
        ],
      });

      setEditId(null);
      setIsEdit(false);

      setOpenModal(false);
    } catch (error) {
      showError("Failed to save voucher");
      console.log(error);
    }
  };

  const handleEdit = (voucher) => {
    setIsEdit(true);

    setEditId(voucher.id);
    // const splitItem = (voucher.payment_item || "").split(" ");

    setFormData({
      title: voucher.title || "",
      voucherTypeNumber: voucher.voucherTypeNumber || "",
      accountCode: voucher.accountCode || "", // ✅ direct na sa column
      glCode: voucher.glCode || "", // ✅ direct na sa column
      payment_voucher_date:
        voucher.payment_voucher_date?.split("T")[0] ||
        voucher.createdAt?.split("T")[0],

      voucherType: voucher.voucherType || "CASH USD",
      slipNo: voucher.slipNo || "",
      receiptOrPayment: voucher.receiptOrPayment || "",
      job: voucher.job || "",
      pm: voucher.pm || "",

      children:
        voucher.children?.length > 0
          ? voucher.children.map((child) => ({
              id: child.id,
              title: child.title,
              amount: child.amount,
            }))
          : [
              {
                title: "",
                amount: "",
              },
            ],
    });
    setOpenModal(true);
  };

  // handle approve
  const handleSubmitForApproval = async () => {
    try {
      //axios
      const submit = await axios.patch(`/api/vouchers/${params.voucherId}`);
      if (submit.status !== 200 && submit.status !== 201) {
        showError("Failed to Submit");
      } else {
        showSuccess("Successfully Forwarded to Chief Account");
        setTimeout(() => {
          router.push("/Main/Vouchers");
        }, 3000);
      }
      setApproving(false);
    } catch (err) {
      showError("Failed to Submit");
      console.log(err.response.data.error_message);
      setApproving(true);
    }
  };

  return (
    <div className="p-5">
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
      </table>
      {/* ADD BUTTON */}
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Voucher
        </button>
      </div>

      {/* EXISTING VOUCHERS */}
      <div className="space-y-5">
        {checks?.items?.map((voucher, index) => (
          <div key={index} className="relative border rounded-lg p-3">
            {/* ACTION BUTTONS */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* EDIT */}
              <button
                onClick={() => handleEdit(voucher)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
              >
                <FiEdit />
              </button>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(voucher.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 rounded"
              >
                Delete
              </button>
            </div>

            <VoucherComponent
              voucher={voucher}
              index={index}
              checkAmount={checks.checkAmount}
            />
          </div>
        ))}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                {isEdit ? "Edit Payment Voucher" : "Create Payment Voucher"}
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                className="text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* PARENT */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                name="payment_voucher_date"
                value={formData.payment_voucher_date}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <select
                name="voucherType"
                value={formData.voucherType}
                onChange={handleParentChange}
                className="border p-2 rounded"
              >
                <option value="CASH USD">CASH USD</option>
                <option value="BANK USD">BANK USD</option>
                <option value="CASH PHP">CASH PHP</option>
                <option value="BANK PHP">BANK PHP</option>
              </select>
              <select
                name="receiptOrPayment"
                value={formData.receiptOrPayment}
                onChange={handleParentChange}
                className="border p-2 rounded"
              >
                <option value="">-- Select Type --</option>
                <option value="receipt">Receipt</option>
                <option value="payment">Payment</option>
              </select>

              <input
                type="number"
                name="slipNo"
                placeholder="Slip No"
                value={formData.slipNo}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              {/* auto suggest  payeename*/}
              <div className="relative">
                <input
                  type="text"
                  name="title"
                  placeholder="Payee Name"
                  value={formData.title}
                  onChange={handlePayeeChange}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  onFocus={() => {
                    if (filteredSuppliers.length > 0) setShowSuggestions(true);
                  }}
                  className="border p-2 rounded w-full"
                />
                {showSuggestions && (
                  <ul className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                    {filteredSuppliers.map((name, index) => (
                      <li
                        key={index}
                        onMouseDown={() => handleSelectSupplier(name)}
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="text"
                name="voucherTypeNumber"
                placeholder={`${formData.voucherType.includes("CASH") ? "Cash No." : "Bank No."}`}
                value={formData.voucherTypeNumber}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="accountCode"
                placeholder="Account Code"
                value={formData.accountCode}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="glCode"
                placeholder="GL Code"
                value={formData.glCode}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="job"
                placeholder="Job#"
                value={formData.job}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="pm"
                placeholder="PM"
                value={formData.pm}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />
            </div>

            {/* CHILDREN */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">Rows</h3>

                <button
                  onClick={handleAddRow}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  + Add Rows
                </button>
              </div>

              {formData.children.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-6">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={row.title}
                      onChange={(e) => handleRowChange(index, e)}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={row.amount}
                      onChange={(e) => handleRowChange(index, e)}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="w-full bg-red-500 text-white p-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpenModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isEdit ? "Update Voucher" : "Save Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* add checkbox claimable and not
       */}
      <div className="flex justify-center mt-6 gap-6">
        <label className="flex items-center gap-2 text-xl ">
          <input
            type="checkbox"
            checked={claimableStatus.claimable}
            onChange={() => handleClaimableChange("claimable")}
          />
          Claimable
        </label>

        <label className="flex items-center gap-2 text-xl ">
          <input
            type="checkbox"
            checked={claimableStatus.nonClaimable}
            onChange={() => handleClaimableChange("nonClaimable")}
          />
          Non-Claimable
        </label>
      </div>
      {/* approving */}
      {isApproving && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <ConfirmBox
            title="Submit For Approval"
            content={"Are you sure you want to submit"}
            id={"for Approval"}
            handleclose={() => setApproving(false)}
            handleConfirm={handleSubmitForApproval}
          />
        </div>
      )}
      {/* buttons  */}
      <div className="flex justify-end  mt-3">
        <button
          title="Total Amount not must be zero"
          onClick={(e) => {
            setApproving(true);
          }}
          className={` ${checks.checkAmount > 0 ? "bg-btnRed text-white hover:bg-black" : "bg-gray-200 text-black"} px-5 py-2 rounded mr-2 `}
          disabled={checks.checkAmount > 0 ? false : true}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default PaymentVouchers;
