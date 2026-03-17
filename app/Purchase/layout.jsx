import React from 'react'
import PurchaseHeader from '../components/purchase-header'
import { UserProvider } from '../components/useContextProvider'

const Layout = ({children}) => {
  return (
    <div> 
         {/* <h3>This is Header</h3> header */}
        
           <PurchaseHeader />
           {children}
    </div>
  )
}

export default Layout