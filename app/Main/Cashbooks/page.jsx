"use client";
import CashbooksTable from "@/app/components/Tables/cashbookTable";
import { useBanner } from "@/hooks/Context/banner";
import axios from "axios";
import React, { useEffect, useState } from "react";

const CashbooksList = () => {
  const [cashbook, setCashbook] = useState([]);
  const { showSuccess, showError } = useBanner();
  // fetch the data for list of cashbooks
  const fetchCashbooks = async () => {
    try {
      const cashbk = await axios.post("/api/cashbooks");

      setCashbook(cashbk.data.cashbooks || []);
    } catch (err) {
      showError("Failed to Fetch");
    }
  };
  // use Effect once Renders
  useEffect(() => {
    fetchCashbooks();
  }, []);
  return (
    <>
      {/* call the cashbookTable */}
      <CashbooksTable
        tableHeader={[
          "Project",
          "Currency",
          "Category",
          "Date Start",
          "Date End",
          "",
        ]}
        tbdata={cashbook}
      />
    </>
  );
};

export default CashbooksList;
