"use client";
import VoucherTable from "@/app/components/Tables/voucher-table";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

const VouchersList = () => {
  const [vouchers, setVourchers] = useState();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState();
  const [voucherId, setVoucherId] = useState();
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [search, setSearch] = useState("");
  const [dateStartDefault, setDateStartDefault] = useState();
  const [dateEndDefault, setDateEndDefault] = useState();
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(
        `/api/vouchers?page=${page}&limit=${limit}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
      );
      setVourchers(response.data?.data || []);
      setTotalPages(response.data.totalPages);
      setDateStartDefault(response.data.rangeStart.split("T")[0]);
      setDateEndDefault(response.data.rangeEnd.split("T")[0]);
    } catch (err) {
      console.error("Error Fetch Vourchers", err);
    }
  };
  useEffect(() => {
    fetchVouchers();
  }, [page]);
  useEffect(() => {
    if (dateStart || dateEnd) {
      fetchVouchers();
    }
  }, [dateStart, dateEnd]);

  // search button
  useEffect(() => {
    if (voucherId === "") {
      setSearch(false);
    }
  });
  const handleChangeId = useCallback(
    (e) => {
      setVoucherId(e.target.value);
    },
    [voucherId, vouchers],
  );
  const handleChangeDate = (e) => {
    switch (e.target.name) {
      case "dateStart":
        setDateStart(e.target.value);
        break;
      case "dateEnd":
        setDateEnd(e.target.value);
        break;
      default:
        break;
    }
  };
  return (
    <div className="relative mb-5 w-auto">
      <div className="grid grid-row-3 mb-10">
        <hr className="border-t border-gray-300" />
        <div className="flex text-xl">
          <div className="py-4 grow mr-20 w-50 h-auto flex flex-row text-center items-start justify-start  text-white font-bold">
            <h2 className="text-black text-2xl">Search ID: </h2>
            <input
              type="text"
              className="bg-gray-100 ml-4 text-black outline-2 outline-gray-300 text-lg"
              onChange={(e) => handleChangeId(e)}
              placeholder="Enter Purchase ID"
            />
            <button onClick={(e) => setSearch(true)}>
              <FiSearch
                size={28}
                className="ml-2 text-white hover:text-black hover:bg-btnRed cursor-pointer font-extrabold outline outline-darkRed 
               bg-darkRed p-1 w-10"
              />
            </button>
          </div>
          <div className="basis-64 py-4 ml-30 w-50 h-10 flex flex-row items-start justify-center  ">
            <h2 className="text-black text-2xl font-bold">Start: </h2>
            <input
              type="date"
              name="dateStart"
              className="bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg w-35"
              onChange={(e) => handleChangeDate(e)}
              value={dateStart || dateStartDefault || ""}
            />
          </div>
          <div className="basis-64 w-50 h-10 flex flex-row items-start justify-center p-4">
            <h2 className="text-black text-2xl font-bold">End: </h2>
            <input
              type="date"
              name="dateEnd"
              className="bg-gray-100 ml-4 text-black outline-2  outline-gray-300 text-lg "
              value={dateEnd || dateEndDefault || ""}
              onChange={(e) => handleChangeDate(e)}
            />
          </div>
        </div>
        <hr className="border-t border-gray-300" />
      </div>
      <div>
        <VoucherTable
          data={
            search
              ? vouchers.filter((e) => e.checkId === voucherId)
              : vouchers || []
          }
          header={[
            "Vouchers ID",
            "Count",
            "Amount",
            "Claimable",
            "Date Created",
          ]}
        />
      </div>

      {/* paginations */}
      <div className="flex justify-center items-center mt-5">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-btnRed outline outline-darkRed hover:bg-white mr-1"
          disabled={page === 1}
        >
          <FiChevronLeft size={22} />
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`px-4 py-1 border-r-2 border-gray-500 ${page === index + 1 ? "bg-darkRed text-white" : "bg-gray-200 hover:bg-darkRed hover:text-white"}  `}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 border-2 border-black bg-black text-white hover:text-black hover:bg-white ml-1"
          disabled={page === totalPages}
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default VouchersList;
