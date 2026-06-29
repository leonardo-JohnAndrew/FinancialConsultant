"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GetPurchaseWithUserId } from "@/functions/purchase";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [recentPurchase, setRecentPurchase] = useState([]);
  const [myRequisitions, setMyRequisitions] = useState([]);
  const [recommendingApproval, setRecommendingApproval] = useState([]);
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

        // My Requisitions (all roles)
        fetches.push(
          (async () => {
            const recentRes = await GetPurchaseWithUserId(
              userData.userID,
              undefined,
              undefined,
              1,
              5,
              "All",
              "",
            );
            setMyRequisitions(recentRes.data || []);

            if (role === "Regular Employee") {
              const countRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1,
                "All",
                "",
              );
              newStats.myPurchase = countRes.total || 0;
            }
          })(),
        );

        // Admin
        if (role === "Admin") {
          fetches.push(
            fetch("/api/users").then(async (r) => {
              const d = await r.json();
              newStats.totalUsers = (d.users || []).length;
            }),
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.totalPurchase = allRes.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            })(),
            // Recommending Approval — count = d.total, table = d.data.slice(0,5)
            fetch("/api/purchase/Approvals/AdminApproval").then(async (r) => {
              const d = await r.json();
              newStats.submittedPurchase = d.total || (d.data || []).length;
              setRecommendingApproval((d.data || []).slice(0, 5));
            }),
          );
        }

        // Accounting
        if (role === "Accounting") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.submittedPurchase = allRes.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            })(),
            fetch("/api/purchase/Approvals/BudgetConfirmation").then(
              async (r) => {
                const d = await r.json();
                newStats.approvedPurchase = d.total || (d.data || []).length;
              },
            ),
          );
        }

        // Chief Accountant
        if (role === "Chief Accountant") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.totalPurchase = allRes.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            })(),
            fetch("/api/budgets").then(async (r) => {
              const d = await r.json();
              const budgets = Array.isArray(d) ? d : d.data || d.budgets || [];
              newStats.totalBudget = budgets.length;
            }),
            fetch("/api/purchase/Approvals/BudgetConfirmation").then(
              async (r) => {
                const d = await r.json();
                newStats.approvedPurchase = d.total || (d.data || []).length;
              },
            ),
            fetch("/api/vouchers/approvals/chiefAccountant").then(async (r) => {
              const d = await r.json();
              newStats.voucherApprovals = d.total || (d.data || []).length;
            }),
          );
        }

        // Chief Administrator Manager
        if (role === "Chief Administrator Manager") {
          fetches.push(
            fetch("/api/vouchers").then(async (r) => {
              const d = await r.json();
              const vouchers = d.data || [];
              newStats.totalVouchers = d.total || vouchers.length;
              setRecentVouchers(vouchers.slice(0, 5));
            }),
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.totalPurchase = allRes.total || purchases.length;
            })(),
            fetch("/api/vouchers/approvals/chiefAdmin").then(async (r) => {
              const d = await r.json();
              newStats.chiefAccountantVouchers =
                d.total || (d.data || []).length;
            }),
            // Recommending Approval — count = d.total, table = d.data.slice(0,5)
            fetch("/api/purchase/Approvals/ChiefApproval").then(async (r) => {
              const d = await r.json();
              newStats.submittedPurchase = d.total || (d.data || []).length;
              setRecommendingApproval((d.data || []).slice(0, 5));
            }),
          );
        }

        // Project Director
        if (role === "Project Director") {
          fetches.push(
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.totalPurchase = allRes.total || purchases.length;
            })(),
            // Recommending Approval — count = d.total, table = d.data.slice(0,5)
            fetch("/api/purchase/Approvals/ProjectDirectorApproval").then(
              async (r) => {
                const d = await r.json();
                newStats.submittedPurchase = d.total || (d.data || []).length;
                setRecommendingApproval((d.data || []).slice(0, 5));
              },
            ),
          );
        }

        // SuperAdmin
        if (role === "SuperAdmin") {
          fetches.push(
            fetch("/api/users").then(async (r) => {
              const d = await r.json();
              newStats.totalUsers = (d.users || []).length;
            }),
            (async () => {
              const allRes = await GetPurchaseWithUserId(
                userData.userID,
                undefined,
                undefined,
                1,
                1000,
                "All",
                "",
              );
              const purchases = allRes.data || [];
              newStats.totalPurchase = allRes.total || purchases.length;
              setRecentPurchase(purchases.slice(0, 5));
            })(),
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

  const getRoleCards = (role) => {
    switch (role) {
      case "Admin":
        return [
          {
            label: "My Purchase requests",
            value: stats.totalPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
          {
            label: "Recommending Approval",
            value: stats.submittedPurchase ?? 0,
            theme: "orange",
            icon: "📋",
            href: "/Main/Purchase/PurchaseRecommendingApproval",
          },
        ];
      case "Accounting":
        return [
          {
            label: "Total Vouchers",
            value: stats.totalVouchers ?? 0,
            theme: "violet",
            icon: "🧾",
            href: "/Main/Vouchers",
          },
          {
            label: "My Submitted Purchases",
            value: stats.submittedPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
          {
            label: "Budget Confirmations",
            value: stats.approvedPurchase ?? 0,
            theme: "green",
            icon: "✅",
            href: "/Main/SubmittedRequisition/BudgetConfirmation",
          },
        ];
      case "Chief Accountant":
        return [
          {
            label: "My Purchase requests",
            value: stats.totalPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
          {
            label: "Budget Confirmations",
            value: stats.approvedPurchase ?? 0,
            theme: "green",
            icon: "✅",
            href: "/Main/SubmittedRequisition/BudgetConfirmation",
          },
          {
            label: "Voucher approvals",
            value: stats.voucherApprovals ?? 0,
            theme: "blue",
            icon: "✍️",
            href: "/Main/Vouchers",
          },
        ];
      case "Chief Administrator Manager":
        return [
          {
            label: "My Purchase requests",
            value: stats.totalPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
          {
            label: "Vouchers",
            value: stats.chiefAccountantVouchers ?? 0,
            theme: "violet",
            icon: "🧾",
            href: "/Main/Vouchers",
          },
          {
            label: "Recommending Approval",
            value: stats.submittedPurchase ?? 0,
            theme: "orange",
            icon: "📋",
            href: "/Main/Purchase/PurchaseRecommendingApproval",
          },
        ];
      case "Project Director":
        return [
          {
            label: "My Purchase requests",
            value: stats.totalPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
          {
            label: "Recommending Approval",
            value: stats.submittedPurchase ?? 0,
            theme: "orange",
            icon: "📋",
            href: "/Main/Purchase/PurchaseRecommendingApproval",
          },
        ];
      case "SuperAdmin":
        return [
          {
            label: "Total users",
            value: stats.totalUsers ?? 0,
            theme: "blue",
            icon: "👥",
            href: "/Main/UserManagement",
          },
          {
            label: "Purchase requests",
            value: stats.totalPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
        ];
      case "Regular Employee":
      default:
        return [
          {
            label: "My purchase requests",
            value: stats.myPurchase ?? 0,
            theme: "amber",
            icon: "🛒",
            href: "/Main/Purchase/MyRequisition",
          },
        ];
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "16rem",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            border: "2px solid var(--border)",
            borderTop: "2px solid var(--text-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Loading dashboard...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const cards = getRoleCards(user?.role);
  const firstName =
    user?.name?.split(",")[1]?.trim() ||
    user?.name?.split(" ")[0] ||
    user?.name;

  const themeMap = {
    violet: {
      bar: "#7F77DD",
      iconBg: "#EEEDFE",
      iconColor: "#534AB7",
      valueColor: "#534AB7",
    },
    amber: {
      bar: "#BA7517",
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      valueColor: "#854F0B",
    },
    orange: {
      bar: "#C2591A",
      iconBg: "#FDE8D8",
      iconColor: "#9A3D0E",
      valueColor: "#9A3D0E",
    },
    green: {
      bar: "#3B6D11",
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
      valueColor: "#3B6D11",
    },
    blue: {
      bar: "#185FA5",
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
      valueColor: "#185FA5",
    },
    teal: {
      bar: "#0F6E56",
      iconBg: "#E1F5EE",
      iconColor: "#0F6E56",
      valueColor: "#0F6E56",
    },
  };

  const TableCard = ({ title, children, fullWidth = false }) => (
    <div
      style={{
        background: "white",
        border: "0.5px solid #d1d5db",
        borderRadius: "12px",
        overflow: "hidden",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: "0.5px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Latest 5
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>{children}</div>
    </div>
  );

  const Th = ({ children }) => (
    <th
      style={{
        padding: "8px 16px",
        textAlign: "left",
        fontSize: "10px",
        fontWeight: 600,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        background: "#f9fafb",
        borderBottom: "0.5px solid #e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );

  const tblStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  };
  const tdBase = {
    padding: "10px 16px",
    borderBottom: "0.5px solid #e5e7eb",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
  };
  const tdMono = {
    ...tdBase,
    fontFamily: "monospace",
    fontSize: "11px",
    color: "var(--text-muted)",
  };
  const tdMuted = { ...tdBase, color: "var(--text-muted)", fontSize: "12px" };

  const Badge = ({ status }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 500,
        border: "0.5px solid",
        ...(() => {
          if (!status)
            return {
              background: "#f9fafb",
              color: "var(--text-muted)",
              borderColor: "var(--border)",
            };
          const s = status.toLowerCase();
          if (s.includes("approved") || s === "active")
            return {
              background: "#EAF3DE",
              color: "#3B6D11",
              borderColor: "#C0DD97",
            };
          if (s.includes("pending") || s.includes("confirmation"))
            return {
              background: "#FAEEDA",
              color: "#854F0B",
              borderColor: "#FAC775",
            };
          if (s.includes("rejected") || s === "inactive")
            return {
              background: "#FCEBEB",
              color: "#A32D2D",
              borderColor: "#F7C1C1",
            };
          if (
            s.includes("submission") ||
            s.includes("approval") ||
            s.includes("review")
          )
            return {
              background: "#E6F1FB",
              color: "#185FA5",
              borderColor: "#B5D4F4",
            };
          return {
            background: "#f9fafb",
            color: "var(--text-muted)",
            borderColor: "var(--border)",
          };
        })(),
      }}
    >
      {status || "—"}
    </span>
  );

  const RequisitionRow = ({ p }) => (
    <tr
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <td style={tdMono}>{p.PurchaseID || "—"}</td>
      <td style={tdBase}>{p.RequestorDepartment || "—"}</td>
      <td style={{ ...tdBase, fontWeight: 500 }}>
        ₱{(p.Total || 0).toLocaleString()}
      </td>
      <td style={tdMuted}>{p.mode || "—"}</td>
      <td style={tdMuted}>
        {p.timeStamp
          ? new Date(p.timeStamp).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </td>
      <td style={tdBase}>
        <Badge status={p.Status} />
      </td>
    </tr>
  );

  // Roles that show "Recommending Approval" table instead of "My recent requisitions"
  const showRecommendingTable =
    user?.role === "Admin" ||
    user?.role === "Chief Administrator Manager" ||
    user?.role === "Project Director";

  return (
    <div
      style={{
        padding: "2rem 1.5rem",
        background: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            Good day,{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {firstName}
            </span>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              padding: "2px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 500,
              background: "var(--bg-accent)",
              color: "var(--text-accent)",
              border: "0.5px solid var(--border-accent)",
            }}
          >
            {user?.role}
          </span>
        </div>
      </div>

      {/* SUMMARY LABEL */}
      {cards.length > 0 && (
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Summary
        </p>
      )}

      {/* STAT CARDS */}
      {cards.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, 1fr)`,
            gap: "12px",
            marginBottom: "2rem",
          }}
        >
          {cards.map(({ label, value, theme, icon, href }) => {
            const t = themeMap[theme] || themeMap.blue;
            const cardContent = (
              <div
                key={label}
                style={{
                  background: "white",
                  border: "0.5px solid #d1d5db",
                  borderRadius: "12px",
                  padding: "1.1rem 1.25rem",
                  position: "relative",
                  overflow: "hidden",
                  cursor: href ? "pointer" : "default",
                  transition: "box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (href) {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: t.bar,
                    borderRadius: "12px 12px 0 0",
                  }}
                />
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.9rem",
                    fontSize: "18px",
                    background: t.iconBg,
                    color: t.iconColor,
                  }}
                >
                  {icon}
                </div>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: 500,
                    lineHeight: 1,
                    marginBottom: "4px",
                    color: t.valueColor,
                  }}
                >
                  {value.toLocaleString()}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </p>
              </div>
            );
            return href ? (
              <Link key={label} href={href} style={{ textDecoration: "none" }}>
                {cardContent}
              </Link>
            ) : (
              <div key={label}>{cardContent}</div>
            );
          })}
        </div>
      )}

      {/* RECENT ACTIVITY LABEL */}
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}
      >
        Recent activity
      </p>

      {/* TABLES */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* RECENT VOUCHERS */}
        {recentVouchers.length > 0 && (
          <TableCard title="Recent vouchers" fullWidth>
            <table style={tblStyle}>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Payee</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recentVouchers.map((v, i) => (
                  <tr
                    key={i}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td style={tdMono}>{v.checkId || v.id || "—"}</td>
                    <td style={{ ...tdBase, fontWeight: 500 }}>
                      {v.payee || v.Payee || v.checkId || "—"}
                    </td>
                    <td style={tdBase}>
                      ₱
                      {(
                        v.checkAmount ||
                        v.totalAmount ||
                        v.amount ||
                        0
                      ).toLocaleString()}
                    </td>
                    <td style={tdBase}>
                      <Badge status={v.status || v.Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        )}

        {/* RECOMMENDING APPROVAL TABLE — Admin, Chief Admin Manager, Project Director */}
        {showRecommendingTable && (
          <TableCard title="Recommending Approval" fullWidth>
            <table style={{ ...tblStyle, minWidth: "600px" }}>
              <thead>
                <tr>
                  <Th>Purchase ID</Th>
                  <Th>Department</Th>
                  <Th>Total</Th>
                  <Th>Mode</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recommendingApproval.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "3rem 1rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "14px",
                      }}
                    >
                      No purchases for recommending approval
                    </td>
                  </tr>
                ) : (
                  recommendingApproval.map((p, i) => (
                    <RequisitionRow key={i} p={p} />
                  ))
                )}
              </tbody>
            </table>
            <div
              style={{
                padding: "10px 16px",
                borderTop: "0.5px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing {recommendingApproval.length} of{" "}
                {stats.submittedPurchase ?? 0} total
              </span>
              <Link
                href="/Main/Purchase/PurchaseRecommendingApproval"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-accent)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all →
              </Link>
            </div>
          </TableCard>
        )}

        {/* MY RECENT REQUISITIONS — all other roles */}
        {!showRecommendingTable && (
          <TableCard title="My recent requisitions" fullWidth>
            <table style={{ ...tblStyle, minWidth: "600px" }}>
              <thead>
                <tr>
                  <Th>Purchase ID</Th>
                  <Th>Department</Th>
                  <Th>Total</Th>
                  <Th>Mode</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {myRequisitions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "3rem 1rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "14px",
                      }}
                    >
                      No requisitions submitted yet
                    </td>
                  </tr>
                ) : (
                  myRequisitions.map((p, i) => <RequisitionRow key={i} p={p} />)
                )}
              </tbody>
            </table>
            <div
              style={{
                padding: "10px 16px",
                borderTop: "0.5px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing {myRequisitions.length} most recent
              </span>
              <Link
                href="/Main/Purchase/MyRequisition"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-accent)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                View all →
              </Link>
            </div>
          </TableCard>
        )}
      </div>
    </div>
  );
}
