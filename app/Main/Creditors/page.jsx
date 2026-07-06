"use client";

import { clearCreditors } from "@/functions/vouchers";
import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

const API_BASE = "/api/creditors";
const PAGE_SIZE = 20;

const EMPTY_FORM = {
  code: "",
  creditorsName: "",
  address1: "",
  address2: "",
  city: "",
  country: "PH",
  tin1: "",
  tin2: "",
  tin3: "",
};

const REQUIRED_COLS = ["code", "creditorsName"];
const OPTIONAL_COLS = [
  "address1",
  "address2",
  "city",
  "country",
  "tin1",
  "tin2",
  "tin3",
];

// Converts empty strings to null for nullable fields before sending to API
function normalizeForm(form) {
  const NULLABLE = [
    "address1",
    "address2",
    "city",
    "country",
    "tin1",
    "tin2",
    "tin3",
  ];
  const out = { ...form };
  for (const key of NULLABLE) {
    if (out[key] === "") out[key] = null;
  }
  return out;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreditorForm({
  initial = EMPTY_FORM,
  isEdit = false,
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...Object.fromEntries(
      Object.entries(initial).map(([k, v]) => [k, v ?? ""]),
    ),
  }));
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(normalizeForm(form));
  };

  return (
    <form onSubmit={handleSubmit} className="creditor-form">
      <div className="form-row">
        <div className="form-group">
          <label>Code *</label>
          <input
            value={form.code}
            onChange={set("code")}
            required
            placeholder="e.g. 1005"
            disabled={isEdit}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Creditor Name *</label>
        <input
          value={form.creditorsName}
          onChange={set("creditorsName")}
          required
          placeholder="Full name or company"
        />
      </div>
      <div className="form-group">
        <label>Address Line 1</label>
        <input
          value={form.address1}
          onChange={set("address1")}
          placeholder="Street address"
        />
      </div>
      <div className="form-group">
        <label>Address Line 2</label>
        <input
          value={form.address2}
          onChange={set("address2")}
          placeholder="Barangay, subdivision, etc."
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input
            value={form.city}
            onChange={set("city")}
            placeholder="e.g. Makati"
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <select value={form.country} onChange={set("country")}>
            <option value="PH">Philippines (PH)</option>
            <option value="JP">Japan (JP)</option>
            <option value="NL">Netherlands (NL)</option>
            <option value="US">United States (US)</option>
            <option value="">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="tin-section-label">TIN</label>
        <div className="tin-row">
          <div className="form-group">
            <label>TIN 1</label>
            <input
              value={form.tin1}
              onChange={set("tin1")}
              placeholder="000-000-000"
            />
          </div>
          <div className="form-group">
            <label>TIN 2</label>
            <input
              value={form.tin2}
              onChange={set("tin2")}
              placeholder="000-000-000"
            />
          </div>
          <div className="form-group">
            <label>TIN 3</label>
            <input
              value={form.tin3}
              onChange={set("tin3")}
              placeholder="000-000-000"
            />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Creditor"}
        </button>
      </div>
    </form>
  );
}

