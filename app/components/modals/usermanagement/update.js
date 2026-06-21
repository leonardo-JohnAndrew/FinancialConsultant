"use client";
import { FiEdit, FiX } from "react-icons/fi";
import React, { useState } from "react";

const UpdateUserModal = React.memo((props) => {
  const { handleclose, user, onSaved } = props;

  const [form, setForm] = useState({
    userID: user?.userID || "",
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    role: user?.role || "",
    department: user?.department || "",
    position: user?.position || "",
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const formData = new FormData();
    for (const key in form) formData.append(key, form[key]);
    if (signatureFile) formData.append("e_signature", signatureFile);

    await fetch(`/api/users/manage?id=${encodeURIComponent(user.userID)}`, {
      method: "PATCH",
      body: formData,
    });

    setSaving(false);
    onSaved?.();
    handleclose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleclose}
      />

      {/* FLOATING CARD */}
      <div className="relative z-50 w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-darkRed px-6 py-4 flex items-center gap-4">
          <img
            src={
              user?.profile_pic ||
              `https://ui-avatars.com/api/?name=${user?.firstname}+${user?.lastname}&background=ffffff&color=dc2626&size=80`
            }
            className="w-14 h-14 rounded-full border-2 border-white/50 object-cover"
            alt="avatar"
          />
          <div>
            <p className="font-semibold text-white text-base leading-tight">
              {user?.lastname}, {user?.firstname}
            </p>
            <p className="text-xs text-white/70 mt-0.5">{user?.role}</p>
            <p className="text-xs text-white/50 mt-0.5">ID: {user?.userID}</p>
          </div>
          <button
            onClick={handleclose}
            className="ml-auto text-white/70 hover:text-white transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4">
          {[
            { label: "User ID", name: "userID" },
            { label: "First Name", name: "firstname" },
            { label: "Last Name", name: "lastname" },
            { label: "Email", name: "email" },
            { label: "Role", name: "role" },
            { label: "Department", name: "department" },
            { label: "Position", name: "position" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-xs text-gray-400 mb-1">
                {label}
              </label>
              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full border-b border-gray-200 bg-transparent text-sm text-gray-700 py-1.5 focus:outline-none focus:border-darkRed transition"
              />
            </div>
          ))}

          {/* E-SIGNATURE — full width */}
          <div className="col-span-2 mt-1">
            <label className="block text-xs text-gray-400 mb-2">
              E-Signature
            </label>
            <div className="flex items-center gap-3">
              {(signaturePreview || user?.e_signature) && (
                <img
                  src={signaturePreview || user.e_signature}
                  alt="sig"
                  className="h-10 object-contain border rounded-lg p-1 bg-gray-50"
                />
              )}
              <label className="cursor-pointer text-xs text-white bg-darkRed px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureChange}
                  className="hidden"
                />
              </label>
              {signatureFile && (
                <span className="text-xs text-gray-400 truncate max-w-[140px]">
                  {signatureFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={handleclose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-darkRed text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default UpdateUserModal;
