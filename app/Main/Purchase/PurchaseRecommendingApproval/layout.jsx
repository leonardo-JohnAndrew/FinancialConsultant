"use client"
import Header from "@/app/components/header"
const Layout = ({children}) => {
    
    return ( 
        <div>
          <Header title = {"Recommending Approval"} />
          {children}
        </div>
    )
}
export default Layout 