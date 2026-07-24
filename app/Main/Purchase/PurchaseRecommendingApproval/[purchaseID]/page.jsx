"use client";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { FiPaperclip } from "react-icons/fi";
import axios from "axios";
import Table from "@/app/components/table";
import { formatDates } from "@/functions/formattDate";
import { formatMoney } from "@/functions/formatCurrency";
import useUserContext from "@/hooks/Context/UserContext";
import { useRouter } from "next/navigation";
import { useBanner } from "@/hooks/Context/banner";
import ConfirmBox from "@/app/components/modals/confirmbox";
import { findDepartment, findSpecificRole } from "@/functions/notification";
import {
  sendPurchaseApprovedEmail,
  sendPurchaseRejectedEmail,
} from "@/lib/sendWelcomeEmail";

export default function PurchaseDetails() {
  const pathname = usePathname();
  const [rejecting, setRejecting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const params = useParams();
  const { user } = useUserContext();
  const [total, setTotal] = useState(0);
  const [purchaseDetails, setPurchaseDetails] = useState();
  const [is404, setIs404] = useState(false);
  const [isfetching, setIsFetching] = useState(true);
  const [formatted, setFormatted] = useState("");
  const [approving, setApproving] = useState(false);
  const [items, setItems] = useState([]);
  const router = useRouter();
  const [Chiefsignature, setChiefSignature] = useState();
  const [AdminSignature, setAdminSignature] = useState();
  const [PDirectorsignature, setPDirectorSignature] = useState();
  const [EndingInventoryDate, setEndingInventoryDate] = useState();
  const [formattedEnding, setFormattedEnding] = useState();
  const { showError, showSuccess } = useBanner();

  const userRole =
    user?.role === "Admin" && purchaseDetails?.purchase?.AdminSign != null ?
      "Chief Administrator Manager"
    : user?.role;

  // ── Approval gate logic ──────────────────────────────────────────────────
  const isFullyApproved =
    purchaseDetails?.purchase?.AdminSign != null &&
    purchaseDetails?.purchase?.ChiefAdminManageSign != null &&
    purchaseDetails?.purchase?.ProjectDirectorSign != null;

  const hasAlreadySigned = (() => {
    switch (userRole) {
      case "Admin":
        return purchaseDetails?.purchase?.AdminSign != null;
      case "Chief Administrator Manager":
        return purchaseDetails?.purchase?.ChiefAdminManageSign != null;
      case "Project Director":
        return purchaseDetails?.purchase?.ProjectDirectorSign != null;
      default:
        return true; // roles outside the flow cannot approve
    }
  })();

  const canApprove = !isFullyApproved && !hasAlreadySigned;
  // ─────────────────────────────────────────────────────────────────────────

  const fetchPurchaseDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/purchase/${params.purchaseID}`);
      setPurchaseDetails(response.data);
      setItems(response.data.purchase.purchaseItems);
      console.log(response.data);
      setIsFetching(false);
      setFormatted(formatDates(response.data.purchase.createdAt));
      setFormattedEnding(
        formatDates(
          response.data.purchase.purchaseItems[0].EndingInventoryDate,
        ),
      );
      setTotal(
        response.data.purchase.purchaseItems
          .reduce((total, item) => total + Number(item.Total || 0), 0)
          .toFixed(2),
      );
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIs404(true);
      } else {
        console.error("Error fetching purchase details:", error);
      }
    }
  }, [params.purchaseID]);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [fetchPurchaseDetails]);

  useEffect(() => {
    if (purchaseDetails?.purchase) {
      setChiefSignature(purchaseDetails.purchase.ChiefAdminManageSign || null);
      setPDirectorSignature(
        purchaseDetails.purchase.ProjectDirectorSign || null,
      );
      setAdminSignature(purchaseDetails.purchase.AdminSign || null);
    }
  }, [purchaseDetails]);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const newTotal = items.reduce((sum, item) => {
      const quantity = Number(item.Quantity || 0);
      const price = Number(item.UnitPrice || 0);
      return sum + quantity * price;
    }, 0);
    setTotal(newTotal);
  }, [items]);

  useEffect(() => {
    console.log(items);
  }, [items]);

  if (is404) {
    notFound();
  }

  if (formattedEnding) {
    console.log(formattedEnding);
  }

  // ── Approve / Cancel / Confirm ───────────────────────────────────────────
  const handleApprove = () => {
    setApproving(true);
    Signaturefunction(userRole, user.e_sign, "add");
  };

  const handleCancel = () => {
    setApproving(false);
    Signaturefunction(userRole, user.e_sign, "remove");
  };

  const handleConfirm = async () => {
    let response;

    switch (userRole) {
      case "Chief Administrator Manager":
        response = await axios.post(
          `/api/purchase/Approvals/ChiefApproval?PRID=${params.purchaseID}`,
          { e_sign: user?.e_sign },
        );

        const projectDirector = await findSpecificRole("Project Director");
        for (const pd of projectDirector?.data || []) {
          const notifySytstem = await axios.post("/api/notification", {
            userId: pd.userID,
            title: "Purchase Requisition Approval",
            message:
              userRole +
              " Approve Purchase Requisition id: " +
              params.purchaseID,
            type: "Info",
            link:
              "/Main/Purchase/PurchaseRecommendingApproval/" +
              params.purchaseID,
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            const res = await sendPurchaseApprovedEmail({
              toEmail: pd.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
            });
          } else {
            return;
          }
        }

        if (response.status === 200 || response.status === 201) {
          showSuccess(response.data?.message);
        } else {
          showError(
            `Approval for Purchase Requisition ${params.purchaseID} Failed`,
          );
          return;
        }
        break;

      case "Project Director":
        response = await axios.post(
          `/api/purchase/Approvals/ProjectDirectorApproval?PRID=${params.purchaseID}`,
          { e_sign: user?.e_sign },
        );

        const accountant = await findDepartment("Accounting");
        for (const acc of accountant?.data || []) {
          const notifySytstem = await axios.post("/api/notification", {
            userId: acc.userID,
            title: "Purchase Requisition Approval",
            message:
              "Project Director Approve Purchase Requisition id: " +
              params.purchaseID,
            type: "Info",
            link:
              "/Main/SubmittedRequisition/ApprovedPurchaseRequisition/" +
              params.purchaseID,
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            let res = await sendPurchaseApprovedEmail({
              toEmail: acc.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
            });

            const notifyOwner = await axios.post("/api/notification", {
              userId: purchaseDetails?.purchase?.user?.userID,
              title: "Purchase Requisition Approval",
              message:
                "Project Director Approve Purchase Requisition id: " +
                params.purchaseID,
              type: "Info",
              link: "/Main/Purchase/MyRequisition/" + params.purchaseID,
            });
            res = await sendPurchaseApprovedEmail({
              toEmail: purchaseDetails?.purchase?.user?.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
            });
          } else {
            return;
          }
        }

        if (response.status === 200 || response.status === 201) {
          showSuccess(response.data?.message);
        } else {
          showError(
            `Approval for Purchase Requisition ${params.purchaseID} Failed`,
          );
          return;
        }
        break;

      case "Admin":
        response = await axios.post(
          `/api/purchase/Approvals/AdminApproval?PRID=${params.purchaseID}`,
          { e_sign: user?.e_sign },
        );

        const ChiefAdmin = await findSpecificRole(
          "Chief Administrator Manager",
        );
        for (const chief of ChiefAdmin?.data || []) {
          const notifySytstem = await axios.post("/api/notification", {
            userId: chief.userID,
            title: "Purchase Requisition Approval",
            message:
              "Admin Approve Purchase Requisition id: " + params.purchaseID,
            type: "Info",
            link:
              "/Main/Purchase/PurchaseRecommendingApproval/" +
              params.purchaseID,
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            const res = await sendPurchaseApprovedEmail({
              toEmail: chief.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
            });
            response = await axios.post(
              `/api/purchase/Approvals/AdminApproval?PRID=${params.purchaseID}`,
              { e_sign: user?.e_sign },
            );
          } else {
            return;
          }
        }

        if (response.status === 200 || response.status === 201) {
          showSuccess(response.data?.message);
        } else {
          showError(
            `Approval for Purchase Requisition ${params.purchaseID} Failed`,
          );
          return;
        }
        break;

      default:
        break;
    }

    setTimeout(() => {
      router.push("/Main/Purchase/PurchaseRecommendingApproval");
    }, 1800);
  };

  const Signaturefunction = (role, e_sign, action) => {
    switch (role) {
      case "Chief Administrator Manager":
        if (action === "add") {
          setChiefSignature(e_sign);
          return;
        } else if (action === "remove") {
          setChiefSignature(null);
          return;
        }
        break;
      case "Project Director":
        if (action === "add") {
          setPDirectorSignature(e_sign);
          return;
        } else if (action === "remove") {
          setPDirectorSignature(null);
          return;
        }
        break;
      case "Admin":
        if (action === "add") {
          setAdminSignature(e_sign);
          return;
        } else if (action === "remove") {
          setAdminSignature(null);
          return;
        }
        break;
      default:
        break;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleReject = async () => {
    try {
      setRejecting(true);
      const response = await axios.post(
        `/api/purchase/${params.purchaseID}/cancel-reject-request`,
      );

      if (response.status === 200 || response.status === 201) {
        showSuccess(response.data?.message || "Purchase Requisition Rejected");
        setTimeout(() => {
          router.push("/Main/Purchase/PurchaseRecommendingApproval");
        }, 1800);
      } else {
        showError(
          `Rejection for Purchase Requisition ${params.purchaseID} Failed`,
        );
      }
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      showError(
        error?.response?.data?.message ||
          `Rejection for Purchase Requisition ${params.purchaseID} Failed`,
      );
    } finally {
      setRejecting(false);
    }
  };
  // Opens the confirmation modal
  const handleRejectClick = () => {
    setShowRejectConfirm(true);
  };

  // Actually calls the API, runs only after user confirms
  const handleRejectConfirmed = async () => {
    // validate required reason
    if (!rejectReason.trim()) {
      setRejectReasonError("Please provide a reason for rejection.");
      return;
    }

    try {
      setRejecting(true);
      const response = await axios.post(
        `/api/purchase/${params.purchaseID}/cancel-reject-request`,
        {
          reason: rejectReason.trim(),
        },
      );

      const notifySytstem = await axios.post("/api/notification", {
        userId: purchaseDetails?.purchase?.user?.userID,
        title: "Purchase Budget Confirmation",
        message:
          "Accounting Reject Purchase Requisition id: " +
          params.purchaseID +
          " — Reason: " +
          rejectReason.trim(),
        type: "Info",
        link: "",
      });

      await sendPurchaseRejectedEmail({
        toEmail: purchaseDetails?.purchase?.user?.email,
        requestNo: params.purchaseID,
        rejectedBy: user?.name,
        rejectedByRole: userRole,
        reason: rejectReason.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        showSuccess(response.data?.message || "Purchase Requisition Rejected");
        setTimeout(() => {
          router.push("/Main/Purchase/PurchaseRecommendingApproval");
        }, 1800);
      } else {
        showError(
          `Rejection for Purchase Requisition ${params.purchaseID} Failed`,
        );
      }
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      showError(
        error?.response?.data?.message ||
          `Rejection for Purchase Requisition ${params.purchaseID} Failed`,
      );
    } finally {
      setRejecting(false);
      setShowRejectConfirm(false);
    }
  };
  return (
    <>
      <div className="flex relative mb-5 w-auto">
        <div className="w-1/2 flex flex-row gap-2">
          <h5 className="text-xl font-bold">Requestor Department:</h5>{" "}
          <h5 className="display-inline text-red-950 text-xl font-extrabold">
            {purchaseDetails?.purchase.RequestorDepartment}
          </h5>
        </div>
        <div className="w-1/2 flex flex-row gap-2 place-content-end">
          <h5 className="place-self-end font-bold text-xl">
            Requisition Date:
          </h5>
          <h5 className="display-inline text-red-950 text-xl font-extrabold">
            {formatted}
          </h5>
        </div>
      </div>

      <div className="grid grid-row-3 mb-5">
        <hr className="border-t border-gray-300" />
        <div className="flex text-xl ">
          <h5 className="display-inline text-black-500 font-extrabold p-5 px-0">
            {" "}
            REQUESTOR ID:{" "}
          </h5>
          <h5 className="display-inline text-red-700 font-bold p-5">
            {" "}
            {purchaseDetails?.purchase?.PurchaseID}
          </h5>
        </div>
        <hr className="border-t border-gray-300" />
      </div>

      <div className="scrollbar-custom overflow-y-auto">
        <Table
          tableHeader={
            purchaseDetails?.purchase?.user?.role !== "Admin" ?
              [
                "NO.",
                "ITEM DESCRIPTION",
                "QUANTITY",
                "UNIT",
                "UNIT PRICE",
                "TOTAL",
              ]
            : [
                "NO.",
                "ITEM DESCRIPTION",
                "REQUIRED BALANCE",
                "ENDING INVENTORY",
                "QUANTITY",
                "UNIT",
                "UNIT PRICE",
                "TOTAL",
              ]
          }
          data={purchaseDetails || isfetching === false ? purchaseDetails : []}
          Ending={formattedEnding}
          purchaseID={params.purchaseID}
          items={items}
          setItems={setItems}
          EndingInventoryDate={EndingInventoryDate}
          setEndingInventoryDate={setEndingInventoryDate}
          role={purchaseDetails?.purchase?.user?.role}
        />
      </div>

      <div className="relative ">
        <div className="absolute right-8 flex flex-row gap-0 mt-10">
          <h5 className="px-2 py-2 text-sm font-bold bg-black text-white display-inline">
            Total :
          </h5>{" "}
          <h5 className="px-2 py-2 text-sm font-bold bg-darkRed text-white display-inline ">
            {formatMoney(parseFloat(total), "PHP", "en-PH")}
          </h5>
        </div>
      </div>

      <table className="mt-30 w-full table-fixed bg-gray-100 border border-gray-200">
        <tbody>
          <tr className="text-left">
            <td className="p-2 w-1/3">Requisitionist:</td>
            <td className="p-2 w-1/3">Initial Approved:</td>
            <td className="p-2 w-1/3">Noted By:</td>
            <td className="p-2 w-1/3">Approved By:</td>
          </tr>

          <tr className="text-center">
            <td className="p-2 relative w-1/3">
              <img
                src={purchaseDetails?.purchase?.EmployeeSign || null}
                alt="Signature"
                className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
              />
              <span>
                {`${purchaseDetails?.purchase?.user?.firstname} ${purchaseDetails?.purchase?.user?.lastname}`}
              </span>
            </td>

            <td className="p-2 relative w-1/3">
              {(purchaseDetails?.purchase?.AdminSign !== null ||
                userRole === "Admin") && (
                <img
                  src={`${AdminSignature}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    AdminSignature ? "-top-15 h-25" : "-top-8 h-12"
                  } object-contain pointer-events-none`}
                />
              )}
              <span>{purchaseDetails?.purchase?.AdminName || "Admin"}</span>
            </td>

            <td className="p-2 relative w-1/3">
              {(purchaseDetails?.purchase?.ChiefAdminManageSign !== null ||
                userRole === "Chief Administrator Manager") && (
                <img
                  src={`${Chiefsignature}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    Chiefsignature ? "-top-15 h-25" : "-top-8 h-12"
                  } object-contain pointer-events-none`}
                />
              )}
              <span>
                {purchaseDetails?.purchase?.ChiefAdminManagerName != null ?
                  purchaseDetails?.purchase?.ChiefAdminManagerName
                : `${user?.name}`}
              </span>
            </td>

            <td className="p-2 relative w-1/3">
              {(purchaseDetails?.purchase?.ProjectDirectorSign !== null ||
                userRole === "Project Director") && (
                <img
                  src={`${PDirectorsignature}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    PDirectorsignature ? "-top-15 h-25" : "-top-8 h-12"
                  } object-contain pointer-events-none`}
                />
              )}
              <span>
                {purchaseDetails?.purchase?.ProjectDirectorName ||
                  "Jorge Müller"}
              </span>
            </td>
          </tr>

          <tr className="text-center">
            <td className="text-white bg-black py-2 w-1/3">Employee Name</td>
            <td className="text-white bg-black py-2 w-1/3">Admin</td>
            <td className="text-white bg-black py-2 w-1/3">
              {purchaseDetails?.purchase?.isAdminForChiefSign ?
                "Admin"
              : "Chief Administrator Manager"}
            </td>
            <td className="text-white bg-black py-2 w-1/3">Project Director</td>
          </tr>
        </tbody>
      </table>

      {/* ── Accept / Cancel / Confirm buttons ── */}
      {canApprove &&
        (approving ?
          <div className="flex justify-end gap-4 mt-10 mb-10">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-darkRed border border-darkRed text-white font-bold rounded hover:bg-red-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
            >
              Confirm
            </button>
          </div>
        : purchaseDetails?.purchase?.isCancel === false && (
            <div className="flex justify-end gap-4 mt-10 mb-10">
              <button
                onClick={handleRejectClick}
                disabled={rejecting}
                className="px-6 py-2 bg-gray-500 border border-gray-600 text-white font-bold rounded hover:bg-gray-600 transition disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
              >
                Accept
              </button>
            </div>
          ))}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 ">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Rejected Purchase Request
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject Purchase Code:{" "}
              <span className="font-bold">{params.purchaseID}</span>
            </p>

            <label className="block text-sm font-medium mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectReasonError("");
              }}
              rows={4}
              placeholder="Enter reason for rejecting this purchase requisition..."
              className="w-full border rounded-md px-3 py-2 text-sm resize-none"
            />
            {rejectReasonError && (
              <p className="text-red-500 text-xs mt-1">{rejectReasonError}</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirmed}
                disabled={rejecting}
                className="px-4 py-2 bg-darkRed text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
