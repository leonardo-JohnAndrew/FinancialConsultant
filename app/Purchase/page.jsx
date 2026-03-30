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
      <h5 className ='display-inline text-red-700 font-bold p-5'> {purchaseDetails?.purchase?.PurchaseID}</h5>
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