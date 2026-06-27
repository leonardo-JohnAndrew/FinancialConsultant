"use client";
import { useEffect, useRef, useState } from "react";
import UpdateUserModal from "../../components/modals/usermanagement/update";
import * as XLSX from "xlsx";

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

  // ── Roles & Departments (dynamic) ───────────────────────────
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ── Manage Modal state ───────────────────────────────────────
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageTab, setManageTab] = useState("roles");
  const [newRoleName, setNewRoleName] = useState("");
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

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles((data.roles || []).map((r) => r.name));
  };

  const fetchDepartments = async () => {
    const res = await fetch("/api/departments");
    const data = await res.json();
    setDepartments((data.departments || []).map((d) => d.name));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  // ── Manage Modal actions ─────────────────────────────────────
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    setManageSaving(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add role.");
        return;
      }
      setNewRoleName("");
      await fetchRoles();
    } finally {
      setManageSaving(false);
    }
  };

  const handleDeleteRole = async (name) => {
    if (
      !confirm(`Delete role "${name}"? Users with this role won't be affected.`)
    )
      return;
    await fetch(`/api/roles?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    await fetchRoles();
  };

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
        alert(data.error || "Failed to add department.");
        return;
      }
      setNewDeptName("");
      await fetchDepartments();
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
    await fetch(`/api/departments?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
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
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Something went wrong.");
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
      alert(
        data.error_message ?
          typeof data.error_message === "object" ?
            JSON.stringify(data.error_message, null, 2)
          : data.error_message
        : "Failed to add user.",
      );
      return;
    }
    setShowModal(false);
    setForm({});
    await fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this user?"))
      return;
    await fetch(`/api/users/manage?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
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
          alert("Excel file is empty.");
          e.target.value = "";
          return;
        }
        const fileColumns = Object.keys(jsonData[0]);
        const missingColumns = requiredColumns.filter(
          (col) => !fileColumns.includes(col),
        );
        if (missingColumns.length > 0) {
          alert(
            `Missing required columns:\n${missingColumns.map((c) => `• ${c}`).join("\n")}`,
          );
          e.target.value = "";
          return;
        }
        setImporting(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch("/api/users/upload-excel", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok) {
            alert(
              `Users imported successfully! (${data.count ?? "multiple"} users added)`,
            );
            await fetchUsers();
          } else {
            alert(
              data.error_message ?
                typeof data.error_message === "object" ?
                  JSON.stringify(data.error_message, null, 2)
                : data.error_message
              : "Import failed",
            );
          }
        } catch {
          alert("Something went wrong while importing.");
        } finally {
          setImporting(false);
          e.target.value = "";
        }
      } catch {
        alert("Failed to read Excel file. Make sure it's a valid .xlsx file.");
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
          {/* Manage Roles & Departments */}
          <button
            onClick={() => {
              setShowManageModal(true);
              setManageTab("roles");
            }}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 px-4 py-2 rounded text-sm flex items-center gap-1"
          >
            ⚙ Roles & Depts
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
                    <button
                      onClick={() => handleDelete(u.userID)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MANAGE ROLES & DEPARTMENTS MODAL ────────────────────── */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowManageModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-800">
                Manage Roles & Departments
              </h2>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b">
              <button
                onClick={() => setManageTab("roles")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${manageTab === "roles" ? "border-b-2 border-purple-500 text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Roles ({roles.length})
              </button>
              <button
                onClick={() => setManageTab("departments")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${manageTab === "departments" ? "border-b-2 border-purple-500 text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Departments ({departments.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {manageTab === "roles" ?
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
                      placeholder="New role name..."
                      className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <button
                      onClick={handleAddRole}
                      disabled={manageSaving || !newRoleName.trim()}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                      + Add
                    </button>
                  </div>
                  {roles.length === 0 ?
                    <p className="text-sm text-gray-400 text-center py-6">
                      No roles yet. Add one above.
                    </p>
                  : <ul className="space-y-2">
                      {roles.map((r) => (
                        <li
                          key={r}
                          className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                            <span className="text-sm text-gray-700">{r}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRole(r)}
                            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
              : <div>
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
              }
            </div>

            <div className="px-5 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-400">
                ⚠ Deleting a role or department won't affect existing users.
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
                  if (data.taken) alert(`User ID "${val}" is already taken.`);
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
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type to search role..."
                        value={form.role || ""}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                        onFocus={() =>
                          setForm({ ...form, _showRoleSuggestions: true })
                        }
                        onBlur={() => {
                          setTimeout(
                            () =>
                              setForm((f) => ({
                                ...f,
                                _showRoleSuggestions: false,
                              })),
                            200,
                          );
                        }}
                        className="p-1.5 border rounded flex-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowManageModal(true);
                          setManageTab("roles");
                        }}
                        className="text-[11px] bg-purple-50 border border-purple-200 text-purple-600 px-2 rounded font-medium whitespace-nowrap hover:bg-purple-100"
                      >
                        + Manage
                      </button>
                    </div>
                    {form._showRoleSuggestions && form.role && (
                      <ul className="absolute left-0 right-[75px] mt-1 z-50 bg-white border rounded shadow-md max-h-24 overflow-y-auto">
                        {roles
                          .filter((r) =>
                            r.toLowerCase().includes(form.role.toLowerCase()),
                          )
                          .map((r) => (
                            <li
                              key={r}
                              onMouseDown={() =>
                                setForm({
                                  ...form,
                                  role: r,
                                  _showRoleSuggestions: false,
                                })
                              }
                              className="px-2 py-1 text-xs cursor-pointer hover:bg-purple-50 text-gray-700"
                            >
                              {r}
                            </li>
                          ))}
                        {roles.filter((r) =>
                          r.toLowerCase().includes(form.role.toLowerCase()),
                        ).length === 0 && (
                          <li className="px-2 py-1 text-xs text-gray-400 italic">
                            No matches
                          </li>
                        )}
                      </ul>
                    )}
                    {form.role && (
                      <div className="text-[11px] text-gray-500 mt-1 pl-1">
                        Selected:{" "}
                        <span className="font-semibold text-purple-600">
                          {form.role}
                        </span>
                      </div>
                    )}
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
                        onClick={() => {
                          setShowManageModal(true);
                          setManageTab("departments");
                        }}
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
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
