'use client' 
import { useParams , usePathname } from "next/navigation"
import { useCallback, useEffect , useState} from "react";
import { notFound } from "next/navigation";
import axios from "axios";
import Table from "@/app/components/table";
export default function PurchaseDetails() {
     const pathname = usePathname(); 
     const params = useParams();  
     const [ purchaseDetails, setPurchaseDetails ] = useState();
     const [is404 , setIs404] = useState(false);
     const [isfetching , setIsFetching] = useState(true);
    const [formatted, setFormatted] = useState("");
     const fetchPurchaseDetails = useCallback( async () => {
         try{ 
             const response = await axios.get(`/api/purchase/${params.purchaseID}`);
             setPurchaseDetails(response.data);
             setIsFetching(false);
             const dateRecieved = new Date(response.data.purchase.createdAt);
        
             const mm = String(dateRecieved.getMonth() + 1).padStart(2, "0");
             const dd = String(dateRecieved.getDate()).padStart(2, "0");
             const yyyy = dateRecieved.getFullYear();
             setFormatted(`${mm}-${dd}-${yyyy}`);

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
     //update functions by id role based access control 
     // add attachement  


  
return ( 
    <>
    {}
    <div className="flex relative mb-5">
        <div className="w-1/2 flex flex-row gap-2">
          <h5>Requestor Department:</h5> <h5 className = 'display-inline text-red-950'>{purchaseDetails?.purchase.RequestorRole}</h5>
        </div>
        <div className="w-1/2 flex flex-row gap-2 place-content-end">
          <h5 className= 'place-self-end'>Requisition Date:</h5><h5 className = 'display-inline text-red-950'>{formatted}</h5>
        </div>
    </div>     
      <hr className = 'border-t border-gray-300'/>
      <Table data = {purchaseDetails || isfetching === false? purchaseDetails : []} /> 

    </>
)
}