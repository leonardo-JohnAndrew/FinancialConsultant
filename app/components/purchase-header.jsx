'use client'
import React, { useEffect } from 'react'
import useUserContext from './useContextProvider.jsx';
const PurchaseHeader = (props) => {
  
   
  return (
    < >  
     <header className='h-24'>
    <div className= "bg-white width-full height-full" >
       <img className ="bg-white" alt="Nstren Logo" />
     <div className='place-self-center'>
         <h2 className='text-[25px] font-bold font-inter'>Purchase Requisition</h2>
     </div> 
   
    </div>
       
     </header>
    </>
    
  )
}

export default PurchaseHeader