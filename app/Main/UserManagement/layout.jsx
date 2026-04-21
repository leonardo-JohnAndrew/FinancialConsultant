import Header from "@/app/components/header"

const UserManagementLayout = ({children}) => {
  return (
    <div className = 'm-4 mt-2 bg-[white] p-10 print:p-0' id="print-area">
           <Header title = {"User Management"}/>
           {children}
        </div>
  )
}

export default UserManagementLayout