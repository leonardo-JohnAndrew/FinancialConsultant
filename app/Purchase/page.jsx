'use client' 
import { useCallback, useEffect , useState} from "react";
import Link from "next/link";
import Table from "@/app/components/table";
import axios from "axios";
import { FiSearch ,FiChevronLeft , FiChevronRight } from "react-icons/fi";
import {formDates} from "@/functions/formattDate";
export default function PurchaseDetails() {
     const [purchaseDetails, setPurchaseDetails ] = useState();
     const [fomatted, setFormatted] = useState();
     const [currentPage, setCurrentPage] = useState(1); 
     const [itemsPerPage] = useState(10);
     // crud next js api route 
     const indexOfLastItem = currentPage * itemsPerPage;
     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
     const currentItems = purchaseDetails?.purchases?.slice(
     indexOfFirstItem,
     indexOfLastItem
     ) || [];

     const totalPages = Math.ceil(
      (purchaseDetails?.purchases?.length || 0) / itemsPerPage
     );
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
      <div className = "grid grid-row-3 mb-10">  
      <hr className = 'border-t border-gray-300'/>
      <div className = 'flex text-xl'> 
        <div className = "py-4 flex-grow mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
           <h2 className = "text-black text-2xl" >Search ID: </h2> 
           <input type="text" className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg" placeholder="Enter Purchase ID" />
            <FiSearch size={28} className="ml-2 text-white hover:text-black hover:bg-btnRed cursor-pointer font-extrabold outline outline-darkRed 
            bg-darkRed p-1 w-10" />
        </div>
        <div className="basis-64 py-4 ml-30 w-50 h-10 flex flex-row items-start justify-center  ">
            <h2 className = "text-black text-2xl font-bold" >Start: </h2> 
            <input type="date"  className = "bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg w-35"/>
        </div>
         <div className="basis-64 w-50 h-10 flex flex-row items-start justify-center p-4">
            <h2 className = "text-black text-2xl font-bold" >End: </h2> 
            <input type="date"  className = "bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg "/>
         </div>
      </div> 
      <hr className = 'border-t border-gray-300' />
      </div>     
      <div className="max-h-134 overflow-hidden">
         <Table tableHeader={['REQUEST ID','REQUESTOR NAME', 'DEPARTMENT', 'ITEMS', 'TOTAL','REMARK', 'REQUISITION DATE', 'ACTION']} list = {currentItems || []} /> 
      </div>
      {/* paginations */}
      <div className="flex justify-center items-center mt-5 gap-2">
  <button
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    className="px-3 py-1 bg-btnRed outline outline-darkRed hover:bg-white"
    disabled={currentPage === 1}
  >
    Prev
  </button>

  {[...Array(totalPages)].map((_, index) => (
    <button
      key={index}
      onClick={() => setCurrentPage(index + 1)}
      className={`px-3 py-1 ${
        currentPage === index + 1
          ? "bg-blue-500 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {index + 1}
    </button>
  ))}

  <button
    onClick={() =>
      setCurrentPage(prev => Math.min(prev + 1, totalPages))
    }
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>
    </>
)
}