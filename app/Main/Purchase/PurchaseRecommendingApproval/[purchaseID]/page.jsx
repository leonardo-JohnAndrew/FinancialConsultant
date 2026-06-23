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
import { sendPurchaseApprovedEmail } from "@/lib/sendWelcomeEmail";
export default function PurchaseDetails() {
  const pathname = usePathname();
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

  //update functions by id role based access control
  // add attachement
  // handle Approve
  const handleApprove = () => {
    //set signature
    setApproving(true);

    //    alert(userRole)
    Signaturefunction(userRole, user.e_sign, "add");
  };
  const handleCancel = () => {
    setApproving(false);
    Signaturefunction(userRole, user.e_sign, "remove");
  };

  const handleConfirm = async () => {
    let response;
    // userRole

    switch (userRole) {
      case "Chief Administrator Manager":
        // axios
        response = await axios.post(
          `/api/purchase/Approvals/ChiefApproval?PRID=${params.purchaseID}`,
          {
            e_sign: user?.e_sign,
          },
        );
        // pd notification
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
            link: "",
            // link host
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            // email send
            const res = await sendPurchaseApprovedEmail({
              toEmail: pd.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
              // url link host
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
        // const response = await axios.post();
        response = await axios.post(
          `/api/purchase/Approvals/ProjectDirectorApproval?PRID=${params.purchaseID}`,
          {
            e_sign: user?.e_sign,
          },
        );
        // accountant :
        const accountant = await findDepartment("Accounting");
        for (const acc of accountant?.data || []) {
          // system
          const notifySytstem = await axios.post("/api/notification", {
            userId: acc.userID,
            title: "Purchase Requisition Approval",
            message:
              "Project Director Approve Purchase Requisition id: " +
              params.purchaseID,
            type: "Info",
            link: "",
            // link host
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            // email send
            const res = await sendPurchaseApprovedEmail({
              toEmail: acc.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
              // url link host
            });
          } else {
            return;
          }
          // email
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
        // const response = await axios.post();
        response = await axios.post(
          `/api/purchase/Approvals/AdminApproval?PRID=${params.purchaseID}`,
          {
            e_sign: user?.e_sign,
          },
        );
        // pd notification
        // accountant :
        const ChiefAdmin = await findSpecificRole(
          "Chief Administrator Manager",
        );
        for (const chief of ChiefAdmin?.data || []) {
          // system
          const notifySytstem = await axios.post("/api/notification", {
            userId: chief.userID,
            title: "Purchase Requisition Approval",
            message:
              "Admin Approve Purchase Requisition id: " + params.purchaseID,
            type: "Info",
            link: "",
            // link host
          });
          if (notifySytstem.status === 200 || notifySytstem.status === 201) {
            // email send
            const res = await sendPurchaseApprovedEmail({
              toEmail: chief.email,
              requestNo: params.purchaseID,
              approvedBy: user.name,
              approvedByRole: user.role,
              appUrl: "",
              // url link host
            });
          } else {
            return;
          }
          // email
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
    // notification

    // accountant
    setTimeout(() => {
      router.push("/Main/Purchase/PurchaseRecommendingApproval");
    }, 1800);
  };

  const Signaturefunction = (role, e_sign, action) => {
    switch (role) {
      case "Chief Administrator Manager":
        if (action === "add") {
          setChiefSignature(e_sign);
          // axios  post

          return;
        } else if (action === "remove") {
          setChiefSignature(null);
          return;
        }
        break;

      case "Project Director":
        if (action === "add") {
          setPDirectorSignature(e_sign);
          //axios post
          return;
        } else if (action === "remove") {
          setPDirectorSignature(null);
          return;
        }
        break;
      case "Admin":
        if (action === "add") {
          setAdminSignature(e_sign);
          //axios post
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
                {purchaseDetails?.purchase?.AdminName != null ?
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
      {approving ?
        <>
          <div className="flex justify-end gap-4 mt-10 mb-10">
            <button
              onClick={(e) => {
                handleCancel();
              }}
              className="px-6 py-2 bg-darkRed border  border-darkRed text-white font-bold rounded hover:bg-red-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={(e) => {
                handleConfirm();
              }}
              className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
            >
              Confirm
            </button>
          </div>
        </>
      : <>
          <div className="flex justify-end gap-4 mt-10 mb-10">
            {/* <button className="px-6 py-2 bg-darkRed border  border-darkRed text-white font-bold rounded hover:bg-red-700 transition">
              Reject
            </button> */}

            <button
              onClick={(e) => {
                handleApprove();
              }}
              className="px-6 py-2 bg-lightRed border border-darkRed text-white font-bold rounded hover:bg-red-200 hover:text-black transition"
            >
              Accept
            </button>
          </div>
        </>
      }
    </>
  );
}
