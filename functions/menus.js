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
      label: "Creditors",
      icon: "□",
      section: "menu",
      path: "/Main/Creditors",
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
      ],
    },

    //my requisition list

    {
      label: "My Requisition",
      icon: "□",
      section: "menu",
      path: "/Main/Purchase/MyRequisition",
    },
    {
      label: "User Management",
      icon: "□",
      section: "menu",
      path: "/Main/UserManagement",
    },

    //  Reimbursable
    {
      label: "Summaries",
      icon: "□",
      section: "menu",
      path: "/Main/Summaries",
    },
    {
      label: "BIR 2307",
      icon: "□",
      section: "menu",
      path: "/Main/bir2307",
    },
    {
      label: "Profile",
      icon: "□",
      section: "menu",
      path: "/Main/Profile",
    },

    {
      label: "Logout",
      icon: "□",
      section: "footer",
      path: "/PR",
      hasArrow: true,
    },
  ];
  //
  const roleMenuMap = {
    "Regular Employee": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",

      "Profile",
    ],
    Admin: [
      "Dashboard",
      "Purchase Requisition Form",
      "Requisition List",
      "My Requisition",

      "Profile",
    ],
    "Chief Accountant": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Submitted Requisition",
      "Vouchers",
      "Summaries",
      "Cashbooks",
      "BIR 2307",
      "Creditors",
      "Profile",
    ],
    Accounting: [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Submitted Requisition",
      "Vouchers",
      "Summaries",
      "Cashbooks",
      "BIR 2307",
      "Creditors",
      "Profile",
    ],
    "Chief Administrator Manager": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Requisition List",
      "Vouchers",

      "Creditors",
      //  "My Requisition",
      "Profile",
    ],
    "Project Director": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Requisition List",

      //  "My Requisition",
      "Profile",
    ],
    SuperAdmin: [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      //  "My Requisition",
      "User Management",
    ],
  };
  //find specific Role
  const allowedMenus = roleMenuMap[role] || [];

  // map or filterized menu matching
  return allMenu.filter(
    (item) => allowedMenus.includes(item.label) || item.label === "Logout",
  );
}
export function getAllowedPaths(role) {
  const allMenu = [
    { label: "Dashboard", path: "/Main/Home" },
    { label: "Purchase Requisition Form", path: "/Main/Purchase/Requisition" },
    { label: "Vouchers", path: "/Main/Vouchers" },
    { label: "Cashbooks", path: "/Main/Cashbooks" },
    { label: "Budget Confirmation", path: "/Main/BudgetConfirmation" },
    {
      label: "Submitted Requisition",
      paths: [
        "/Main/SubmittedRequisition/BudgetConfirmation",
        "/Main/SubmittedRequisition/ApprovedPurchaseRequisition",
      ],
    },
    {
      label: "Requisition List",
      paths: [
        "/Main/Purchase/PurchaseRecommendingApproval",
        "/Main/Purchase/RequisitionHistory",
      ],
    },
    { label: "My Requisition", path: "/Main/Purchase/MyRequisition" },
    { label: "User Management", path: "/Main/UserManagement" },
    { label: "Summaries", path: "/Main/Summaries" },
    { label: "BIR 2307", path: "/Main/bir2307" },
    { label: "Creditors", path: "/Main/Creditors" },
  ];

  const roleMenuMap = {
    "Regular Employee": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
    ],
    Admin: [
      "Dashboard",
      "Purchase Requisition Form",
      "Requisition List",
      "My Requisition",
    ],
    "Chief Accountant": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Submitted Requisition",
      "Vouchers",
      "Summaries",
      "Cashbooks",
      "BIR 2307",
      "Creditors",
    ],
    Accounting: [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Submitted Requisition",
      "Vouchers",
      "Summaries",
      "Cashbooks",
      "BIR 2307",
      "Creditors",
    ],
    "Chief Administrator Manager": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Requisition List",
      "Vouchers",
      "BIR 2307",
      "Creditors",
    ],
    "Project Director": [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "Requisition List",
    ],
    SuperAdmin: [
      "Dashboard",
      "Purchase Requisition Form",
      "My Requisition",
      "User Management",
    ],
  };

  const allowedLabels = roleMenuMap[role] || [];

  let paths = [];
  allMenu.forEach((item) => {
    if (allowedLabels.includes(item.label)) {
      if (item.path) paths.push(item.path);
      if (item.paths) paths.push(...item.paths);
    }
  });

  return paths;
}
