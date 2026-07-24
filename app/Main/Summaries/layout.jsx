"use client";
import Header from "@/app/components/header";
const summariesLayout = ({ children }) => {
  return (
    <>
      <div
        className={`min-h-250 m-4 mt-2 bg-[white] p-10 print:p-0 `}
        id="print-area"
      >
        <Header title={"Summaries"} />
        {children}
      </div>
    </>
  );
};

export default summariesLayout;
