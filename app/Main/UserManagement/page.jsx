"use client"
import UserTable from "@/app/components/Tables/user-table"
import axios from "axios";
import { useCallback, useEffect, useState } from "react"

const UserManagement = () => {
    const [userInfo , setUserInfo] = useState([]);
    
    const fetchUser = async()=>{
        try{
            const response = await axios.get('/api/users'); 
             setUserInfo(response.data.users); 
        }catch(error){ 
            const message = error.response?.data?.error_message || "Something went wrong"; 
        }
    }
    useEffect(()=>{ 
      fetchUser(); 
    }, [])
  return (
    <>

    <div className="flex relative mb-5 w-auto">
  
    </div>
      <div className = "grid grid-row-3 mb-10">  
      <hr className = 'border-t border-gray-300'/>
      <div className = 'flex text-xl'> 
        <div className = "py-4 grow mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
           <h2 className = "text-black text-2xl" >Search ID: </h2> 
           <input type="text" className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg" 
         
           placeholder="Enter Purchase ID" />
           <button >
         
           </button>
        </div>
        <div className="basis-64 py-4 ml-30 w-50 h-10 flex flex-row items-start justify-center  ">
            <h2 className = "text-black text-2xl font-bold" >Start: </h2> 
            <input type="date" name="dateStart" className = "bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg w-35" 
          
            />
        </div>
         <div className="basis-64 w-50 h-10 flex flex-row items-start justify-center p-4">
            <h2 className = "text-black text-2xl font-bold" >End: </h2> 
            <input type="date" name="dateEnd" className = "bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg " 
            
           />
         </div>
      </div> 
      <hr className = 'border-t border-gray-300' />
      </div>     
      <div className="max-h-200 scrollbar-custom overflow-y-auto">
        <UserTable 
         tableHeader = {['ID', 'PROFILE', 'LASTNAME', 'FIRSTNAME', 'MIDDLE', 'DEPARTMENT', 'POSITION', 'ROLE', 'STATUS', 'ACTION']} 
         data={userInfo}
         />
      </div>
      {/* paginations */}
      <div className="flex justify-center items-center mt-5 ">
</div>
    </>
  )
}

export default UserManagement