// ── Import Excel Form (inside modal) ──────────────────────────────────────────
function ImportForm({ onSuccess, onClose }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const isExcel =
      selected.type.includes("spreadsheet") ||
      selected.name.endsWith(".xlsx") ||
      selected.name.endsWith(".xls");
    if (!isExcel) {
      setError("Please upload a valid Excel file (.xlsx or .xls).");
      setFile(null);
      return;
    }
    setFile(selected);
    setError(null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/creditors/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed.");
      } else {
        setResult(data);
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        if (data.created > 0) onSuccess?.();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="import-form">
      {/* Caution notice */}
      <div className="import-caution">
        <span className="import-caution-icon">⚠️</span>
        <div>
          <p className="import-caution-title">
            Make sure your Excel file has these exact column headers:
          </p>
          <p className="import-col-label">Required</p>
          <div className="import-col-list">
            {REQUIRED_COLS.map((col) => (
              <span key={col} className="import-col-tag import-col-required">
                <span className="import-col-asterisk">*</span> {col}
              </span>
            ))}
          </div>
          <p className="import-col-label">Optional</p>
          <div className="import-col-list">
            {OPTIONAL_COLS.map((col) => (
              <span key={col} className="import-col-tag import-col-optional">
                {col}
              </span>
            ))}
          </div>
          <ul className="import-rules">
            <li>
              Column names are <strong>case-sensitive</strong> — use exactly as
              shown.
            </li>
            <li>
              Rows with a duplicate <code>code</code> will be skipped.
            </li>
            <li>
              Rows missing <code>code</code> or <code>creditorsName</code> will
              be skipped.
            </li>
          </ul>
        </div>
      </div>

      {/* File picker */}
      <div className="form-group" style={{ marginTop: 4 }}>
        <label>Select Excel File</label>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="import-file-input"
        />
        {file && (
          <span className="import-file-name">
            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="import-alert import-alert-error">❌ {error}</div>
      )}

      {/* Result */}
      {result && (
        <div className="import-alert import-alert-success">
          <p className="import-result-title">✅ Import complete</p>
          <div className="import-result-stats">
            <span>
              <strong>{result.created}</strong> created
            </span>
            <span>
              <strong>{result.skipped}</strong> skipped
            </span>
            <span>
              <strong>{result.errors?.length ?? 0}</strong> errors
            </span>
          </div>
          {result.errors?.length > 0 && (
            <ul className="import-error-list">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Close
        </button>
        {(file || result || error) && !result && (
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Clear
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleImport}
          disabled={!file || loading}
        >
          {loading ? "Importing…" : "Import"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditorsPage() {
  const [creditors, setCreditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCreditors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`,
      );
      const data = await res.json();
      setCreditors(data.rows ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      showToast("Failed to load creditors.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCreditors();
  }, [fetchCreditors]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAdd = async (form) => {
    setFormLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      showToast("Creditor added.");
      setModal(null);
      fetchCreditors();
    } catch (err) {
      showToast(err.message || "Failed to add creditor.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${form.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      showToast("Creditor updated.");
      setModal(null);
      fetchCreditors();
    } catch (err) {
      showToast(err.message || "Failed to update creditor.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    const { creditor } = modal;
    console.log("Deleting code:", creditor.code); // ← dagdag to
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${creditor.code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      showToast("Creditor deleted.");
      setModal(null);
      fetchCreditors();
    } catch {
      showToast("Failed to delete creditor.", "error");
    } finally {
      setFormLoading(false);
    }
  };
  const handleExport = async () => {
    try {
      showToast("Preparing export...", "success");

      let allRows = [];
      let currentPage = 1;
      let totalPages = 1;
      const EXPORT_PAGE_SIZE = 100; // safe chunk size, adjust if needed

      do {
        const res = await fetch(
          `${API_BASE}?page=${currentPage}&limit=${EXPORT_PAGE_SIZE}`,
        );
        const data = await res.json();
        allRows = allRows.concat(data.rows ?? []);
        totalPages = data.totalPages ?? 1;
        currentPage++;
      } while (currentPage <= totalPages);

      if (allRows.length === 0) {
        showToast("No creditors to export.", "error");
        return;
      }

      const headers = [
        "code",
        "creditorsName",
        "address1",
        "address2",
        "city",
        "country",
        "tin1",
        "tin2",
        "tin3",
      ];

      const aoa = [
        headers,
        ...allRows.map((c) =>
          headers.map((h) => {
            const val = c[h];
            return val === null || val === undefined ? "" : val;
          }),
        ),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws, "Creditors");

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `NSTREN_Creditors_Export_${dateStr}.xlsx`);

      showToast(
        `Exported ${allRows.length} creditor${allRows.length !== 1 ? "s" : ""}.`,
      );
    } catch {
      showToast("Failed to export creditors.", "error");
    }
  };
  const handleClear = async () => {
    const ok = confirm("Delete ALL creditors?");
    if (!ok) return;

    const result = await clearCreditors();

    if (result.success) {
      showToast(result.message);
      fetchCreditors(); // kung client fetch ang gamit mo
    } else {
      showToast(result.message, "error");
    }
  };
  const handleDownloadTemplate = () => {
    const headers = [
      "code",
      "creditorsName",
      "address1",
      "address2",
      "city",
      "country",
      "tin1",
      "tin2",
      "tin3",
    ];
    const sampleRow = [
      "1005",
      "Juan Dela Cruz Trading",
      "123 Rizal Street",
      "Brgy. San Jose",
      "Makati",
      "PH",
      "000-000-000",
      "000-000-000",
      "000-000-000",
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    ws["!cols"] = headers.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, "Creditors");
    XLSX.writeFile(wb, "NSTREN_Creditors_Import_Template.xlsx");
  };

  return (
    <>
      <style>{`
       

        .page { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
        .page-subtitle { font-size: 0.875rem; color: #6b7280; margin-top: 2px; }

        .toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .search-input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; width: 260px; outline: none; transition: border-color 0.15s; background: #fff; }
        .search-input:focus { border-color: #3b82f6; }

        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; transition: background 0.15s; }
        .btn-primary { background: #2563eb; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        .btn-secondary { background: #f3f4f6; color: #374151; }
        .btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
        .btn-success { background: #16a34a; color: #fff; }
        .btn-success:hover:not(:disabled) { background: #15803d; }
        .btn-danger { background: #dc2626; color: #fff; }
        .btn-danger:hover:not(:disabled) { background: #b91c1c; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; color: #6b7280; padding: 4px 8px; border-radius: 4px; }
        .btn-icon:hover { background: #f3f4f6; }

        .table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        thead { background: #f9fafb; }
        th { text-align: left; padding: 12px 16px; color: #374151; font-weight: 600; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e7eb; }
        td { padding: 12px 16px; color: #111827; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f9fafb; }

        .code-badge { display: inline-block; background: #eff6ff; color: #2563eb; font-weight: 600; padding: 2px 8px; border-radius: 6px; font-size: 0.8125rem; font-family: monospace; }
        .tin-text { color: #6b7280; font-size: 0.8125rem; font-family: monospace; }
        .country-badge { display: inline-block; background: #f0fdf4; color: #16a34a; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
        .addr-text { color: #6b7280; font-size: 0.8125rem; }

        .row-actions { display: flex; gap: 4px; }
        .action-btn { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; }
        .action-edit { color: #2563eb; }
        .action-edit:hover { background: #eff6ff; }
        .action-delete { color: #dc2626; }
        .action-delete:hover { background: #fef2f2; }

        .pagination { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; }
        .pag-btns { display: flex; gap: 4px; }
        .pag-btn { padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.8125rem; }
        .pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pag-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }

        .empty-state { text-align: center; padding: 48px 16px; }
        .empty-state p { font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 4px; }
        .empty-state span { font-size: 0.875rem; color: #9ca3af; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
        .modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; padding: 28px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { font-size: 1.125rem; font-weight: 700; color: #111827; }

        .creditor-form { display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .tin-section-label { font-size: 0.8125rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        .tin-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
        .form-group input, .form-group select { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
        .form-group input:focus, .form-group select:focus { border-color: #3b82f6; }
        .form-group input:disabled { background: #f9fafb; color: #9ca3af; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }

        .delete-body { padding: 4px 0 20px; color: #374151; font-size: 0.9375rem; line-height: 1.6; }
        .delete-body strong { color: #111827; }

        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; z-index: 100; animation: slide-up 0.2s ease; }
        .toast-success { background: #052e16; color: #bbf7d0; }
        .toast-error { background: #450a0a; color: #fecaca; }
        @keyframes slide-up { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* ── Import styles ── */
        .import-form { display: flex; flex-direction: column; gap: 16px; }
        .import-caution { display: flex; gap: 12px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; }
        .import-caution-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .import-caution-title { font-size: 0.8125rem; font-weight: 600; color: #92400e; margin-bottom: 10px; }
        .import-col-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #b45309; margin-bottom: 5px; margin-top: 2px; }
        .import-col-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .import-col-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 5px; font-size: 0.75rem; font-family: monospace; font-weight: 600; }
        .import-col-required { background: #fef3c7; border: 1px solid #f59e0b; color: #78350f; }
        .import-col-optional { background: #fff; border: 1px solid #fcd34d; color: #92400e; font-weight: 400; }
        .import-col-asterisk { color: #dc2626; font-size: 0.875rem; }
        .import-rules { font-size: 0.75rem; color: #92400e; list-style: disc; padding-left: 14px; display: flex; flex-direction: column; gap: 3px; }
        .import-rules code { background: #fef3c7; padding: 0 3px; border-radius: 3px; font-size: 0.7rem; }
        .import-file-input { padding: 6px; border: 1px dashed #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #f9fafb; cursor: pointer; width: 100%; }
        .import-file-name { font-size: 0.75rem; color: #6b7280; margin-top: 4px; display: block; }
        .import-alert { border-radius: 8px; padding: 12px 14px; font-size: 0.875rem; }
        .import-alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
        .import-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .import-result-title { font-weight: 600; margin-bottom: 6px; }
        .import-result-stats { display: flex; gap: 16px; font-size: 0.875rem; }
        .import-error-list { margin-top: 8px; font-size: 0.75rem; color: #dc2626; list-style: disc; padding-left: 14px; max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }

        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .tin-row { grid-template-columns: 1fr; }
          .search-input { width: 100%; }
          th:nth-child(3), td:nth-child(3),
          th:nth-child(5), td:nth-child(5) { display: none; }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Creditors Masterlist</div>
            <div className="page-subtitle">
              {total} creditor{total !== 1 ? "s" : ""} total
            </div>
          </div>
          <div className="toolbar">
            <input
              className="search-input"
              placeholder="Search name, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-secondary"
              onClick={handleDownloadTemplate}
            >
              ⬇ Template
            </button>
            <button className="btn btn-secondary" onClick={handleExport}>
              ⬇ Export
            </button>
            <button
              className="btn btn-success"
              onClick={() => setModal("import")}
            >
              ↑ Import Excel
            </button>
            <button className="btn btn-primary" onClick={() => setModal("add")}>
              + Add Creditor
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              🗑 Clear All
            </button>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>TIN</th>
                <th>Country</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 48,
                      color: "#9ca3af",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : creditors.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>No creditors found</p>
                      <span>Try a different search or add a new creditor.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                creditors.map((c) => (
                  <tr key={c.code}>
                    <td>
                      <span className="code-badge">{c.code}</span>
                    </td>
                    <td>
                      {c.creditorsName || (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>
                    <td>
                      <div>{c.address1}</div>
                      {c.address2 && (
                        <div className="addr-text">{c.address2}</div>
                      )}
                    </td>
                    <td>{c.city || "-"}</td>
                    <td>
                      <div className="tin-text">{c.tin1 || "-"}</div>
                      {c.tin2 && <div className="tin-text">{c.tin2}</div>}
                      {c.tin3 && <div className="tin-text">{c.tin3}</div>}
                    </td>
                    <td>
                      {c.country && (
                        <span className="country-badge">{c.country}</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="action-btn action-edit"
                          onClick={() =>
                            setModal({ type: "edit", creditor: c })
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() =>
                            setModal({ type: "delete", creditor: c })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="pag-btns">
                <button
                  className="pag-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  &laquo;
                </button>
                <button
                  className="pag-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  &lsaquo;
                </button>
                <button className="pag-btn active">{page}</button>
                <button
                  className="pag-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  &rsaquo;
                </button>
                <button
                  className="pag-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Import Modal ── */}
      {modal === "import" && (
        <Modal
          title="Import Creditors via Excel"
          onClose={() => setModal(null)}
        >
          <ImportForm
            onSuccess={() => {
              fetchCreditors();
              showToast("Creditors imported successfully.");
            }}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {modal === "add" && (
        <Modal title="Add Creditor" onClose={() => setModal(null)}>
          <CreditorForm
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Edit Creditor" onClose={() => setModal(null)}>
          <CreditorForm
            initial={modal.creditor}
            isEdit
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal title="Delete Creditor" onClose={() => setModal(null)}>
          <div className="delete-body">
            Are you sure you want to delete{" "}
            <strong>
              {modal.creditor.creditorsName ||
                `Creditor #${modal.creditor.code}`}
            </strong>
            ?
          </div>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setModal(null)}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
