
export default function Menus(role){ 
    // list of menus 
    const allMenu = [
        {
          label : "Dashboard", 
          icon: "□", 
          section: "menu", 
          path:"/Main/Home"
        }, 
        {
            label: "Purchase Requisition Form", 
            icon: "□", 
            section: "menu", 
            path: "/Main/Purchase/Requisition"
        }, 
         {
            label: "Requisition List", 
            icon: "□", 
            section: "menu", 
            hasDropdown: true, 
            subItem:[ 
                 {
                    label: "Recommending Approval", 
                    icon: "□", 
                    path: "/Main/Purchase/PurchaseRecommendingApproval"                   
                 }, 
                 {
                    label : "Requisition History", 
                    icon: "□", 
                    path: "/Main/Purchase/RequisitionHistory"
                 }
            ]
         }, 
         { 
            label: "My Requisition", 
            icon: "□", 
            section :"menu", 
            path: "/Main/Purchase"
         },
         {
            label: "Item Management", 
            icon: "□",
            section: "others", 
            path:"/Main/Inventory"
         }, 
         {
            label: "User Management", 
            icon: "□", 
            section: "others", 
            path: "/Main/UserManagement"
         },
         {
            label: "Profile", 
            icon: "□", 
            section: "others", 
            path: "/Main/Profile"
         }, 
         {
            label: "Logout", 
            icon: "□", 
            section: "footer", 
            path:"/Login",
            hasArrow: true
         }
        ]    
         //
         const roleMenuMap = { 
           "Regular Employee":[
            "Purchase Requisition Form", 
            "My Requisition",
            "Profile"
            ], 
            "Admin":[ 
                "Dashboard", 
                "Purchase Requisition Form", 
                "Requisition List", 
                "My Requisition", 
                "Profile", 
            ], 
            "Chief Administrator Manager":[ 
                "Dashboard", 
                "Purchase Requisition Form", 
                "Requisition List", 
                "My Requisition", 
                "Profile", 
            ], 
            "Project Director":[ 
                "Dashboard", 
                "Purchase Requisition Form", 
                "Requisition List", 
                "My Requisition", 
                "Profile", 
            ], 
            "SuperAdmin":[  
                "Dashboard", 
                "Purchase Requisition Form", 
                "My Requisition", 
                "User Management", 
                "Profile"
            ]
         }
         //find specific Role
         const allowedMenus = roleMenuMap[role] || []; 
        
         // map or filterized menu matching 
        return allMenu.filter((item) => allowedMenus.includes(item.label) || item.label === "Logout"); 
}

 