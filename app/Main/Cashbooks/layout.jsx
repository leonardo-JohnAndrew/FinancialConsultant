"use client";
import Header from "@/app/components/header";
const Layout = ({ children }) => {
  return (
    <div className="m-4 mt-3 bg-[white] p-10 print:p-0" id="print-area">
      <Header title={"Cashbooks"} />
      {children}
    </div>
  );
};
export default Layout;
