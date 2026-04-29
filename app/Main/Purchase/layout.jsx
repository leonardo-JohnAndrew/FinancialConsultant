"use client"
import Header from '../../components/header'
import Sidebar from '@/app/components/sidebar'
import { PurchaseContext, PurchaseContextProvider } from '@/hooks/Context/purchaseContext'
import { usePathname } from 'next/navigation'


const Layout = ({children}) => {
   const pathname = usePathname()
   
  return (
    <div> 
         {/* <h3>This is Header</h3> header */}
    
        <div className = 'm-4 mt-3 bg-[white] p-10 print:p-0' id="print-area">
          <PurchaseContextProvider>
           {/* <Header title = {"Purchase Requisition"}/> */}
           {children}
          </PurchaseContextProvider>
        </div>
    </div>
  )
}

export default Layout