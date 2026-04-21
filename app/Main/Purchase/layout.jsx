"use client"
import Header from '../../components/header'
import Sidebar from '@/app/components/sidebar'
import { usePathname } from 'next/navigation'


const Layout = ({children}) => {
   const pathname = usePathname()
  return (
    <div> 
         {/* <h3>This is Header</h3> header */}
    
        <div className = 'm-4 mt-2 bg-[white] p-10 print:p-0' id="print-area">
           <Header title = {"Purchase Requisition"}/>
           {children}
        </div>
    </div>
  )
}

export default Layout