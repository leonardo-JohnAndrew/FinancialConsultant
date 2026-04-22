"use client"
import {FaFilter} from "react-icons/fa"
const UserTable = (props) => {
  return (
    <div className='w-full'>
        {JSON.stringify(props.data || {})}
       <table className='border border-gray-300 w-full'>
          <thead className='bg-black text-white border-3 border-darkRed sticky top-0 z-10'>
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
                     <td>{item.lastname}</td>
                     <td>{item.firstname}</td>
                     <td>{item.middle}</td>
                     <td>{item.department}</td>
                     <td>{item.position}</td>
                     <td>{item.role}</td>
                     <td>{item.status}</td>
                     <td>Action</td>
                </tr>
              ))}
          </tbody>
       </table>
    </div>
  )
}

export default UserTable