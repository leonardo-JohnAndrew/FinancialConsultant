"use client";
import CashbooksTable from "@/app/components/Tables/cashbookTable";
import AddCashbookModal from "@/app/components/modals/AddCashbookModal";
import { useBanner } from "@/hooks/Context/banner";
import axios from "axios";
import React, { useEffect, useState } from "react";

const CashbooksList = () => {
  const [cashbook, setCashbook] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSuccess, showError } = useBanner();

  // fetch the data for list of cashbooks
  const fetchCashbooks = async () => {
    try {
      const cashbk = await axios.get("/api/cashbooks");
      setCashbook(cashbk.data.cashbooks || []);
    } catch (err) {
      showError("Failed to Fetch");
    }
  };

  useEffect(() => {
    fetchCashbooks();
  }, []);

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Cashbook
        </button>
      </div>

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
        fetchCashbooks={fetchCashbooks}
      />

      <AddCashbookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchCashbooks={fetchCashbooks}
        existingCashbooks={cashbook}
      />
    </>
  );
};

export default CashbooksList;
