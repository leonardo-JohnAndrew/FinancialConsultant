"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [recentPurchase, setRecentPurchase] = useState([]);
  const [myRequisitions, setMyRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const cookieRes = await fetch("/api/cookies");
        const userData = await cookieRes.json();
        setUser(userData);

        const role = userData.role;
        const newStats = {};
        const fetches = [];

        // ─── COMMON: MY REQUISITIONS ───────────────────────────────
        fetches.push(
          fetch("/api/purchase").then(async (r) => {
            const d = await r.json();
            const all = d.data || [];
            const mine = all
              .filter(
                (p) =>
                  p.user?.userID === userData.userID ||
                  p.UserID === userData.userID,
              )
              .slice(0, 5);
            setMyRequisitions(mine);
          }),
        );

        // ─── ADMIN ─────────────────────────────────────────────────
        if (role === "Admin") {
          fetches.push(
            fetch("/api/users").then(async (r) => {
              const d = await r.json();
              newStats.totalUsers = (d.users || []).length;
            }),
            fetch("/api/purchase").then(async (r) => {
              const d = await r.json();
              const purchases = d.data || [];
              newStats.totalPurchase = d.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
              // No. of Submitted Purchase (lahat)
              newStats.submittedPurchase = d.total || purchases.length;
            }),
          );
        }

        // ─── ACCOUNTING ────────────────────────────────────────────
        if (role === "Accounting") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            fetch("/api/purchase").then(async (r) => {
              const d = await r.json();
              const purchases = d.data || [];
              newStats.submittedPurchase = d.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            }),
            // No. of Approved Purchase (Status === Accounting Confirmation)
            fetch("/api/purchase/Approvals/BudgetConfirmation").then(
              async (r) => {
                const d = await r.json();
                newStats.approvedPurchase = d.total || (d.data || []).length;
              },
            ),
          );
        }

        // ─── CHIEF ACCOUNTANT ──────────────────────────────────────
        if (role === "Chief Accountant") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            fetch("/api/budgets").then(async (r) => {
              const d = await r.json();
              const budgets = Array.isArray(d) ? d : d.data || d.budgets || [];
              newStats.totalBudget = budgets.length;
            }),
            // No. of Approved Purchase (Accounting Confirmation)
            fetch("/api/purchase/Approvals/BudgetConfirmation").then(
              async (r) => {
                const d = await r.json();
                newStats.approvedPurchase = d.total || (d.data || []).length;
              },
            ),
            // No. of Voucher Approvals (approved vouchers by Chief Accountant)
            fetch("/api/vouchers/approvals/chiefAccountant").then(async (r) => {
              const d = await r.json();
              newStats.voucherApprovals = d.total || (d.data || []).length;
            }),
          );
        }

        // ─── CHIEF ADMINISTRATOR MANAGER ───────────────────────────
        if (role === "Chief Administrator Manager") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            // No. of Submitted Purchase (already approved by Admin)
            fetch("/api/purchase/Approvals/AdminApproval").then(async (r) => {
              const d = await r.json();
              newStats.submittedPurchase = d.total || (d.data || []).length;
              setRecentPurchase((d.data || []).slice(0, 5));
            }),
            // No. of Vouchers (approved by Chief Accountant)
            fetch("/api/vouchers/approvals/chiefAccountant").then(async (r) => {
              const d = await r.json();
              newStats.chiefAccountantVouchers =
                d.total || (d.data || []).length;
            }),
          );
        }

        // ─── PROJECT DIRECTOR ──────────────────────────────────────
        if (role === "Project Director") {
          fetches.push(
            fetch("/api/purchase").then(async (r) => {
              const d = await r.json();
              const purchases = d.data || [];
              newStats.totalPurchase = d.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            }),
            // No. of Approved Purchase (already approved by Chief Accountant)
            fetch("/api/purchase/Approvals/ChiefApproval").then(async (r) => {
              const d = await r.json();
              newStats.approvedPurchase = d.total || (d.data || []).length;
            }),
          );
        }

        // ─── SUPERADMIN ────────────────────────────────────────────
        if (role === "SuperAdmin") {
          fetches.push(
            fetch("/api/users").then(async (r) => {
              const d = await r.json();
              newStats.totalUsers = (d.users || []).length;
            }),
            fetch("/api/purchase").then(async (r) => {
              const d = await r.json();
              const purchases = d.data || [];
              newStats.totalPurchase = d.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            }),
          );
        }

        // ─── REGULAR EMPLOYEE ──────────────────────────────────────
        if (role === "Regular Employee") {
          fetches.push(
            fetch("/api/purchase").then(async (r) => {
              const d = await r.json();
              const all = d.data || [];
              const mine = all.filter(
                (p) =>
                  p.user?.userID === userData.userID ||
                  p.UserID === userData.userID,
              );
              newStats.myPurchase = mine.length;
            }),
          );
        }

        await Promise.all(fetches);
        setStats(newStats);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const statusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();
    if (s === "approved" || s === "active")
      return "bg-green-100 text-green-700";
    if (s === "pending") return "bg-yellow-100 text-yellow-700";
    if (s === "rejected" || s === "inactive") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  const getRoleCards = (role) => {
    switch (role) {
      case "Admin":
        return [
 
          {
            label: "Purchase Requests",
            value: stats.totalPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
          {
            label: "No. of Submitted Purchase",
            value: stats.submittedPurchase ?? 0,
            icon: "📋",
            color: "bg-orange-50 border-orange-100",
            text: "text-orange-600",
          },
        ];
      case "Accounting":
        return [
          {
            label: "Total Vouchers",
            value: stats.totalVouchers ?? 0,
            icon: "🧾",
            color: "bg-purple-50 border-purple-100",
            text: "text-purple-600",
          },
          {
            label: "No. of Submitted Purchase",
            value: stats.submittedPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
          {
            label: "No. of Approved Purchase",
            value: stats.approvedPurchase ?? 0,
            icon: "✅",
            color: "bg-green-50 border-green-100",
            text: "text-green-600",
          },
        ];
      case "Chief Accountant":
        return [
          {
            label: "Total Vouchers",
            value: stats.totalVouchers ?? 0,
            icon: "🧾",
            color: "bg-purple-50 border-purple-100",
            text: "text-purple-600",
          },
          {
            label: "No. of Approved Purchase",
            value: stats.approvedPurchase ?? 0,
            icon: "✅",
            color: "bg-green-50 border-green-100",
            text: "text-green-600",
          },
          {
            label: "No. of Voucher Approvals",
            value: stats.voucherApprovals ?? 0,
            icon: "📝",
            color: "bg-blue-50 border-blue-100",
            text: "text-blue-600",
          },
        ];
      case "Chief Administrator Manager":
        return [
          {
            label: "No. of Submitted Purchase (by Admin)",
            value: stats.submittedPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
          {
            label: "No. of Vouchers (by Chief Accountant)",
            value: stats.chiefAccountantVouchers ?? 0,
            icon: "🧾",
            color: "bg-purple-50 border-purple-100",
            text: "text-purple-600",
          },
          {
            label: "Total Vouchers",
            value: stats.totalVouchers ?? 0,
            icon: "📋",
            color: "bg-blue-50 border-blue-100",
            text: "text-blue-600",
          },
        ];
      case "Project Director":
        return [
          {
            label: "Purchase Requests",
            value: stats.totalPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
          {
            label: "No. of Approved Purchase (by Chief Accountant)",
            value: stats.approvedPurchase ?? 0,
            icon: "✅",
            color: "bg-green-50 border-green-100",
            text: "text-green-600",
          },
        ];
      case "SuperAdmin":
        return [
          {
            label: "Total Users",
            value: stats.totalUsers ?? 0,
            icon: "👤",
            color: "bg-blue-50 border-blue-100",
            text: "text-blue-600",
          },
          {
            label: "Purchase Requests",
            value: stats.totalPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
        ];
      case "Regular Employee":
      default:
        return [
          {
            label: "My Purchase Requests",
            value: stats.myPurchase ?? 0,
            icon: "🛒",
            color: "bg-amber-50 border-amber-100",
            text: "text-amber-600",
          },
        ];
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );

  const cards = getRoleCards(user?.role);

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-base text-gray-400 mt-1">
          Welcome back, {user?.name?.split(",")[1]?.trim() || user?.name}!
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ label, value, icon, color, text }) => (
            <div
              key={label}
              className={`rounded-2xl border p-6 ${color} flex items-center gap-5 shadow-sm`}
            >
              <span className="text-5xl">{icon}</span>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-4xl font-bold ${text}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECENT TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT VOUCHERS */}
        {recentVouchers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-700">
                Recent Vouchers
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Payee
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentVouchers.map((v, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {v.checkId || v.id || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {v.payee || v.Payee || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      ₱{(v.totalAmount || v.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(v.status || v.Status)}`}
                      >
                        {v.status || v.Status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RECENT PURCHASE REQUESTS */}
        {recentPurchase.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-700">
                Recent Purchase Requests
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    PR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPurchase.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {p.PRCode || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {p.RequestorDepartment || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      ₱{(p.Total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(p.Status)}`}
                      >
                        {p.Status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MY RECENT REQUISITIONS — lahat ng roles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-700">
              My Recent Requisitions
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Purchase ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  PR Code
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {myRequisitions.length === 0 ?
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-400 text-sm"
                  >
                    No requisitions submitted yet
                  </td>
                </tr>
              : myRequisitions.map((p, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {p.PurchaseID || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {p.PRCode || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {p.RequestorDepartment || "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      ₱{(p.Total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{p.mode || "—"}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {p.timeStamp ?
                        new Date(p.timeStamp).toLocaleDateString("en-PH")
                      : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(p.Status)}`}
                      >
                        {p.Status || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-100 text-right">
            <Link
              href="/Main/Purchase/MyRequisition"
              className="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              View more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
