"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ← fixed, single import

export default function Profile() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSetup = searchParams.get("setup") === "true";

  const [user, setUser] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Password change state (setup mode) ──────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/cookies")
      .then((r) => {
        if (!r.ok) {
          router.push("/Login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUser(data);
      });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!signatureFile)
      return showToast("Please upload a signature first.", "error");

    // ── Validate password fields in setup mode ───────────────────
    if (isSetup) {
      if (!newPassword || newPassword.trim() === "") {
        return showToast("Please enter a new password.", "error");
      }
      if (newPassword !== confirmPassword) {
        return showToast("Passwords do not match.", "error");
      }
      if (newPassword.length < 8) {
        return showToast("Password must be at least 8 characters.", "error");
      }
    }
    // ─────────────────────────────────────────────────────────────

    setSaving(true);

    const formData = new FormData();
    formData.append("e_signature", signatureFile);

    // ── Append extra fields in setup mode ───────────────────────
    if (isSetup) {
      formData.append("password", newPassword);
      formData.append("mustChangePassword", "false");
    }
    // ─────────────────────────────────────────────────────────────

    const res = await fetch(`/api/users/manage?id=${user.userID}`, {
      method: "PATCH",
      body: formData,
    });

    setSaving(false);

    if (res.ok) {
      if (isSetup) {
        showToast("Account setup complete! Redirecting...");
        setTimeout(() => router.push("/Main/Home"), 2000);
      } else {
        showToast("E-signature saved! Please re-login to continue.");
        setTimeout(() => router.push("/Main/Home"), 2500);
      }
    } else {
      showToast("Failed to save. Try again.", "error");
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

        {/* ── Setup mode banner ───────────────────────────────────── */}
        {isSetup && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
            <span className="mt-0.5">🔐</span>
            <span>
              Welcome! Please <strong>set a new password</strong> and upload
              your <strong>e-signature</strong> to activate your account.
            </span>
          </div>
        )}
        {/* ────────────────────────────────────────────────────────── */}

        {!user.e_sign && !isSetup && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
            <span className="mt-0.5">❌</span>
            <span>
              You need to upload your <strong>e-signature</strong> before you
              can access other pages.
            </span>
          </div>
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* AVATAR STRIP */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24 relative">
          <div className="absolute -bottom-8 left-6">
            <img
              src={user.profile || "/default-avatar.png"}
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow"
              alt="avatar"
            />
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          {/* NAME + ROLE */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500">
              {user.role} · {user.department}
            </p>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "User ID", value: user.userID },
              { label: "Department", value: user.department },
              { label: "Role", value: user.role },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-700">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* ── PASSWORD CHANGE SECTION (setup mode only) ────────── */}
          {isSetup && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Set New Password
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Choose a strong password (min. 8 characters).
              </p>
              <div className="grid gap-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="p-2.5 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="p-2.5 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {/* Live match indicator */}
                {confirmPassword && (
                  <p
                    className={`text-xs ${newPassword === confirmPassword ? "text-green-500" : "text-red-400"}`}
                  >
                    {newPassword === confirmPassword ?
                      "✓ Passwords match"
                    : "✗ Passwords do not match"}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* ────────────────────────────────────────────────────── */}

          {/* E-SIGNATURE SECTION */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              E-Signature
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload a clear image of your signature (PNG or JPG, white
              background preferred).
            </p>

            {user.e_sign && !signaturePreview && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Current signature:</p>
                <img
                  src={user.e_sign}
                  alt="Current E-Signature"
                  className="h-16 object-contain border rounded-lg p-2 bg-gray-50"
                />
              </div>
            )}

            {signaturePreview && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <img
                  src={signaturePreview}
                  alt="Signature Preview"
                  className="h-16 object-contain border-2 border-blue-200 rounded-lg p-2 bg-blue-50"
                />
              </div>
            )}

            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <span className="text-2xl">
                <img
                  src="/profile-esign.jpg"
                  alt="logo"
                  className="w-15 h-15 object-contain"
                />
              </span>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {signatureFile ?
                    signatureFile.name
                  : "Click to upload signature"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleSave}
              disabled={saving || !signatureFile}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              {saving ?
                "Saving..."
              : isSetup ?
                "Activate Account"
              : "Save E-Signature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
