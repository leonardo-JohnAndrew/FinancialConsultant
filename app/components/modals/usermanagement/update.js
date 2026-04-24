"use client"
import { FiEdit } from "react-icons/fi"
import React from "react"
const UpdateUserModal  = React.memo((props) => {
   const {handleclose }  = props; 
  return (
     <>
       <div className=' h-full flex justify-center items-center '>
           <div className='w-250 h-220 rounded-2xl bg-modalFace z-10 opacity-100 fixed   '>
             <div className="grid grid-rows-[150px_1fr]  relative">
                <div className="bg-darkRed rounded-t-2xl">
                </div>
                <div className="mt-25 ml-10 mr-10">
                   <h4 className="text-xl mb-2">ID: </h4>
                    <div className="w-full h-120 bg-white rounded-md grid grid-rows-8 gap-2 px-10" > 
                         <div className="border-b border-gray-200 py-3 flex flex-row">
                           <label className="flex-1">Name: </label>
                           <input className="bg-modalFace"/>
                    
                         </div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div ></div>
                    </div>
                </div>
                  <button className="text-white bg-darkRed absolute top-2 right-2" onClick={ () => handleclose()}>close</button>
                 <div className="absolute top-7 right-92 flex flex-col justify-center items-center">
                     <div className="flex flex-row">
                       <img src={"/profile/Generic avatar.png"} className="h-40 w-40 "   />
                       <FiEdit size={20} className="self-end " />                       
                     </div>
                      <div className="mt-2">
                         <h4 className="font-semibold text-xl">Lastname, Firstname M.</h4>
                         <h4 className="text-sm text-center mt-2">Role</h4>
                      </div>
                 </div>
             </div>
            </div> 
       </div>
     </>
  )
}, )

export default UpdateUserModal