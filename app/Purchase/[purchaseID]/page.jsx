'use client' 
import { useParams , usePathname } from "next/navigation"
import { useCallback, useEffect , useState} from "react";
import { notFound } from "next/navigation";
import axios from "axios";
export default function PurchaseDetails() {
     const pathname = usePathname(); 
     const params = useParams();  
     const [ purchaseDetails, setPurchaseDetails ] = useState();
     const [is404 , setIs404] = useState(false);
     const fetchPurchaseDetails = useCallback( async () => {
        try{ 
            const response = await axios.get(`/api/purchase/${params.purchaseID}`);
            setPurchaseDetails(response.data);

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
return ( 
    <>
       
       {purchaseDetails && (
           <div>
                <h1>Purchase Details: {purchaseDetails.purchase.PurchaseID}</h1>
                {purchaseDetails.purchase.purchaseItems.map(item => (
                    <div key={item.id}>
                        <p>Item Name: {item.ItemName}</p>
                        <p>Quantity: {item.Quantity}</p> 
                        <p>Required Balance: {item.RequiredBalance.toFixed(2)}</p>
                        <p>Unit: {item.Unit} </p>
                        <p>Unit Price: {item.UnitPrice}</p>
                        <p>Total: {item.Quantity * item.UnitPrice}</p>
                        <br />
                    </div>
                     
                ))}
           </div>
       )}
    </>
)
}