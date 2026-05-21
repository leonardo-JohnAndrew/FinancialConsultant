"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import VoucherComponent from "@/app/components/vouchers";
import { useParams } from "next/navigation";
import { FiEdit } from "react-icons/fi";
const PaymentVouchers = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const params = useParams();
  // EXISTING VOUCHERS
  const [checks, setChecks] = useState([]);

  // FORM DATA
  const [formData, setFormData] = useState({
    title: "",
    cash: "",
    payment_item: "",
    job: "",
    pm: "",
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
    } catch (error) {
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
        // UPDATE
        await axios.put(`/api/vouchers/${editId}`, {
          check_id: params.voucherId,
          ...formData,
        });

        alert("Voucher Updated");
      } else {
        // CREATE
        await axios.post(`/api/vouchers/${params.voucherId}`, {
          check_id: params.voucherId,
          ...formData,
        });

        alert("Voucher Created");
      }

      fetchVouchers();

      // RESET
      setFormData({
        title: "",
        cash: "",
        payment_item: "",
        job: "",
        pm: "",
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
      console.log(error);
    }
  };

  const handleEdit = (voucher) => {
    setIsEdit(true);

    setEditId(voucher.id);

    setFormData({
      title: voucher.title || "",
      cash: voucher.cash || "",
      payment_item: voucher.payment_item || "",
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
  return (
    <div className="p-5">
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
            {/* EDIT BUTTON */}
            <button
              onClick={() => handleEdit(voucher)}
              className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
            >
              <FiEdit />
            </button>

            <VoucherComponent key={voucher.id || index} voucher={voucher} />
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
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="number"
                name="cash"
                placeholder="Cash No."
                value={formData.cash}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="payment_item"
                placeholder="Payment Item"
                value={formData.payment_item}
                onChange={handleParentChange}
                className="border p-2 rounded"
              />

              <input
                type="text"
                name="job"
                placeholder="Job"
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
    </div>
  );
};

export default PaymentVouchers;
