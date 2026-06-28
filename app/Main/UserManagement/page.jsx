"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import UpdateUserModal from "../../components/modals/usermanagement/update";
import * as XLSX from "xlsx";

// ── Toast System ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

function ToastContainer({ toasts, removeToast }) {
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-500",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-500",
    },
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const s = styles[t.type] || styles.info;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md min-w-[280px] max-w-[360px] pointer-events-auto animate-slide-in ${s.bg} ${s.border}`}
            style={{ animation: "toastSlideIn 0.25s ease" }}
          >
            <span
              className={`text-base mt-0.5 font-semibold flex-shrink-0 ${s.icon}`}
            >
              {icons[t.type]}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-medium leading-tight ${s.text}`}>
                {t.title}
              </p>
              {t.message && (
                <p className={`text-xs mt-0.5 opacity-80 ${s.text}`}>
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className={`text-xs opacity-40 hover:opacity-80 transition-opacity ${s.text} leading-none mt-0.5`}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deptFilter, setDeptFilter] = useState("All");
  const [importing, setImporting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  const { toasts, showToast, removeToast } = useToast();

  // ── Roles (static) & Departments (dynamic) ──────────────────
  const [roles] = useState([
    "SuperAdmin",
    "Admin",
    "Accounting",
    "Chief Accountant",
    "Chief Administrator Manager",
    "Project Director",
    "Regular Employee",
  ]);
  const [departments, setDepartments] = useState([]);

  // ── Manage Modal state (departments only) ───────────────────
  const [showManageModal, setShowManageModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [manageSaving, setManageSaving] = useState(false);

  const deptFilterOptions = [
    "All",
    ...new Set(users.map((u) => u.department).filter(Boolean)),
  ];

  // ── Close dropdown on outside click ─────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(e.target)
      ) {
        setDeptDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchDepartments = async () => {
    const res = await fetch("/api/departments");
    const data = await res.json();
    setDepartments((data.departments || []).map((d) => d.name));
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // ── Manage Modal actions (departments only) ──────────────────
  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    setManageSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(
          "error",
          "Failed to add department",
          data.error || "Something went wrong.",
        );
        return;
      }
      setNewDeptName("");
      await fetchDepartments();
      showToast(
        "success",
        "Department added",
        `"${newDeptName.trim()}" has been added.`,
      );
    } finally {
      setManageSaving(false);
    }
  };

  const handleDeleteDept = async (name) => {
    if (
      !confirm(
        `Delete department "${name}"? Users in this department won't be affected.`,
      )
    )
      return;
    const res = await fetch(
      `/api/departments?name=${encodeURIComponent(name)}`,
      {
        method: "DELETE",
      },
    );
    if (res.ok) {
      showToast("success", "Department deleted", `"${name}" has been removed.`);
    } else {
      showToast("error", "Failed to delete department", "Please try again.");
    }
    await fetchDepartments();
  };

  // ── Form handlers ────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setForm({ userID: "", role: "", department: "" });
    setShowModal(true);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const action = newStatus === "Inactive" ? "disable" : "enable";
    if (
      !confirm(
        `Are you sure you want to ${action} ${user.firstname} ${user.lastname}?`,
      )
    )
      return;

    setTogglingId(user.userID);
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      const res = await fetch(
        `/api/users/manage?id=${encodeURIComponent(user.userID)}`,
        {
          method: "PATCH",
          body: formData,
        },
      );
      if (res.ok) {
        await fetchUsers();
        showToast(
          "success",
          `User ${newStatus === "Active" ? "enabled" : "disabled"}`,
          `${user.firstname} ${user.lastname} is now ${newStatus}.`,
        );
      } else {
        const data = await res.json();
        showToast(
          "error",
          "Failed to update status",
          data.error || "Please try again.",
        );
      }
    } catch {
      showToast(
        "error",
        "Something went wrong",
        "Could not update user status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key] || "");
    }
    const res = await fetch("/api/users", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      const msg =
        data.error_message ?
          typeof data.error_message === "object" ?
            JSON.stringify(data.error_message, null, 2)
          : data.error_message
        : "Failed to add user.";
      showToast("error", "Failed to add user", msg);
      return;
    }
    setShowModal(false);
    setForm({});
    await fetchUsers();
    showToast(
      "success",
      "User added",
      "A welcome email has been sent to the new user.",
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this user?"))
      return;
    const res = await fetch(`/api/users/manage?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast(
        "success",
        "User deleted",
        "The user has been permanently removed.",
      );
    } else {
      showToast("error", "Failed to delete user", "Please try again.");
    }
    fetchUsers();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "userID",
      "lastname",
      "firstname",
      "middle",
      "email",
      "department",
      "position",
      "role",
      "status",
      "password",
    ];
    const sampleRow = [
      "EMP-2024-001",
      "Dela Cruz",
      "Juan",
      "Santos",
      "juan.delacruz@company.com",
      "Accounting",
      "Accountant",
      "Staff",
      "Active",
      "Default@123",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    ws["!cols"] = headers.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "NSTREN_User_Import_Template.xlsx");
    showToast(
      "info",
      "Template downloaded",
      "NSTREN_User_Import_Template.xlsx",
    );
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const requiredColumns = [
      "lastname",
      "firstname",
      "email",
      "department",
      "position",
      "role",
      "status",
      "password",
    ];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length === 0) {
          showToast("error", "Empty file", "The Excel file has no data rows.");
          e.target.value = "";
          return;
        }
        const fileColumns = Object.keys(jsonData[0]);
        const missingColumns = requiredColumns.filter(
          (col) => !fileColumns.includes(col),
        );
        if (missingColumns.length > 0) {
          showToast(
            "error",
            "Missing columns",
            `Required columns not found: ${missingColumns.join(", ")}`,
          );
          e.target.value = "";
          return;
        }
        setImporting(true);
        showToast("info", "Importing users", "Processing your Excel file...");
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch("/api/users/upload-excel", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok) {
            showToast(
              "success",
              "Import complete",
              `${data.count ?? "Multiple"} users added successfully.`,
            );
            await fetchUsers();
          } else {
            const msg =
              data.error_message ?
                typeof data.error_message === "object" ?
                  JSON.stringify(data.error_message, null, 2)
                : data.error_message
              : "Import failed.";
            showToast("error", "Import failed", msg);
          }
        } catch {
          showToast(
            "error",
            "Import failed",
            "Something went wrong while importing.",
          );
        } finally {
          setImporting(false);
          e.target.value = "";
        }
      } catch {
        showToast(
          "error",
          "Invalid file",
          "Failed to read Excel file. Make sure it's a valid .xlsx file.",
        );
        e.target.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filtered = users.filter((u) => {
    const matchesSearch = `${u.firstname} ${u.lastname}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" || u.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      {/* TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* TOP ACTION */}
      <div className="flex justify-between mb-4 gap-2 flex-wrap">
        <input
          placeholder="Search users..."
          className="p-2 border rounded w-1/3 min-w-[180px]"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Department Filter - Custom Dropdown */}
        <div className="relative w-1/4 min-w-[140px]" ref={deptDropdownRef}>
          <button
            onClick={() => setDeptDropdownOpen((v) => !v)}
            className="w-full p-2 border rounded text-sm text-left bg-white flex justify-between items-center"
          >
            <span>{deptFilter}</span>
            <span className="text-gray-400">▾</span>
          </button>
          {deptDropdownOpen && (
            <ul className="absolute left-0 top-full mt-1 z-50 bg-white border rounded shadow-lg max-h-60 overflow-y-auto w-full">
              {deptFilterOptions.map((dept) => (
                <li
                  key={dept}
                  onClick={() => {
                    setDeptFilter(dept);
                    setDeptDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${deptFilter === dept ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
                >
                  {dept}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Manage Departments */}
          <button
            onClick={() => setShowManageModal(true)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 px-4 py-2 rounded text-sm flex items-center gap-1"
          >
            ⚙ Departments
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm flex items-center gap-1"
          >
            ⬇ Template
          </button>

          <div className="relative group">
            <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer text-sm flex items-center gap-1">
              {importing ? "Importing..." : "Import Excel"}
              <span className="text-white/70 text-xs">ⓘ</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
                disabled={importing}
              />
            </label>
            <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-2">
                Required Excel Columns:
              </p>
              <ul className="space-y-1">
                {[
                  "userID",
                  "lastname",
                  "firstname",
                  "middle (optional)",
                  "email",
                  "department",
                  "position",
                  "role",
                  "status",
                  "password",
                ].map((col) => (
                  <li key={col} className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    <code className="bg-gray-100 px-1 rounded">{col}</code>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-gray-400 italic">
                Download the template above for the correct format.
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Info</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.userID} className="border-t hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={u.profile_pic || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full object-cover"
                    alt="avatar"
                  />
                  <div>
                    <div className="font-medium">
                      {u.firstname} {u.lastname}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-400">ID: </span>
                      {u.userID}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-400">Email: </span>
                      {u.email}
                    </div>
                    {u.e_signature && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-400">
                          E-Signature:{" "}
                        </span>
                        <img
                          src={u.e_signature}
                          alt="E-Signature"
                          className="h-8 object-contain border rounded mt-0.5"
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">Role: </span>
                    {u.role}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Dept: </span>
                    {u.department}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Position: </span>
                    {u.position}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full text-white ${u.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-400 px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={togglingId === u.userID}
                      className={`px-3 py-1 rounded text-xs text-white ${u.status === "Active" ? "bg-orange-400 hover:bg-orange-500" : "bg-green-500 hover:bg-green-600"} disabled:opacity-50`}
                    >
                      {togglingId === u.userID ?
                        "..."
                      : u.status === "Active" ?
                        "Disable"
                      : "Enable"}
                    </button>
                    {/* <button
                      onClick={() => handleDelete(u.userID)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MANAGE DEPARTMENTS MODAL ─────────────────────────────── */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowManageModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-800">
                Manage Departments
              </h2>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex gap-2 mb-4">
                <input
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDept()}
                  placeholder="New department name..."
                  className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={handleAddDept}
                  disabled={manageSaving || !newDeptName.trim()}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                >
                  + Add
                </button>
              </div>
              {departments.length === 0 ?
                <p className="text-sm text-gray-400 text-center py-6">
                  No departments yet. Add one above.
                </p>
              : <ul className="space-y-2">
                  {departments.map((d) => (
                    <li
                      key={d}
                      className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                        <span className="text-sm text-gray-700">{d}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDept(d)}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              }
            </div>

            <div className="px-5 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-400">
                ⚠ Deleting a department won't affect existing users.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white p-6 rounded-xl shadow-lg w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Add User</h2>
            <div className="grid gap-3">
              <input
                name="userID"
                value={form.userID || ""}
                onChange={handleChange}
                onBlur={async (e) => {
                  const val = e.target.value.trim();
                  if (!val) return;
                  const res = await fetch(
                    `/api/users/check-id?userID=${encodeURIComponent(val)}`,
                  );
                  const data = await res.json();
                  if (data.taken) {
                    showToast(
                      "error",
                      "User ID already taken",
                      `"${val}" is already in use. Try a different ID.`,
                    );
                  }
                }}
                className="p-2 border rounded w-full"
                placeholder="User ID (e.g. EMP-2024-001)"
                required
              />
              <input
                name="firstname"
                value={form.firstname || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="First Name"
              />
              <input
                name="lastname"
                value={form.lastname || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Last Name"
              />
              <input
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Email Address (required)"
              />

              {/* ── ROLE & DEPARTMENT TABS SELECTION ────────────────── */}
              <div className="border rounded-lg p-2.5 bg-gray-50/50 space-y-2">
                {/* Tab Headers */}
                <div className="flex border-b text-xs pb-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, _activeTab: "role" })}
                    className={`flex-1 pb-1 font-medium text-center transition-colors ${
                      (form._activeTab || "role") === "role" ?
                        "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Assign Role{" "}
                    {form.role && <span className="text-purple-600">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, _activeTab: "department" })
                    }
                    className={`flex-1 pb-1 font-medium text-center transition-colors ${
                      form._activeTab === "department" ?
                        "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Assign Dept{" "}
                    {form.department && (
                      <span className="text-purple-600">✓</span>
                    )}
                  </button>
                </div>

                {/* Tab Content: ROLE */}
                {(form._activeTab || "role") === "role" && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {roles.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setForm({ ...form, role: r })}
                        className={`text-xs px-2 py-1.5 rounded border text-left transition-colors ${
                          form.role === r ?
                            "bg-purple-500 text-white border-purple-500"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-purple-50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab Content: DEPARTMENT */}
                {form._activeTab === "department" && (
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type to search department..."
                        value={form.department || ""}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                        onFocus={() =>
                          setForm({ ...form, _showDeptSuggestions: true })
                        }
                        onBlur={() => {
                          setTimeout(
                            () =>
                              setForm((f) => ({
                                ...f,
                                _showDeptSuggestions: false,
                              })),
                            200,
                          );
                        }}
                        className="p-1.5 border rounded flex-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowManageModal(true)}
                        className="text-[11px] bg-purple-50 border border-purple-200 text-purple-600 px-2 rounded font-medium whitespace-nowrap hover:bg-purple-100"
                      >
                        + Manage
                      </button>
                    </div>
                    {form._showDeptSuggestions && form.department && (
                      <ul className="absolute left-0 right-[75px] mt-1 z-50 bg-white border rounded shadow-md max-h-24 overflow-y-auto">
                        {departments
                          .filter((d) =>
                            d
                              .toLowerCase()
                              .includes(form.department.toLowerCase()),
                          )
                          .map((d) => (
                            <li
                              key={d}
                              onMouseDown={() =>
                                setForm({
                                  ...form,
                                  department: d,
                                  _showDeptSuggestions: false,
                                })
                              }
                              className="px-2 py-1 text-xs cursor-pointer hover:bg-purple-50 text-gray-700"
                            >
                              {d}
                            </li>
                          ))}
                        {departments.filter((d) =>
                          d
                            .toLowerCase()
                            .includes(form.department.toLowerCase()),
                        ).length === 0 && (
                          <li className="px-2 py-1 text-xs text-gray-400 italic">
                            No matches
                          </li>
                        )}
                      </ul>
                    )}
                    {form.department && (
                      <div className="text-[11px] text-gray-500 mt-1 pl-1">
                        Selected:{" "}
                        <span className="font-semibold text-purple-600">
                          {form.department}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                name="position"
                value={form.position || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Position"
              />
              <input
                name="password"
                type="password"
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Password (leave blank for Default@123)"
              />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  E-Signature
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, e_signature: e.target.files[0] })
                  }
                  className="p-2 border rounded w-full text-sm"
                />
                {form.e_signature && typeof form.e_signature === "string" && (
                  <img
                    src={form.e_signature}
                    alt="E-Signature"
                    className="mt-2 h-16 object-contain border rounded"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <UpdateUserModal
          user={selectedUser}
          roles={roles}
          departments={departments}
          handleclose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSaved={() => {
            fetchUsers();
            showToast("success", "User updated", "Changes have been saved.");
          }}
        />
      )}
    </div>
  );
}
