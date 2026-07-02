"use client";
import { useBanner } from "@/hooks/Context/banner";
import axios from "axios";
import React, { useState } from "react";

const getStartOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

const getEndOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
};

const initialForm = {
  project: "9665R7268",
  combination: "",
  dateRangeStart: getStartOfMonth(),
  dateRangeEnd: getEndOfMonth(),
};

const COMBINATION_OPTIONS = ["PH Cash", "PH Bank", "US Bank", "US Cash"];
const AddCashbookModal = ({
  isOpen,
  onClose,
  fetchCashbooks,
  existingCashbooks = [],
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useBanner();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.combination)
      newErrors.combination = "Currency/Category is required";
    if (!form.dateRangeStart)
      newErrors.dateRangeStart = "Start date is required";
    if (!form.dateRangeEnd) newErrors.dateRangeEnd = "End date is required";

    if (form.combination && form.dateRangeStart && form.dateRangeEnd) {
      const [currency, category] = form.combination.split(" ");
      const newStart = new Date(form.dateRangeStart).getTime();
      const newEnd = new Date(form.dateRangeEnd).getTime();

      // check lang sa records na kaparehas ng currency+category
      const isDuplicate = existingCashbooks.some((cb) => {
        const sameCombination =
          cb.currency === currency && cb.category === category;
        if (!sameCombination) return false;

        const existingStart = new Date(cb.dateRangeStart).getTime();
        const existingEnd = new Date(cb.dateRangeEnd).getTime();

        return existingStart === newStart && existingEnd === newEnd;
      });

      if (isDuplicate) {
        newErrors.dateRangeEnd = `A ${form.combination} cashbook with this date range already exists`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post("/api/cashbooks", form);
      showSuccess("Cashbook added successfully");
      setForm(initialForm);
      onClose();
      fetchCashbooks();
    } catch (err) {
      showError(err.response?.data?.error_message || "Failed to add cashbook");
    } finally {
      setLoading(false);
    }
  };

  // ...rest ng JSX walang binago

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Cashbook</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project - default, not required to fill */}
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              name="project"
              value={form.project}
              onChange={handleChange}
              className="w-full border bg-gray-200 rounded-md px-3 py-2"
              disabled={true}
              readOnly={true}
            />
          </div>

          {/* Combined Currency + Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Currency / Category
            </label>
            <select
              name="combination"
              value={form.combination}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              {COMBINATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.combination && (
              <p className="text-red-500 text-xs mt-1">{errors.combination}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Date Start
              </label>
              <input
                type="date"
                name="dateRangeStart"
                value={form.dateRangeStart}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.dateRangeStart && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateRangeStart}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date End</label>
              <input
                type="date"
                name="dateRangeEnd"
                value={form.dateRangeEnd}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.dateRangeEnd && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateRangeEnd}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCashbookModal;
