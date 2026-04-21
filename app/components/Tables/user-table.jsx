"use client"
import {FaFilter} from "react-icons/fa"
const UserTable = (props) => {
  return (
    <div className='w-full'>
       <table className='border border-gray-300 w-full'>
          <thead className='bg-black text-white border-3 border-darkRed sticky top-0 z-10'>
              <tr>
           {props.tableHeader.map((header ,index) => ( 
            <th key={index} className="border-b border-gray-300 px-4 py-2 text-sm font-bold">
             <div className="flex items-center gap-2">
             {header}
            {(header === "ROLE" || header === "STATUS") && (
            <FaFilter size={12}  className="mb-1"/>
            )}
           </div>
          </th>
           ))}
           </tr>
          </thead>
          <tbody>
             
          </tbody>
       </table>
    </div>
  )
}

export default UserTable