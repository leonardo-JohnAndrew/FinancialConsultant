'use client' 
import { useParams , usePathname } from "next/navigation"
import { useCallback, useEffect , useState} from "react";
import { notFound } from "next/navigation";
import { FiPaperclip } from "react-icons/fi";
import axios from "axios";
import Table from "@/app/components/table";
import {formatDates} from "@/functions/formattDate";
import {formatMoney} from "@/functions/formatCurrency";
export default function PurchaseDetails() {
     const pathname = usePathname(); 
     const params = useParams();  
     const [total , setTotal] = useState(0);
     const [purchaseDetails, setPurchaseDetails ] = useState();
     const [is404 , setIs404] = useState(false);
     const [isfetching , setIsFetching] = useState(true);
    const [formatted, setFormatted] = useState("");
    const [formattedEnding , setFormattedEnding]  = useState(); 
     const fetchPurchaseDetails = useCallback( async () => {
         try{ 
             const response = await axios.get(`/api/purchase/${params.purchaseID}`);
             setPurchaseDetails(response.data);
             setIsFetching(false);
             setFormatted(formatDates(response.data.purchase.createdAt)); 
             setFormattedEnding(formatDates(response.data.purchase.purchaseItems[0].EndingInventoryDate));
             setTotal(response.data.purchase.purchaseItems.reduce((total, item) => total + item.Total, 0).toFixed(2));
            //   console.log(response.data?.purchase?.purchaseItems[0].EndingInventoryDate);

        }catch(error){
            if(error.response && error.response.status === 404){ 
                setIs404(true);
            }else{ 
                console.error("Error fetching purchase details:", error);     
            }
            }
        }, [params.purchaseID])

        useEffect(()=> { 
            fetchPurchaseDetails();
     }, [fetchPurchaseDetails]) 
       
     if(is404){ 
        notFound();
     } 
     if(formattedEnding){ 
        console.log(formattedEnding);
     }
     //update functions by id role based access control 
     // add attachement  


  
return ( 
    <>
    
    <div className="flex relative mb-5 w-auto">
        <div className="w-1/2 flex flex-row gap-2">
        {/* {formatMoney(parseFloat(total), 'PHP', 'en-PH')} */}
          <h5 className="text-xl font-bold">Requestor Department:</h5> <h5 className = 'display-inline text-red-950 text-xl font-extrabold'>{purchaseDetails?.purchase.RequestorDepartment}</h5>
        </div>
        <div className="w-1/2 flex flex-row gap-2 place-content-end">
          <h5 className= 'place-self-end font-bold text-xl'>Requisition Date:</h5><h5 className = 'display-inline text-red-950 text-xl font-extrabold'>{formatted}</h5>
        </div>
    </div>
      <div className = "grid grid-row-3 mb-5">  
      <hr className = 'border-t border-gray-300'/>
      <div className = 'flex text-xl '> 
      <h5 className ='display-inline text-black-500 font-extrabold p-5 px-0'> REQUESTOR ID: </h5> 
      <h5 className ='display-inline text-red-700 font-bold p-5'> {purchaseDetails?.purchase?.PurchaseID}</h5>
      </div> 
      <hr className = 'border-t border-gray-300'/>
      </div>     
       <div className="max-h-125 scrollbar-custom overflow-y-auto">       
       <Table tableHeader={['NO.','ITEM DESCRIPTION', 'REQUIRED BALANCE', 'ENDING INVENTORY', 'QUANTITY', 'UNIT', 'UNIT PRICE', 'TOTAL']} data = {purchaseDetails || isfetching === false? purchaseDetails : []} Ending = {formattedEnding} 
       purchaseID = {params.purchaseID} /> 
       </div> 
         <div className="relative "> 
             <div className="absolute right-8 flex flex-row gap-0 mt-10">
               <h5 className="px-2 py-2 text-sm font-bold bg-black text-white display-inline">Total :</h5> <h5 className="px-2 py-2 text-sm font-bold bg-darkRed text-white display-inline ">{formatMoney(parseFloat(total), 'PHP', 'en-PH')}</h5>
             </div>
         </div> 
         <div className="grid grid-flow-col grid-rows-[auto_auto] mt-25 mb-10 border border-gray-200 bg-gray-100">
            <div className="grid grid-cols-3   ">
                   <div className = 'flex flex-col gap-4 px-2 '>
                     <h5 className = "m-2">Requisitionist </h5>
                     <div className="flex flex-row">
                     <h5 className ="m-2">Surname , Lastname Middle Initial </h5> 
                     <div className="flex items-center justify-center bg-gray-100">
                          <label className="flex flex-col">
                           <span className="text-base leading-normal px-2 ">
                            <FiPaperclip/>
                           </span>
                           <input type="file" className="hidden" />
                          </label>
                        </div>
                   </div>
                     </div>
                   <div className = 'flex flex-col gap-4'>
                     <h5 className ="m-2">Noted By</h5>
                     <div className="flex flex-row ">
                     <h5 className ="m-2">Surname , Lastname Middle Initial </h5> 
                     <div className="flex items-center justify-center bg-gray-100">
                          <label className="flex flex-col">
                           <span className="text-base leading-normal px-2 ">
                            <FiPaperclip/>
                           </span>
                           <input type="file" className="hidden" />
                          </label>
                        </div>
                     </div>
                   </div>
                   <div className = 'flex flex-col gap-4 px-6'>
                     <h5 className ="m-2">Noted By</h5>
                      <div className="flex flex-row ">
                        <h5 className="m-2">Surname , Lastname Middle Initial </h5> 
                        <div className="flex items-center justify-center bg-gray-100">
                          <label className="flex flex-col">
                           <span className="text-base leading-normal px-2 ">
                            <FiPaperclip/>
                           </span>
                           <input type="file" className="hidden" />
                          </label>
                        </div>
                      </div>
                   </div>
            </div>          
            <div className ="bg-black px-2 py-1 text-white border-3 border-darkRed flex justify-between w-auto h-auto">
               <div className="grid grid-cols-3 gap-110  ">
                 <div className = "px-10 w-auto">Employee Name</div>
                 <div  className = "w-auto">Chief Administrator</div>
                 <div className = "w-auto">Project Director</div>
                  
               </div>
            </div>
         </div>

          <table className="border border-gray-300 w-full">
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
                         <h5>Non-cClaimable</h5>
                      </td>
                      <td className = "px-4 py-2 text-center">
                        <input type="text" className ="bg-gray-200 border-gray-300 outline-1 outline-gray-200" />
                      </td>
                  </tr>
              </tbody>
          </table> 


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
)
}