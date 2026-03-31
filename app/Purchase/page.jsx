'use client' 
import { useCallback, useEffect , useState} from "react";
import Link from "next/link";
import Table from "@/app/components/table";
import axios from "axios";
import {formDates} from "@/functions/formattDate";
export default function PurchaseDetails() {
     const [purchaseDetails, setPurchaseDetails ] = useState();
     const [fomatted, setFormatted] = useState();
     // crud next js api route 
     
     const fetchPurchaseDetails = useCallback( async () => {
        try{ 
            const response = await axios.get(`/api/purchase`);
            setPurchaseDetails(response.data);
           //  setFormatted(formatDates(response.data.purchases[0].createdAt));
        }catch(error){
            if(error.response && error.response.status === 404){ 
                setIs404(true);
            }else{ 
                console.error("Error fetching purchase details:", error);     
            }
            }
        }, [])   
        useEffect(()=> { 
            fetchPurchaseDetails();
     }, [fetchPurchaseDetails]) 
       
return ( 
       <>
    
    <div className="flex relative mb-5 w-auto">
       
    </div>
      <div className = "grid grid-row-3 mb-5">  
      <hr className = 'border-t border-gray-300'/>
      <div className = 'flex text-xl'> 
        <div className = "py-4 basis-2xl mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
           <h2 className = "text-black text-2xl" >Search ID: </h2> 
           <input type="text" className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg" placeholder="Enter Purchase ID" />
        
        </div>
        <div className="basis-64 ml-30 w-50 h-10 bg-yellow-300">

        </div>
         <div className="basis-64 w-50 h-10 bg-darkRed">

         </div>
      </div> 
      <hr className = 'border-t border-gray-300'/>
      </div>     
      <Table tableHeader={['REQUEST ID','REQUESTOR NAME', 'DEPARTMENT', 'ITEMS', 'TOTAL','REMARK', 'REQUISITION DATE', 'ACTION']} list = {purchaseDetails?.purchases || []} /> 
    </>
//     <>
       
//        {purchaseDetails && (
//            <div>
//              { 
//               purchaseDetails.purchases.map(pr => ( 
//                 <div key={pr.PurchaseID}> 
//                 <h1>Purchase Details: {pr.PurchaseID}</h1>
//              {pr.purchaseItems.map(item => (
//             <div key={item.id}
//                 <p>Item Name: {item.ItemName}</p>
//                 <p>Quantity: {item.Quantity}</p> 
//                 <p>Required Balance: {item.RequiredBalance.toFixed(2)}</p>
//                 <p>Unit: {item.Unit} </p>
//                 <p>Unit Price: {item.UnitPrice}</p>
//                 <p>Total: {item.Quantity * item.UnitPrice}</p>
//                 <Link href={`/Purchase/${pr.PurchaseID}`}>View Details</Link>
//              </div>       
//   ))}
//   <br />
//                 </div>
//               ))
//              }
                
//            </div>
//        )}
//     </>
)
}