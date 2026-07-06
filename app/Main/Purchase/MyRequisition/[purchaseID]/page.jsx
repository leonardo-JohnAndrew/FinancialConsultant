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
import { data } from "autoprefixer";
import { sendPurchaseCancelEmail } from "@/lib/sendWelcomeEmail";
import { findDepartment, findSpecificRole } from "@/functions/notification";
export default function PurchaseDetails() {
  const pathname = usePathname();
  const params = useParams();

  const [canceling, setCancel] = useState(false);
  const [cancelingModal, setCancelModal] = useState(false);
  const { user } = useUserContext();
  const [total, setTotal] = useState(0);
  const [isCLick, setIsClick] = useState(false);
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
  const [showExportFormatModal, setShowExportFormatModal] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null); // "xlsx" | "pdf" | null
  const fetchPurchaseDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/purchase/${params.purchaseID}`);
      setPurchaseDetails(response.data);
      console.log(response);
      setItems(response.data.purchase.purchaseItems);
      setIsFetching(false);
      setFormatted(formatDates(response.data.purchase.createdAt));
      setFormattedEnding(
        formatDates(
          response.data.purchase.purchaseItems[0].EndingInventoryDate,
        ),
      );
      const grandTotal = response.data.purchase.purchaseItems.reduce(
        (total, item) => total + Number(item.Total),
        0,
      );

      setTotal(grandTotal.toFixed(2));
      //   console.log(response.data?.purchase?.purchaseItems[0].EndingInventoryDate);
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
  }, []);
  // const handleDownload = async () => {
  //   setIsClick(true);
  //   const res = await axios.get(`/api/purchase/${params.purchaseID}/export`, {
  //     responseType: "blob",
  //   });

  //   const url = URL.createObjectURL(new Blob([res.data]));
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `purchase-${params.purchaseID}.xlsx`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  //   setTimeout(function () {
  //     setIsClick(false);
  //   }, 2000);
  // };
  const handleCancelClick = () => {
    setCancelModal(true);
  };
  const handleDownload = async (format = "xlsx") => {
    try {
      setExportingFormat(format);

      const res = await axios.get(
        `/api/purchase/${params.purchaseID}/export?format=${format}`,
        { responseType: "blob" },
      );

      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([res.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase-${params.purchaseID}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setShowExportFormatModal(false);
    } catch (error) {
      console.error(error);
      showError("Failed to export purchase form");
    } finally {
      setExportingFormat(null);
    }
  };

  // Actually calls the API, runs only after user confirms
  const handleCancelConfirmed = async () => {
    try {
      setCancel(true);
      const response = await axios.patch(
        `/api/purchase/${params.purchaseID}/cancel-reject-request`,
      );
      // reject system
      purchaseDetails;
      if (purchaseDetails?.purchase?.isOnBudget === true) {
        // accounting notif
        const accounting = await findDepartment("Accounting");
        await Promise.all(
          (accounting?.data || []).map((forward) =>
            Promise.all([
              axios.post("/api/notification", {
                userId: forward.userID,
                title: "Cancel Purchase Requisition",
                message: `${user.name} is Cancel a Purchase Requisition`,
                type: "info",
                link: "",
              }),
              sendPurchaseCancelEmail({
                toEmail: forward.email,
                forwardedBy: user.name,
                forwardedByRole: user.role,
                forwardedTo: `${forward.firstname} ${forward.lastname}`,
                appUrl: "",
              }),
            ]),
          ),
        );
      }

      // Admin
      if (
        purchaseDetails?.purchase?.AdminSign !== null &&
        purchaseDetails?.purchase?.AdminSign !== ""
      ) {
        const Admin = await findSpecificRole("Admin");
        await Promise.all(
          (Admin?.data || []).map((forward) =>
            Promise.all([
              axios.post("/api/notification", {
                userId: forward.userID,
                title: "Cancel Purchase Requisition",
                message: `${user.name} is Cancel a Purchase Requisition`,
                type: "info",
                link: "",
              }),
              sendPurchaseCancelEmail({
                toEmail: forward.email,
                forwardedBy: user.name,
                forwardedByRole: user.role,
                forwardedTo: `${forward.firstname} ${forward.lastname}`,
                appUrl: "",
              }),
            ]),
          ),
        );
      }
      //chief Admin

      if (
        purchaseDetails?.purchase?.ChiefAdminManageSign !== null &&
        purchaseDetails?.purchase?.ChiefAdminManageSign !== ""
      ) {
        const chiefAdmin = await findSpecificRole(
          "Chief Administrator Manager",
        );
        await Promise.all(
          (chiefAdmin?.data || []).map((forward) =>
            Promise.all([
              axios.post("/api/notification", {
                userId: forward.userID,
                title: "Cancel Purchase Requisition",
                message: `${user.name} is Cancel a Purchase Requisition`,
                type: "info",
                link: "",
              }),
              sendPurchaseCancelEmail({
                toEmail: forward.email,
                forwardedBy: user.name,
                forwardedByRole: user.role,
                forwardedTo: `${forward.firstname} ${forward.lastname}`,
                appUrl: "",
              }),
            ]),
          ),
        );
      }
      // Project Director
      if (
        purchaseDetails?.purchase?.ProjectDirectorSign !== null &&
        purchaseDetails?.purchase?.ProjectDirectorSign !== ""
      ) {
        const projectDirector = await findSpecificRole("Project Director");
        await Promise.all(
          (projectDirector?.data || []).map((forward) =>
            Promise.all([
              axios.post("/api/notification", {
                userId: forward.userID,
                title: "Cancel Purchase Requisition",
                message: `${user.name} is Cancel a Purchase Requisition`,
                type: "info",
                link: "",
              }),
              sendPurchaseCancelEmail({
                toEmail: forward.email,
                forwardedBy: user.name,
                forwardedByRole: user.role,
                forwardedTo: `${forward.firstname} ${forward.lastname}`,
                appUrl: "",
              }),
            ]),
          ),
        );
      }

      const notifySytstem = await axios.post("/api/notification", {
        userId: purchaseDetails?.purchase?.user?.userID,
        title: "Purchase Budget Confirmation",
        message: " Cancel Purchase Requisition id: " + params.purchaseID,
        type: "Info",
        link: "",
      });
      await sendPurchaseCancelEmail({
        toEmail: purchaseDetails?.purchase?.user?.email,
        requestNo: params.purchaseID,
        rejectedBy: user?.name,
        rejectedByRole: user?.role,
      });

      if (response.status === 200 || response.status === 201) {
        showSuccess(response.data?.message || "Purchase Requisition Cancel");
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
      setCancel(false);
      setCancelModal(false);
    }
  };

  return (
    <>
      <div className="flex relative mb-5 w-auto">
        <div className="w-1/2 flex flex-row gap-2">
          {/* {formatMoney(parseFloat(total), 'PHP', 'en-PH')} */}
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
      {purchaseDetails?.purchase?.isRejected === true && (
        <>
          <div className="border border-red-600 bg-red-200 p-2">
            <h4 className="text-lg font-bold  text-darkRed">Rejected </h4>
            <h4>{purchaseDetails?.purchase?.reason}</h4>
          </div>
        </>
      )}
      <div className="scrollbar-custom overflow-y-auto">
        <Table
          tableHeader={
            purchaseDetails?.purchase?.user?.role !== "Admin"
              ? [
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
      {
        // <table className="mt-30 w-full table-fixed bg-gray-100 border border-gray-200">
        //   <tbody>
        //     <tr className="text-left">
        //       <td className="p-2 w-1/3">Requisitionist:</td>

        //       {/* Sir JC */}
        //       <td className="p-2 w-1/3">Initial Approved:</td>
        //       <td className="p-2 w-1/3">Noted By:</td>
        //       <td className="p-2 w-1/3">Approved By:</td>
        //     </tr>

        //     <tr className="text-center">
        //       <td className="p-2 relative w-1/3">
        //         <img
        //           src={purchaseDetails?.purchase?.EmployeeSign || null}
        //           alt="Signature"
        //           className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
        //         />
        //         <span>
        //           {`${purchaseDetails?.purchase?.user?.firstname} ${purchaseDetails?.purchase?.user?.lastname}`}
        //         </span>
        //       </td>

        //       <td className="p-2 relative w-1/3">
        //         {purchaseDetails?.purchase?.AdminSign !== null || (
        //           <img
        //             src={`${purchaseDetails?.purchase?.AdminSign || null}`}
        //             alt="Signature"
        //             className={`absolute left-1/2 -translate-x-1/2 ${
        //               AdminSignature ? "-top-15 h-25" : "-top-8 h-12"
        //             } object-contain pointer-events-none`}
        //           />
        //         )}
        //         <span>{purchaseDetails?.purchase?.AdminName || "Admin"}</span>
        //       </td>
        //       <td className="p-2 relative w-1/3">
        //         {purchaseDetails?.purchase?.ChiefAdminManageSign !== null || (
        //           <img
        //             src={`${purchaseDetails?.purchase?.ChiefAdminManageSign || null}`}
        //             alt="Signature"
        //             className={`absolute left-1/2 -translate-x-1/2 ${
        //               Chiefsignature ? "-top-15 h-25" : "-top-8 h-12"
        //             } object-contain pointer-events-none`}
        //           />
        //         )}
        //         <span>
        //           {purchaseDetails?.purchase?.ChiefAdminManagerName ||
        //             "Chief Administrator Manager"}
        //         </span>
        //       </td>

        //       <td className="p-2 relative w-1/3">
        //         {purchaseDetails?.purchase?.ProjectDirectorSign !== null || (
        //           <img
        //             src={`${purchaseDetails?.purchase?.ProjectDirectorSign || null}`}
        //             alt="Signature"
        //             className={`absolute left-1/2 -translate-x-1/2 ${
        //               PDirectorsignature ? "-top-15 h-25" : "-top-8 h-12"
        //             } object-contain pointer-events-none`}
        //           />
        //         )}
        //         <span>
        //           {purchaseDetails?.purchase?.ProjectDirectorName ||
        //             "Jorge Müller"}
        //         </span>
        //       </td>
        //     </tr>

        //     <tr className="text-center">
        //       <td className="text-white bg-black py-2 w-1/3">Employee Name</td>
        //       <td className="text-white bg-black py-2 w-1/3">Admin</td>
        //       <td className="text-white bg-black py-2 w-1/3">
        //         {purchaseDetails?.purchase?.isAdminForChiefSign
        //           ? "Admin"
        //           : "Chief Administrator Manager"}
        //       </td>
        //       <td className="text-white bg-black py-2 w-1/3">
        //         Project Director
        //       </td>
        //     </tr>
        //   </tbody>
        // </table>
        <table className="mt-30 w-full table-fixed bg-gray-100 border border-gray-200">
          <tbody>
            <tr className="text-left">
              <td className="p-2 w-1/3">Requisitionist:</td>
              <td className="p-2 w-1/3">Initial Approved:</td>
              <td className="p-2 w-1/3">Noted By:</td>
              <td className="p-2 w-1/3">Approved By:</td>
            </tr>

            <tr className="text-center">
              {/* Employee */}
              <td className="p-2 relative w-1/3">
                {purchaseDetails?.purchase?.EmployeeSign && (
                  <img
                    src={purchaseDetails.purchase.EmployeeSign}
                    alt="Employee Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>
                  {`${purchaseDetails?.purchase?.user?.firstname ?? ""} ${purchaseDetails?.purchase?.user?.lastname ?? ""}`}
                </span>
              </td>

              {/* Admin */}
              <td className="p-2 relative w-1/3">
                {purchaseDetails?.purchase?.AdminSign && (
                  <img
                    src={purchaseDetails.purchase.AdminSign}
                    alt="Admin Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>{purchaseDetails?.purchase?.AdminName || "Admin"}</span>
              </td>

              {/* Chief Admin Manager */}
              <td className="p-2 relative w-1/3">
                {purchaseDetails?.purchase?.ChiefAdminManageSign && (
                  <img
                    src={purchaseDetails.purchase.ChiefAdminManageSign}
                    alt="Chief Admin Manager Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>
                  {purchaseDetails?.purchase?.ChiefAdminManagerName ||
                    "Chief Administrator Manager"}
                </span>
              </td>

              {/* Project Director */}
              <td className="p-2 relative w-1/3">
                {purchaseDetails?.purchase?.ProjectDirectorSign && (
                  <img
                    src={purchaseDetails.purchase.ProjectDirectorSign}
                    alt="Project Director Signature"
                    className="absolute left-1/2 -translate-x-1/2 -top-15 h-25 object-contain pointer-events-none"
                  />
                )}
                <span>
                  {purchaseDetails?.purchase?.ProjectDirectorName ||
                    "Project Director"}
                </span>
              </td>
            </tr>

            <tr className="text-center">
              <td className="text-white bg-black py-2 w-1/3">Employee Name</td>
              <td className="text-white bg-black py-2 w-1/3">Admin</td>
              <td className="text-white bg-black py-2 w-1/3">
                {purchaseDetails?.purchase?.isAdminForChiefSign
                  ? "Admin"
                  : "Chief Administrator Manager"}
              </td>
              <td className="text-white bg-black py-2 w-1/3">
                Project Director
              </td>
            </tr>
          </tbody>
        </table>
      }
      {purchaseDetails?.purchase?.isRejected === false && (
        <div className="flex justify-end items-end mt-3">
          <button
            onClick={handleCancelClick}
            disabled={canceling}
            className="px-6 py-2 mr-2 bg-gray-500 border border-gray-600 text-white font-bold rounded-md hover:bg-gray-600 transition disabled:opacity-50"
          >
            {canceling ? "Cancel..." : "Cancel"}
          </button>
          <button
            onClick={() => setShowExportFormatModal(true)}
            className={`py-2 px-5  ${isCLick === true ? "bg-gray-500" : "bg-green-800"}  text-white ${isCLick === false && "hover:bg-green-950"}  font-bold rounded-md`}
            disabled={isCLick}
          >
            {"Export Data"}
          </button>
        </div>
      )}
      {cancelingModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 ">
          <ConfirmBox
            title="CanceL Request"
            content={`Are you sure you want to cancel Purchase Code:`}
            id={params.purchaseID}
            handleConfirm={handleCancelConfirmed}
            handleclose={() => setCancelModal(false)}
          />
        </div>
      )}
      {/* accounting part claimable or non claimable  */}
      {/* <table className="border border-gray-300 w-full">
             <thead className = "bg-black text-white border-3 border-darkRed sticky top-0 z-10 font-thin" >
                <tr>
                    <th></th> 
                    <th className = "font-thin text-center">Claimable / Non - Claimable</th>
                    <th className = "font-thin text-center">Remark</th>
                </tr>
             </thead>
              <tbody> 
                  <tr className = "border border-gray-300"> 
                      <td className="px-4 py-2"> 
                         <input type="checkbox" className ="w-7 h-7"/>
                      </td>
                      <td className="px-4 py-2 text-center">
                         <h5>Claimable</h5>
                      </td>
                      <td className = "px-4 py-2 text-center">
                        <input type="text" className ="bg-gray-200 border-gray-300 outline-1 outline-gray-200" />
                      </td>
                  </tr>
                  <tr> 
                      <td className="px-4 py-2"> 
                         <input type="checkbox" className ="w-7 h-7"/>
                      </td>
                      <td className="px-4 py-2 text-center">
                         <h5>Non-Claimable</h5>
                      </td>
                      <td className = "px-4 py-2 text-center">
                        <input type="text" className ="bg-gray-200 border-gray-300 outline-1 outline-gray-200" />
                      </td>
                  </tr>
              </tbody>
          </table>  */}

      {/* 2nd table */}
      {/* <div className="grid grid-flow-col grid-rows-[auto_auto] mb-10 border border-gray-200 bg-gray-100">
            <div className ="bg-black px-2 py-1 text-white border-3 border-darkRed flex justify-between w-auto h-auto">
               <div className="grid grid-cols-3 gap-50">
                 <div></div>
                 <div>Claimable / Non-Claimable</div>
                 <div>Remark</div>
               </div>
            </div>
             <div className="grid grid-cols-3">
                   <div className = 'flex flex-col gap-4 justify-center '>
                      <input type="checkbox" className ="w-7 h-7 mt-2 self-center"/>
                      <hr className = "border-gray-300"/>
                      <input type="checkbox" className ="w-7 h-7 self-center mb-2"/>
              </div>
              <div className = 'flex flex-col gap-4 justify-center'>
                    
                     <h5 className = "">Claimable</h5>
                    <hr className = "border-gray-300 mt-4"/>
                     <h5>Non - Claimable</h5> 
                     <div className="flex items-center justify-center bg-gray-100">

                     </div>
                   </div>
                   <div className = 'flex flex-col gap-4 px-6'>
                     <h5>Noted By</h5>
                      <div className="flex flex-row ">
                        <h5 >Surname , Lastname Middle Initial </h5> 
                        <div className="flex items-center justify-center bg-gray-100">
                          <label className="flex flex-col">
                           <span className="text-base leading-normal px-2">
                            <FiPaperclip/>
                           </span>
                           <input type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                   </div>
            </div>         
         </div> */}
      {/* resubmit*/}
      {showExportFormatModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Export Voucher</h2>
            <p className="text-sm text-gray-600 mb-4">
              Piliin ang format na i-e-export
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDownload("xlsx")}
                disabled={exportingFormat !== null}
                className="w-full px-4 py-2 bg-green-700 text-white rounded hover:bg-green-900 disabled:opacity-50"
              >
                {exportingFormat === "xlsx"
                  ? "Generating Excel..."
                  : "Export as Excel"}
              </button>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={exportingFormat !== null}
                className="w-full px-4 py-2 bg-red-700 text-white rounded hover:bg-red-900 disabled:opacity-50"
              >
                {exportingFormat === "pdf"
                  ? "Generating PDF..."
                  : "Export as PDF"}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowExportFormatModal(false)}
                disabled={exportingFormat !== null}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
