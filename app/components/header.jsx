'use client'
import useUserContext from '@/hooks/Context/UserContext'
import React, { useEffect } from 'react'
const Header = (props) => {
     const {user} = useUserContext(); 
      
     if(!user){ 
       return(
         <div></div>
       )
     }
  return (
    < >  
     <header className='h-24 '>
    <div className= "bg-white width-auto height-auto relative" >
       <img  src={'/NstrenWhite.png'}  className ="bg-white absolute w-30 h-20" alt="Nstren Logo " />
     <div className='place-self-center'>
         <h2 className='text-[25px] font-bold font-inter'>{props.title}</h2>
     </div> 
  
    </div>
       
     </header>
    </>
    
  )
}

export default Header