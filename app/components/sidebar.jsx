"use client";
import Menus from "@/functions/menus";
import useUserContext from "@/hooks/Context/UserContext";
import axios from "axios";
import Link from "next/link";
import { useRouter , usePathname} from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { FiChevronDown , FiChevronUp } from "react-icons/fi";

export default function Sidebar(){
  const [openPurchase, setOpenPurchase] = useState(false);
  const {user} = useUserContext();
  const router = useRouter();
  const [name , setName] = useState(); 
  const pathname = usePathname(); // get current path 
  const menu = user ? Menus(user.role).filter(i => i.section === "menu") : [];
  const others = user ? Menus(user.role).filter(i => i.section === "others") : [];
  const logout = user ? Menus(user.role).filter(i => i.section === "footer") : [];


  const handleLogOut = async() =>{ 
    // api call logout 
       const rs = await axios.post("/api/logout"); 
       if(rs.status == 200 ){ 
         router.push('/Login')
       }
    }
 if (!user) {
  return <aside className="p-4 text-white">Loading...</aside>;
}
  return (
    <aside className="min-w-54 min-h-270 relative  bg-darkRed text-white flex flex-col p-4 print:hidden">
        {/* profile picture and then name */}
        <div className="mt-7 flex flex-col justify-center items-center">
          <h1 className="text-red-100 opacity-80 text-sm">{user?.role}</h1>
          <img src={`${!user?.profile||user?.profile === null ? "/profile/Generic avatar.png": user?.profile }`} alt="profile" 
           className="w-20 h-20 mt-2 mb-3"
          />
          <h2 className="text-red-100 text-sm">{user?.name}</h2>
        </div>
        {/* content side bar  */}
        {/* Main Menu */ }
        <h3 className="text-red-100 text-sm ml-2 mt-5 opacity-70">Main menu</h3>
      <nav className="flex flex-col gap-2 ">
        {menu?.map((item, index) => (
          item.label !== "Requisition List"?( 
          <Link key={index} href={`${item.path}`}   className={`p-2 rounded hover:bg-red-300 ${
    pathname === item.path ? "bg-white text-black font-semibold hover:bg-white" : ""
  }`} >
              {item.label}
          </Link> 
          ):(
            <div key={index}>
           <button onClick={() => setOpenPurchase(!openPurchase)} 
           className="text-left w-full hover:bg-red-300 p-2 rounded flex justify-between"> 
             {item.label}
             {item.hasDropdown&& (<span>{openPurchase?  <FiChevronUp size={21}/> : <FiChevronDown size={21}/>}</span>)}
           </button>
            {
              openPurchase && (
                <div className="ml-4 flex flex-col gap-1">
                    {item.subItem?.map((sub, i)=>(
                      <Link key={i} href={`${sub.path}`}  className={`p-2 rounded hover:bg-red-300 ${
    pathname === sub.path ? "bg-white text-black font-semibold hover:bg-white" : ""
  }`}>
                        {sub.label}
                      </Link>
                    ))}
                </div>
              )
            }
           </div>
          ) 
          
         ))}
         {/* others */}
         <h3 className="text-red-100 text-sm ml-2 mt-5 opacity-70">{!others? "": others.length>1? "Others":"Other"}</h3>
         <div className=" flex flex-col gap-2">
          {others?.map((item, index) =>(
            <Link key={index} href={`${item.path}`} className={`hover:bg-red-300 p-2 rounded ${pathname === item.path ? "bg-white text-black font-semibold hover:bg-white" : ""} `}>
               {item.label}
            </Link>
          ))}
         </div>
       <div className=" absolute bottom-2 p-2 w-full">
          <button className="hover:font-semibold" onClick={()=> handleLogOut()}>
            Logout 
          </button>
       </div>
      </nav>
    </aside>
  );
}