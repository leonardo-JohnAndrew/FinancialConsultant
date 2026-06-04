export default function Menus(role) {
  // list of menus
  const allMenu = [
    {
      label: "Dashboard",
      icon: "□",
      section: "menu",
      path: "/Main/Home",
    },
    {
      label: "Purchase Requisition Form",
      icon: "□",
      section: "menu",
      path: "/Main/Purchase/Requisition",
    },
    {
      label: "Vouchers",
      icon: "□",
      section: "menu",
      path: "/Main/Vouchers",
    },

    {
      label: "Cashbooks",
      icon: "□",
      section: "menu",
      path: "/Main/Cashbooks",
    },

    {
      label: "Budget Confirmation",
      icon: "□",
      section: "menu",
      path: "/Main/BudgetConfirmation",
    },

    {
      label: "Submitted Requisition",
      icon: "□",
      section: "menu",
      hasDropdown: true,
      subItem: [
        {
          label: "Budget Confirmation",
          icon: "□",
          path: "/Main/SubmittedRequisition/BudgetConfirmation",
        },
        {
          label: "Approved Purchase Requesition",
          icon: "□",
          path: "/Main/SubmittedRequisition/ApprovedPurchaseRequisition",
        },
      ],
    },
    {
      label: "Requisition List",
      icon: "□",
      section: "menu",
      hasDropdown: true,
      subItem: [
        {
          label: "Recommending Approval",
          icon: "□",
          path: "/Main/Purchase/PurchaseRecommendingApproval",
        },
        {
          label: "Requisition History",
          icon: "□",
          path: "/Main/Purchase/RequisitionHistory",
        },
      ],
    },
    //  Reimbursable
    {
      label: "Reimbursable",
      icon: "□",
      section: "menu",
      path: "/Main/Budgets",
    },

    {
      label: "Logout",
      icon: "□",
      section: "footer",
      path: "/Login",
      hasArrow: true,
    },
  ];
  //
  const roleMenuMap = {
    "Regular Employee": [
      "Purchase Requisition Form",
      // "My Requisition",
      // "Profile"
    ],
    Admin: [
      "Dashboard",
      "Purchase Requisition Form",
      "Requisition List",
      "Vouchers",
      //  "My Requisition",
      //  "Profile",
    ],
    "Chief Accountant": [
      "Dashboard",
      "Purchase Requisition Form",
      "Submitted Requisition",
      "Vouchers",
      "Reimbursable",
      "Cashbooks",
    ],
    Accounting: [
      "Dashboard",
      "Purchase Requisition Form",
      "Submitted Requisition",
      "Vouchers",
      "Reimbursable",
      "Cashbooks",
    ],
    "Chief Administrator Manager": [
      "Dashboard",
      "Purchase Requisition Form",
      "Requisition List",
      "Vouchers",
      //  "My Requisition",
      //  "Profile",
    ],
    "Project Director": [
      "Dashboard",
      "Purchase Requisition Form",
      "Requisition List",
      //  "My Requisition",
      //  "Profile",
    ],
    SuperAdmin: [
      "Dashboard",
      "Purchase Requisition Form",
      //  "My Requisition",
      //  "User Management",
      //  "Profile"
    ],
  };
  //find specific Role
  const allowedMenus = roleMenuMap[role] || [];

  // map or filterized menu matching
  return allMenu.filter(
    (item) => allowedMenus.includes(item.label) || item.label === "Logout",
  );
}
