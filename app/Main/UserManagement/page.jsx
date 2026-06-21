"use client";
import { useEffect, useState } from "react";
import UpdateUserModal from "../../components/modals/usermanagement/update";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ← ADD
  const [selectedUser, setSelectedUser] = useState(null); // ← ADD
  const [deptFilter, setDeptFilter] = useState("All");
  const departments = [
    "All",
    ...new Set(users.map((u) => u.department).filter(Boolean)),
  ];

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // EDIT — now opens UpdateUserModal instead of inline modal
  const handleEdit = (user) => {
    console.log("EDIT CLICKED:", user);
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setForm({ userID: "" });
    setEditingId(null);
    setShowModal(true);
  };

  // SAVE (Add only — edit is handled by UpdateUserModal now)
  const handleSubmit = async () => {
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key] || "");
    }

    const res = await fetch("/api/users", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return;

    setShowModal(false);
    setForm({});
    await fetchUsers();
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirm) return;
    await fetch(`/api/users/manage?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    fetchUsers();
  };

  const [importing, setImporting] = useState(false);

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
        const XLSX = await import("xlsx");
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
            alert(`Users imported successfully! (${data.count} users added)`);
            await fetchUsers();
          } else {
            alert(
              data.error_message
                ? typeof data.error_message === "object"
                  ? JSON.stringify(data.error_message, null, 2)
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
      <div className="flex justify-between mb-4">
        <input
          placeholder="Search users..."
          className="p-2 border rounded w-1/3"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="p-2 border rounded w-1/4 text-sm"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
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
                Hover to see, click to upload.
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
                    className={`px-3 py-1 text-xs rounded-full text-white ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-400 px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    {u.status === "Active" ? (
                      <button
                        onClick={() => handleDelete(u.userID)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(u.userID)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL (inline — for new users only) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white p-6 rounded-xl shadow-lg w-[420px] animate-fadeIn">
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
                placeholder="Email Address required"
              />
              <input
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Role"
              />
              <input
                name="department"
                value={form.department || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Department"
              />
              <input
                name="position"
                value={form.position || ""}
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Position"
              />
              <input
                name="password"
                onChange={handleChange}
                className="p-2 border rounded"
                placeholder="Password (optional)"
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

      {/* EDIT USER MODAL (UpdateUserModal component) */}
      {showEditModal && selectedUser && (
        <UpdateUserModal
          user={selectedUser}
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