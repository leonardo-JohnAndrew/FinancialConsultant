"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import VoucherComponent from "@/app/components/vouchers";
import { useParams, useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import ConfirmBox from "@/app/components/modals/confirmbox";
import { useBanner } from "@/hooks/Context/banner";
import { getSuppliers } from "@/functions/supplier";
import useUserContext from "@/hooks/Context/UserContext";
import {
  GetAccountCode,
  GetCashAndBankNo,
  GetGLCode,
  UpdateAttachment,
} from "@/functions/vouchers";
import {
  sendVoucherApprovedEmail,
  sendVoucherForwardedEmail,
} from "@/lib/sendWelcomeEmail";
import { findDepartment, findSpecificRole } from "@/functions/notification";
const PaymentVouchers = () => {
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [selectedCalculationId, setSelectedCalculationId] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("+");
  const [calculationValue, setCalculationValue] = useState("");
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
  const [codeList, setCodeList] = useState([]);
  const [glCode, setGLcode] = useState([]);
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
    payment_voucher_date: "",
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
  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState("");

  //file attachment
  const handleChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const localPreview = URL.createObjectURL(file);

    setPreview(localPreview); // instant preview

    try {
      const result = await UpdateAttachment({
        id: params.voucherId,
        file,
      });

      showSuccess("File Uploaded");
    } catch (err) {
      showError("Failed Upload File");
    }
  };
  // FETCH EXISTING VOUCHERS
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`/api/vouchers/${params.voucherId}`);
      setChecks(response.data?.specificCheck || []);
      //  console.log("response", response.data);
      setClaimableStatus({
        claimable: response.data?.specificCheck?.claimable === true,
        nonClaimable: response.data?.specificCheck?.claimable === false,
      });
      setAttachment(response.data?.cheque_attachment);
      // supplier name
      const payeeName = await getSuppliers();
      //    console.log("payeeName", payeeName.data);
      // account codes
      const codes = await GetAccountCode();
      //GL CODEs
      const glcode = await GetGLCode();

      setGLcode(glcode.dataList);
      setSuppliers(payeeName.data);
      setCodeList(codes.dataList);
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

      showSuccess(`Voucher deleted successfully`);
      fetchVouchers(); // Refresh the list after deletion
    } catch (error) {
      showError("Failed to delete voucher");
      console.log(error);
    }
  };
  // HANDLE PARENT
  const handleParentChange = async (e) => {
    const { name, value } = e.target;

    // Kapag voucherType ang binago
    if (name === "voucherType") {
      const cashNo = await GetCashAndBankNo(value);
      setFormData((prev) => ({
        ...prev,
        voucherType: value,
        voucherTypeNumber: cashNo.code || "033N2",
      }));

      return;
    }
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
      voucherTypeNumber: voucher.voucherTypeNumber || "033N2",
      accountCode: voucher.accountCode || "", // ✅ direct na sa column
      glCode: voucher.glCode || "", // ✅ direct na sa column
      payment_voucher_date: voucher.payment_voucher_date?.split("T")[0] || "",
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
        //notification system
        // get chief Accountant ROle
        const chiefAccountant = await findSpecificRole("Chief Accountant");

        // api notif post
        for (const chief of chiefAccountant?.data || []) {
          await axios.post("/api/notification", {
            userId: chief.userID,
            title: "Payment and Receipt Vouchers",
            message: `${user.name} Forwarded Vooucher List ID : ${params.voucherId}`,
            type: "Info",
            link: "/Main/Vouchers",
            // localhost link
          });
        }
        for (const chief of chiefAccountant?.data || []) {
          await sendVoucherForwardedEmail({
            toEmail: chief.email,
            voucherNo: params.voucherId,
            forwardedBy: user.name,
            forwardedByRole: user.role,
            forwardedTo: chief.firstname + " " + chief.lastname,
            appUrl: "",
            // local host link
          });
        }
        showSuccess("Successfully Forwarded to Chief Accountant");
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
    // notification email
  };
  // cancel handle
  const handleCancel = () => {
    setApproving(false);
    Signaturefunction(userRole, user.e_sign, "remove");
  };

  // handle confirm
  const handleConfirm = async () => {
    let response;
    // userole switch
    switch (userRole) {
      case "Chief Administrator Manager":
        //axios
        response = await axios.post(
          `/api/vouchers/approvals/chiefAdmin?VRID=${params.voucherId}`,
          {
            e_sign: user?.e_sign,
          },
        );
        if (response.status === 200 || response.status === 201) {
          //notification all accounting
          const accounting = await findDepartment("Accounting");
          for (const Accounting of accounting?.data || []) {
            // system
            await axios.post("/api/notification", {
              userId: Accounting.userID,
              title: "Vouchers Approval",
              message: `Chief Administrator Manager: ${user.name} Approved Voucher List ID: ${params.voucherId}`,
              type: `Info`,
              link: `/Main/Vouchers/${params.voucherId}`,
            });
          }
          for (const Accounting of accounting?.data || []) {
            // email
            await sendVoucherApprovedEmail({
              toEmail: Accounting.email,
              voucherNo: params.voucherId,
              approvedBy: user.name,
              approvedByRole: "Chief Administrator Manager",
              appUrl: "",
            });
          }
          showSuccess(response.data?.message);
        } else {
          showError("Failed Vouchers Approval");
          return;
        }
        break;
      case "Chief Accountant":
        //axios
        response = await axios.post(
          `/api/vouchers/approvals/chiefAccountant?VRID=${params.voucherId}`,
          {
            e_sign: user?.e_sign,
          },
        );
        if (response.status === 200 || response.status === 201) {
          // notification chief Admin
          const chiefAdmin = await findSpecificRole(
            "Chief Administrator Manager",
          );
          for (const chief of chiefAdmin?.data || []) {
            // system
            await axios.post("/api/notification", {
              userId: chief.userID,
              title: "Vouchers Approval",
              message: `Chief Accountant: ${user.name} Approved Voucher List ID: ${params.voucherId}`,
              type: `Info`,
              link: `/Main/Vouchers/${params.id}`,
            });
          }
          for (const chief of chiefAdmin?.data || []) {
            // email
            await sendVoucherApprovedEmail({
              toEmail: chief.email,
              voucherNo: params.voucherId,
              approvedBy: user.name,
              approvedByRole: "Chief Accountant",
              appUrl: "",
            });
          }
          showSuccess(response.data?.message);
        } else {
          showError("Failed Vouchers Approval");
          return;
        }
        break;
      default:
        break;
    }
    setTimeout(() => {
      router.push("/Main/Vouchers");
    }, 1000);
  };

  //handle Approving
  const handleApprove = () => {
    setApproving(true);
    // set signature
    Signaturefunction(userRole, user.e_sign, "add");
  };
  const Signaturefunction = (role, e_sign, action) => {
    switch (role) {
      case "Chief Accountant":
        if (action === "add") {
          setChiefAccountSignature(e_sign);
          // axios  post

          return;
        } else if (action === "remove") {
          setChiefAccountSignature(null);
          return;
        }
        break;

      case "Chief Administrator Manager":
        if (action === "add") {
          setChiefAdminSignature(e_sign);
          //axios post
          return;
        } else if (action === "remove") {
          setChiefAdminSignature(null);
          return;
        }
        break;
      default:
        break;
    }
  };
  const calculationOptions = useMemo(() => {
    return (
      checks?.items?.flatMap((item) =>
        (item.children || []).map((child) => ({
          id: child.id,
          title: child.title,
          amount: Number(child.amount),
        })),
      ) || []
    );
  }, [checks]);
  const handleDownload = async () => {
    const res = await axios.get(
      `/api/voucher-export?checkId=${params.voucherId}`,
      {
        responseType: "blob",
      },
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `voucher-${params.voucherId}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCalculationConfirm = () => {
    const selectedItem = calculationOptions.find(
      (item) => item.id === Number(selectedCalculationId),
    );

    if (!selectedItem) return;

    const baseAmount = selectedItem.amount;
    const value = Number(calculationValue);

    let result = baseAmount;

    switch (selectedOperator) {
      case "+":
        result = baseAmount + value;
        break;

      case "-":
        result = baseAmount - value;
        break;

      case "*":
        result = baseAmount * value;
        break;

      case "/":
        result = baseAmount / value;
        break;

      default:
        break;
    }

    const updatedRows = [...formData.children];

    updatedRows[selectedRowIndex].amount = result.toFixed(2);

    setFormData((prev) => ({
      ...prev,
      children: updatedRows,
    }));

    setShowCalculationModal(false);
  };

  const handleExportCheque = async () => {
    try {
      const res = await axios.get(`/api/vouchers/${params.voucherId}/export`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.ms-excel.sheet.macroEnabled.12",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Check-Preparation-${params.voucherId}.xlsm`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showError("Failed to export cheque");
    }
  };
  return (
    <div className="p-5">
      {/* {JSON.stringify(checks)} */}
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
                {isEdit
                  ? `Edit ${formData.receiptOrPayment === "payment" ? "Payment" : "Receipt"} Voucher`
                  : `Create ${formData.receiptOrPayment === "payment" ? "Payment" : "Receipt"} Voucher`}
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
                placeholder="Voucher Date"
                value={formData.payment_voucher_date}
                onChange={handleParentChange}
                className="border p-2 rounded "
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
                value={formData.voucherTypeNumber || "033N2"}
                readOnly
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                list="account_code"
                name="accountCode"
                placeholder="Account Code"
                value={formData.accountCode}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />
              <datalist id="account_code">
                {codeList.map((item, index) => (
                  <option key={index} value={item.code}>
                    {item.description}
                  </option>
                ))}
              </datalist>

              <input
                list="gl_code"
                name="glCode"
                placeholder="GL Code"
                value={formData.glCode}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />
              <datalist id="gl_code">
                {glCode.map((item, index) => (
                  <option key={index} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </datalist>
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

                    <button
                      type="button"
                      className="mt-2 w-full bg-blue-500 text-white py-2 rounded"
                      onClick={() => {
                        setSelectedRowIndex(index);

                        setSelectedCalculationId("");
                        setSelectedOperator("+");
                        setCalculationValue("");

                        setShowCalculationModal(true);
                      }}
                    >
                      Add Formula
                    </button>
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
      {/* file cheque attachment */}
      {checks?.ChiefAccountSignature !== null &&
        checks?.ChiefAdminSignature !== null && (
          // file attachment
          <>
            {(preview || checks?.cheque_attachment) &&
              ((preview || checks?.cheque_attachment)
                .toLowerCase()
                .includes(".pdf") ? (
                <div className="flex justify-center items-center">
                  <iframe
                    src={preview || checks?.cheque_attachment}
                    className="w-full h-[600px] border rounded m-5"
                    title="Attachment Preview"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <img
                    src={preview || checks?.cheque_attachment}
                    alt="Attachment Preview"
                    className="w-full max-h-96 border rounded m-5"
                  />
                </div>
              ))}
          </>
        )}
      <div className="flex justify-end mt-4">
        <div className="flex justify-end">
          <button
            onClick={handleExportCheque}
            className="bg-green-700 text-white font-bold my-2 hover:bg-green-900 px-4 py-2 rounded"
          >
            Export Cheque
          </button>
        </div>
      </div>
      <div className="flex justify-end items-end mt-4">
        <button
          onClick={handleDownload}
          className="bg-green-700 text-white font-bold my-2 hover:bg-green-900 px-4 py-2 rounded"
        >
          Export Voucher
        </button>
      </div>
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
      {/* table  */}
      {/* e-signature*/}
      {
        <table className="mt-30 w-full table-fixed bg-gray-100 border border-gray-200">
          <tbody>
            <tr className="text-left">
              <td className="p-2 w-1/3">Approved by:</td>
              <td className="p-2 w-1/3">Approved by:</td>
            </tr>

            <tr className="text-center">
              {/* Chief Accountant */}
              <td className="p-2 relative w-1/3">
                {/* show saved signature from DB, or preview if currently approving */}
                {(checks?.ChiefAccountSignature || ChiefAccountSignature) && (
                  <img
                    src={ChiefAccountSignature || checks?.ChiefAccountSignature}
                    alt="Chief Accountant Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>Laarni Cruz</span>
              </td>

              {/* Chief Admin Manager */}
              <td className="p-2 relative w-1/3">
                {(checks?.ChiefAdminSignature || ChiefAdminSignature) && (
                  <img
                    src={ChiefAdminSignature || checks?.ChiefAdminSignature}
                    alt="Chief Admin Manager Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>Kai Sumitomo</span>
              </td>
            </tr>

            <tr className="text-center">
              <td className="text-white bg-black py-2 w-1/3">
                Chief Accountant
              </td>
              <td className="text-white bg-black py-2 w-1/3">
                Chief Administrator Manager
              </td>
            </tr>
          </tbody>
        </table>
      }
      {/* approving */}
      {isApproving &&
        userRole !== "Chief Accountant" &&
        userRole !== "Chief Administrator Manager" && (
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

      {(userRole === "Chief Accountant" ||
        userRole === "Chief Administrator Manager") &&
        (isApproving ? (
          <div className="flex justify-end gap-4 mt-10 mb-10">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-darkRed border border-darkRed text-white font-bold rounded hover:bg-red-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
            >
              Confirm
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-4 mt-10 mb-10">
            {/* ✅ Show Accept only if THIS role hasn't signed yet */}
            {((userRole === "Chief Accountant" &&
              !checks?.ChiefAccountSignature) ||
              (userRole === "Chief Administrator Manager" &&
                !checks?.ChiefAdminSignature)) && (
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
              >
                Accept
              </button>
            )}
          </div>
        ))}

      {/* ✅ Submit button — only show if no one has signed yet */}
      {userRole !== "Chief Accountant" &&
        userRole !== "Chief Administrator Manager" &&
        !checks?.ChiefAccountSignature &&
        !checks?.ChiefAdminSignature && (
          <div className="flex justify-end mt-3">
            <button
              title="Total Amount must not be zero"
              onClick={() => setApproving(true)}
              className={`${
                checks.checkAmount > 0
                  ? "bg-btnRed text-white hover:bg-black"
                  : "bg-gray-200 text-black"
              } px-5 py-2 rounded mr-2`}
              disabled={checks.checkAmount <= 0}
            >
              Submit
            </button>
          </div>
        )}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Calculation</h2>

            {/* Existing Description */}
            <select
              value={selectedCalculationId}
              onChange={(e) => setSelectedCalculationId(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select Description</option>

              {calculationOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.amount.toLocaleString()})
                </option>
              ))}
            </select>

            {/* Operation */}
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
            </select>

            {/* Value */}
            <input
              type="number"
              placeholder="Enter Value"
              value={calculationValue}
              onChange={(e) => setCalculationValue(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setShowCalculationModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleCalculationConfirm}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVouchers;
