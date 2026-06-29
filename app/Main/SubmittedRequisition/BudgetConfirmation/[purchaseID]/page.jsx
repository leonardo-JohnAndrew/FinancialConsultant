"use client";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";

import axios from "axios";
import { formatDates } from "@/functions/formattDate";
import { formatMoney } from "@/functions/formatCurrency";
import useUserContext from "@/hooks/Context/UserContext";
import { useRouter } from "next/navigation";
import { useBanner } from "@/hooks/Context/banner";
import ConfirmBox from "@/app/components/modals/confirmbox";
import BudgetConfirmationTable from "@/app/components/Tables/budgetConfirmationTable";
import { sendPurchaseForwardedEmail } from "@/lib/sendWelcomeEmail";
import { findSpecificRole } from "@/functions/notification";
export default function PurchaseDetails() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useUserContext();
  const [total, setTotal] = useState(0);
  const [purchaseDetails, setPurchaseDetails] = useState();
  const [is404, setIs404] = useState(false);
  const [isfetching, setIsFetching] = useState(true);
  const [formatted, setFormatted] = useState("");
  const [items, setItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const [EndingInventoryDate, setEndingInventoryDate] = useState();
  const [formattedEnding, setFormattedEnding] = useState();
  const { showError, showSuccess } = useBanner();
  //const [prcode, setPRCode] = useState("");
  const userRole =
    user?.role === "Admin" && purchaseDetails?.purchase?.AdminSign != null
      ? "Chief Administrator Manager"
      : user?.role;
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
  }, [fetchPurchaseDetails]);

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

  //update functions by id role based access control
  // add attachement
  // handle Approve
  //validations

  const isFormValid = () => {
    // // PR Code required
    // if (!prcode || prcode.trim() === "") {
    //   showError("PR Code is required");
    //   return false;
    // }

    // Every item must have TypeOfExpenses
    const hasEmptyExpenseType = items.some(
      (item) => !item.TypeOfExpenses || item.TypeOfExpenses.trim() === "",
    );

    if (hasEmptyExpenseType) {
      showError("All items must have Type of Expenses");
      return false;
    }

    return true;
  };
  const handleConfirm = async () => {
    let response;

    // VALIDATION
    if (!isFormValid()) {
      return;
    }

    try {
      response = await axios.patch(`/api/purchase/${params.purchaseID}`, {
        //prcode,
        items,
      });
      setTimeout(() => {
        router.push("/Main/SubmittedRequisition/BudgetConfirmation");
      }, 1800);
      // accountant :
      const admin = await findSpecificRole("Admin");
      //  console.log(admin.data);
      for (const Admin of admin?.data || []) {
        // system
        const notifySytstem = await axios.post("/api/notification", {
          userId: Admin.userID,
          title: "Purchase Requisition Approval",
          message:
            "Accounting Confirm Budget for Purchase Requisition id: " +
            params.purchaseID,
          type: "Info",
          link:
            "/Main/Purchase/PurchaseRecommendingApproval/" + params.purchaseID,
          // link host
        });
        if (notifySytstem.status === 200 || notifySytstem.status === 201) {
          // email send
          const res = await sendPurchaseForwardedEmail({
            toEmail: Admin.email,
            requestNo: params.purchaseID,
            forwardedBy: user.name,
            forwardedByRole: user.role,
            forwardedTo: `${Admin.firstname} ${Admin.lastname}`,
            appUrl: "",
            // url link host
          });
        } else {
          return;
        }
        // email
      }
      if (response.status === 200 || response.status === 201) {
        showSuccess(`Budget Confirm: ${params.purchaseID}`);
      }
    } catch (err) {
      console.log(err.message);
      showError("Unable to Confirm Budget");
    }
  };

  // handle modal for confirmation
  const handleShowConfirm = () => {
    if (!isFormValid()) {
      return;
    }
    setShowConfirm(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
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
      <div className="flex justify-start my-3">
        <div className="flex flex-row gap-1"></div>
      </div>
      <div className="scrollbar-custom overflow-y-auto">
        <BudgetConfirmationTable
          tableHeader={
            purchaseDetails?.purchase?.user?.role !== "Admin"
              ? [
                  "NO.",
                  "ITEM DESCRIPTION",
                  "QUANTITY",
                  "UNIT",
                  "UNIT PRICE",
                  "CLAIMABLE",
                  "TYPE OF EXPENSES",
                  "REMARKS",
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
                  "CLAIMABLE",
                  "TYPE OF EXPENSES",
                  "REMARKS",
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
        <div className="absolute right-0 flex flex-row gap-0 mt-2">
          <h5 className="px-2 py-2 text-sm font-bold bg-black text-white display-inline">
            Total :
          </h5>{" "}
          <h5 className="px-2 py-2 text-sm font-bold bg-darkRed text-white display-inline ">
            {formatMoney(parseFloat(total), "PHP", "en-PH")}
          </h5>
        </div>
      </div>
      {/* {JSON.stringify(purchaseDetails)} */}
      <div className="mt-13 flex justify-end items-end">
        {purchaseDetails?.purchase?.isOnTheBudget === false && (
          <button
            className="bg-lightRed rounded-md py-2 px-3 text-white font-bold hover:border hover:border-darkRed hover:bg-white hover:text-black"
            onClick={handleShowConfirm}
          >
            Confirm
          </button>
        )}
      </div>
      {/* create modal for confirmation  make it in center*/}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 ">
          <ConfirmBox
            title="Confirm Budget Confirmation"
            content={`Are you sure you want to confirm the budget for Purchase Code:`}
            id={params.purchaseID}
            handleConfirm={handleConfirm}
            handleclose={handleCancelConfirm}
          />
        </div>
      )}
      <table className="mt-30 w-full table-fixed bg-gray-100 border border-gray-200">
        <tbody>
          <tr className="text-left">
            <td className="p-2 w-1/3">Requisitionist:</td>

            {/* Sir JC */}
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
                  src={`${purchaseDetails?.purchase?.AdminSign || null}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    purchaseDetails?.purchase?.AdminSign
                      ? "-top-15 h-25"
                      : "-top-8 h-12"
                  } object-contain pointer-events-none`}
                />
              )}
              <span>{purchaseDetails?.purchase?.AdminName || "Admin"}</span>
            </td>
            <td className="p-2 relative w-1/3">
              {(purchaseDetails?.purchase?.ChiefAdminManageSign !== null ||
                userRole === "Chief Administrator Manager") && (
                <img
                  src={`${purchaseDetails?.purchase?.ChiefAdminManageSign || null}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    purchaseDetails?.purchase?.ChiefAdminManageSign
                      ? "-top-15 h-25"
                      : "-top-8 h-12"
                  } object-contain pointer-events-none`}
                />
              )}
              <span>
                {purchaseDetails?.purchase?.ChiefAdminManagerName ||
                  "Chief Administrator Manager"}
              </span>
            </td>

            <td className="p-2 relative w-1/3">
              {(purchaseDetails?.purchase?.ProjectDirectorSign !== null ||
                userRole === "Project Director") && (
                <img
                  src={`${purchaseDetails?.purchase?.ProjectDirectorSign || null}`}
                  alt="Signature"
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    purchaseDetails?.purchase?.ProjectDirectorSign
                      ? "-top-15 h-25"
                      : "-top-8 h-12"
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
              {purchaseDetails?.purchase?.isAdminForChiefSign
                ? "Admin"
                : "Chief Administrator Manager"}
            </td>
            <td className="text-white bg-black py-2 w-1/3">Project Director</td>
          </tr>
        </tbody>
      </table>
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
    </>
  );
}
