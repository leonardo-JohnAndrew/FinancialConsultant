"use client"
import Header from "@/app/components/header"
const Layout = ({children}) => {
    
    return ( 
        <div>
          <Header title = {"Purchase Requisition"} />
          {children}
        </div>
    )
}
export default Layout 