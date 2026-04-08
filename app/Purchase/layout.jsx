import React from 'react'
import PurchaseHeader from '../components/purchase-header'
import { UserProvider } from '../components/useContextProvider'

const Layout = ({children}) => {
  return (
    <div> 
         {/* <h3>This is Header</h3> header */}
        <div className = 'm-4 mt-2 bg-[white] p-10 print:p-0' id="print-area">
           <PurchaseHeader />
           {children}
        </div>
    </div>
  )
}

export default Layout