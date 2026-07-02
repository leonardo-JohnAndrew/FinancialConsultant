"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const fmt = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const fmtNum = (n) =>
  n != null ?
    Number(n).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  : "0.00";

export default function SummariesPage() {
  const [summaries, setSummaries] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    projec_name: "",
    projec_code: "",
    period_start: "",
    period_end: "",
  });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [toast, setToast] = useState(null);
  const [id, setID] = useState("");
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSummaries = useCallback(async () => {
    try {
      const res = await axios.get("/api/summaries");
      setSummaries(res.data.data || []);
    } catch {
      showToast("Failed to load summaries", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRanges = useCallback(async () => {
    try {
      const res = await axios.get("/api/summaries/cashbook-ranges");
      setRanges(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadSummaries();
    loadRanges();
  }, [loadSummaries, loadRanges]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      projec_name: "",
      projec_code: "",
      period_start: "",
      period_end: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      projec_name: row.projec_name || row.project_name || "",
      projec_code: row.projec_code || row.project_code || "",
      period_start: row.period_start ? row.period_start.slice(0, 10) : "",
      period_end: row.period_end ? row.period_end.slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const handleRangeSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    const found = ranges.find(
      (r) => `${r.dateRangeStart}_${r.dateRangeEnd}` === val,
    );
    if (found) {
      setForm((f) => ({
        ...f,
        period_start:
          found.dateRangeStart ? found.dateRangeStart.slice(0, 10) : "",
        period_end: found.dateRangeEnd ? found.dateRangeEnd.slice(0, 10) : "",
      }));
    }
  };

  const handleSave = async () => {
    if (!form.period_start || !form.period_end) {
      showToast("Please fill all fields", "error");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await axios.put(`/api/summaries/${editTarget.summary_id}`, form);
        showToast("Summary updated");
      } else {
        await axios.post("/api/summaries", form);
        showToast("Summary created");
      }
      setModalOpen(false);
      loadSummaries();
    } catch (err) {
      showToast(err?.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (row) => {
    setSyncing(row.summary_id);
    try {
      const res = await axios.post(`/api/summaries/${row.summary_id}/sync`);
      showToast(`Sync done — ${res.data.data?.itemsCount ?? 0} items synced`);
      if (viewData?.summary_id === row.summary_id) {
        const vres = await axios.get(`/api/summaries/${row.summary_id}`);
        setViewData(vres.data.data);
      }
      loadSummaries();
    } catch (err) {
      showToast(err?.response?.data?.message || "Sync failed", "error");
    } finally {
      setSyncing(null);
    }
  };

  const handleView = async (row) => {
    try {
      const res = await axios.get(`/api/summaries/${row.summary_id}`);
      setID(row.summary_id);
      setViewData(res.data.data);
    } catch {
      showToast("Failed to load details", "error");
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete summary #${row.summary_id}?`)) return;
    try {
      await axios.delete(`/api/summaries/${row.summary_id}`);
      showToast("Deleted");
      if (viewData?.summary_id === row.summary_id) setViewData(null);
      loadSummaries();
    } catch {
      showToast("Delete failed", "error");
    }
  };
  // handle download
  const handleDownload = async (summaryId) => {
    try {
      const res = await axios.get(`/api/summaries/${summaryId}/export`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `summary-${summaryId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast("Export failed", "error");
    }
  };
  // ── field name normalizers (handles both projec_ and project_) ──
  const getName = (d) => d?.projec_name ?? d?.project_name ?? "";
  const getCode = (d) => d?.projec_code ?? d?.project_code ?? "";

  // ── details: support any casing Sequelize may return ──
  const details =
    viewData?.summaryDetails ??
    viewData?.SummaryDetails ??
    viewData?.summarydetails ??
    [];

  const usDetails = details.filter((d) => d.currency === "US");
  const phDetails = details.filter((d) => d.currency === "PH");

  const sum = (arr, field) =>
    arr.reduce((a, d) => a + parseFloat(d[field] || 0), 0);

  const usTotalIn = sum(usDetails, "receipt_in");
  const usTotalOut = sum(usDetails, "payment_out");
  const usBalance = Math.round((usTotalIn - usTotalOut) * 100) / 100;

  const phTotalIn = sum(phDetails, "receipt_in");
  const phTotalOut = sum(phDetails, "payment_out");
  const phBalance = Math.round((phTotalIn - phTotalOut) * 100) / 100;

  // summary-level totals come from any detail row (they're the same per row)
  const anyDetail = details[0];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-md border
          ${toast.type === "error" ? "bg-red-50 text-red-800 border-red-200" : "bg-green-50 text-green-800 border-green-200"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!viewData && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Finance
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                Summaries
              </h1>
            </div>
            <button
              onClick={openAdd}
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Add Summary
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-900">
                  {[
                    "ID",
                    "Project Name",
                    "Project Code",
                    "Period Start",
                    "Period End",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-white text-xs font-semibold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ?
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Loading…
                    </td>
                  </tr>
                : summaries.length === 0 ?
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No summaries yet. Click + Add Summary to create one.
                    </td>
                  </tr>
                : summaries.map((row, i) => (
                    <tr
                      key={row.summary_id}
                      className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-4 py-3 text-gray-500 font-medium">
                        #{row.summary_id}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {getName(row)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {getCode(row)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fmt(row.period_start)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fmt(row.period_end)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <ActionBtn
                            label={
                              syncing === row.summary_id ? "Syncing…" : "Sync"
                            }
                            cls="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            onClick={() => handleSync(row)}
                            disabled={syncing === row.summary_id}
                          />
                          <ActionBtn
                            label="View"
                            cls="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            onClick={() => handleView(row)}
                          />
                          {/* <ActionBtn
                            label="Edit"
                            cls="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            onClick={() => openEdit(row)}
                          /> */}
                          {/* <ActionBtn
                            label="Delete"
                            cls="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={() => handleDelete(row)}
                          /> */}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── DETAIL VIEW ── */}
      {viewData && (
        <div>
          {/* Back + Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewData(null)}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <span className="text-gray-300">|</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Summary Detail
                </p>
                <h1 className="text-xl font-bold text-gray-900">
                  {getName(viewData)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Period:{" "}
                <span className="font-medium text-gray-700">
                  {fmt(viewData.period_start)}
                </span>
                {" ~ "}
                <span className="font-medium text-gray-700">
                  {fmt(viewData.period_end)}
                </span>
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                {getCode(viewData)}
              </span>
            </div>
          </div>

          <h2 className="text-center text-base font-bold text-gray-800 uppercase tracking-wide mb-5">
            Monthly Receipt and Expenditure Summary
          </h2>

          {/* Two-column currency tables */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                label: "US $",
                items: usDetails,
                totalIn: usTotalIn,
                totalOut: usTotalOut,
                balance: usBalance,
              },
              {
                label: "PS",
                items: phDetails,
                totalIn: phTotalIn,
                totalOut: phTotalOut,
                balance: phBalance,
              },
            ].map(({ label, items, totalIn, totalOut, balance }) => {
              // pick breakdown values from the first item of THIS currency group
              const f = items[0];
              return (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-900">
                        <th
                          colSpan={4}
                          className="px-3 py-2 text-center text-white text-xs font-semibold uppercase tracking-wide"
                        >
                          Currency — {label}
                        </th>
                      </tr>
                      <tr className="bg-gray-900 border-t border-gray-700">
                        <th className="px-3 py-2 text-left   text-white text-xs font-semibold w-[40%]">
                          Item
                        </th>
                        <th className="px-3 py-2 text-center text-white text-xs font-semibold w-[15%]">
                          Item Code
                        </th>
                        <th className="px-3 py-2 text-right  text-white text-xs font-semibold w-[22%]">
                          In
                        </th>
                        <th className="px-3 py-2 text-right  text-white text-xs font-semibold w-[22%]">
                          Out
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ?
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-6 text-gray-400 text-xs"
                          >
                            No {label} data — click Sync
                          </td>
                        </tr>
                      : items.map((d, i) => {
                          const isPrev =
                            d.item_name === "Balance from Previous Month";
                          return (
                            <tr
                              key={d.id}
                              className={`border-t border-gray-100 ${
                                isPrev ? "bg-yellow-50 font-medium"
                                : i % 2 === 0 ? "bg-white"
                                : "bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-1.5 text-gray-800 text-xs">
                                {d.item_name}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-600 text-xs font-medium">
                                {d.item_code ?? "—"}
                              </td>
                              <td className="px-3 py-1.5 text-right text-gray-800 text-xs">
                                {fmtNum(d.receipt_in)}
                              </td>
                              <td className="px-3 py-1.5 text-right text-gray-800 text-xs">
                                {fmtNum(d.payment_out)}
                              </td>
                            </tr>
                          );
                        })
                      }

                      {/* Total */}
                      <tr className="border-t-2 border-gray-900 bg-gray-100">
                        <td
                          colSpan={2}
                          className="px-3 py-2 text-gray-900 text-xs font-bold uppercase"
                        >
                          Total
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 text-xs font-bold">
                          {fmtNum(totalIn)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 text-xs font-bold">
                          {fmtNum(totalOut)}
                        </td>
                      </tr>

                      {/* Balance */}
                      <tr className="border-t border-gray-200 bg-gray-50">
                        <td
                          colSpan={2}
                          className="px-3 py-2 text-gray-900 text-xs font-bold uppercase"
                        >
                          Balance
                        </td>
                        <td
                          colSpan={2}
                          className="px-3 py-2 text-right text-blue-700 text-xs font-bold"
                        >
                          {fmtNum(balance)}
                        </td>
                      </tr>

                      {/* Breakdown header */}
                      <tr className="bg-gray-900">
                        <td
                          colSpan={4}
                          className="px-3 py-1.5 text-white text-xs font-semibold uppercase tracking-wide text-center"
                        >
                          Breakdown
                        </td>
                      </tr>

                      {/* Breakdown rows */}
                      {[
                        { label: "Cash in Bank", val: f?.cash_in_bank ?? 0 },
                        { label: "Cash on Hand", val: f?.cash_on_hand ?? 0 },
                        {
                          label: "Check not shown (Outstanding Check)",
                          val: f?.check_not_shown ?? 0,
                        },
                        {
                          label: "Balance for Next Month",
                          val: f?.balance_for_next_month ?? 0,
                          highlight: true,
                        },
                      ].map(({ label: bl, val, highlight }) => (
                        <tr
                          key={bl}
                          className={`border-t border-gray-100 ${highlight ? "bg-yellow-50" : "bg-white"}`}
                        >
                          <td
                            colSpan={3}
                            className={`px-3 py-1.5 text-xs ${highlight ? "font-bold text-gray-900" : "text-gray-700"}`}
                          >
                            {bl}
                          </td>
                          <td
                            className={`px-3 py-1.5 text-right text-xs ${highlight ? "font-bold text-blue-700" : "text-gray-800"}`}
                          >
                            {fmtNum(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* create a button export*/}
          <div className="flex justify-end items-end">
            <button
              className="bg-green-800 p-3 text-white hover:bg-black"
              onClick={() => handleDownload(viewData.summary_id)}
            >
              Export Summary
            </button>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl p-7 w-[480px] max-w-[95vw] shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900">
                {editTarget ? "Edit Summary" : "New Summary"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Period Range — from cashbooks
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3 outline-none focus:border-gray-400"
              defaultValue=""
              onChange={handleRangeSelect}
            >
              <option value="">— Select existing range —</option>
              {ranges.map((r, i) => (
                <option key={i} value={`${r.dateRangeStart}_${r.dateRangeEnd}`}>
                  {fmt(r.dateRangeStart)} → {fmt(r.dateRangeEnd)}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Period Start
                </label>
                <input
                  type="date"
                  readOnly={true}
                  className="w-full border bg-gray-200 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                  value={form.period_start}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, period_start: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Period End
                </label>
                <input
                  type="date"
                  readOnly={true}
                  className="w-full border bg-gray-200 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                  value={form.period_end}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, period_end: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-60 transition-colors"
              >
                {saving ?
                  "Saving…"
                : editTarget ?
                  "Save Changes"
                : "Create Summary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, cls, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border text-xs font-semibold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${cls}`}
    >
      {label}
    </button>
  );
}
