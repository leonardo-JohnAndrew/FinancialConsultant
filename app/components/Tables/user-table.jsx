"use client"
import { useEffect, useState , } from "react"
import {FaFilter} from "react-icons/fa"
import { FiTrash } from "react-icons/fi"
import { FiEdit } from "react-icons/fi"
import UpdateUserModal from "../modals/usermanagement/update"
import useModalContext from "@/hooks/Context/modal"
const UserTable = (props) => {
      const [edit, setEdit] = useState(false); 
      const [archive , setArchive ] = useState(false); 
      const {modal ,updateModal} = useModalContext(); 

      const handleEditClick  = ()=>{ 
        updateModal();
        setEdit(!edit)
      }

      const handleCloseClick = ()=> {
        updateModal(); 
        setEdit(false); 
      }
  return (
    <div className='w-full' >
       <table className='border border-gray-300 w-full'>
          <thead className='bg-black text-white border-3 text-left border-darkRed sticky top-0 z-10'>
              <tr>
           {props.tableHeader.map((header ,index) => ( 
            <th key={index} className="border-b border-gray-300 px-4 py-2 text-sm font-bold">
             <div className="flex items-center gap-2">
             {header}
            {/* {(header === "ROLE" || header === "STATUS") && (
            <FaFilter size={12}  className="mb-1"/>
            )} */}
           </div>
          </th>
           ))}
           </tr>
          </thead>
          <tbody>
              {props.data?.map((item , index) => (
                <tr key={index} className="border-b border-gray-300">
                     <td className="px-4 py-2">{item.userID}</td>
                     <td className="px-4 py-2">
                        <img src={(!item.profile_pic || item.profile_pic === null || item.profile_pic === "")? "/profile/Generic avatar.png" : item.profile_pic} className="h-10 w-10"   alt="avatar" />
                     </td>
                     <td className="px-4 py-2">{item.lastname}</td>
                     <td className="px-4 py-2">{item.firstname}</td>
                     <td className="px-4 py-2">{item.middle}</td>
                     <td className="px-4 py-2">{item.department}</td>
                     <td className="px-4 py-2">{item.position}</td>
                     <td className="px-4 py-2">{item.role}</td>
                     <td className="px-4 py-2">{item.status}</td>
                     <td className="px-4 py-2">
                         <div className="flex flex-row gap-3">
                             <button onClick={()=>handleEditClick()}>
                                <FiEdit size={25} /> 
                            </button> 
                            <button>
                            <FiTrash size={25} className="text-darkRed"/>
                            </button>
                         </div>
                    </td>
                </tr>
              ))}
          </tbody>
       </table>

        {/* modal */}
           { edit && (
            <div className= {`fixed inset-0 z-50 flex items-center justify-center `} >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
               <UpdateUserModal handleclose ={handleCloseClick} />
            </div>
           )}
    </div>
  )
}

export default UserTable