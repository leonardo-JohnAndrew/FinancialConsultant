import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import axios from "axios";

const VoucherTable = (props) => {
  const { data, header, onDuplicated } = props;
  const params = useParams();

  const handleDuplicate = async (id) => {
    try {
      await axios.post(`/api/vouchers/${id}/duplicate`);
      onDuplicated?.(); // callback para i-refresh yung list sa parent
    } catch (err) {
      console.error("Error duplicating voucher", err);
    }
  };

  return (
    <div className="w-full">
      <table className="border border-gray-300 w-full  ">
        <thead className="bg-black text-white w-full ">
          <tr>
            {header.map((th, i) => (
              <th
                key={i}
                className="border-b border-gray-300 px-4 py-2 text-sm font-bold"
              >
                <div>{th}</div>
              </th>
            ))}
            <th className="border-b border-gray-300 px-4 py-2 text-sm font-bold"></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index} className="border-b border-gray-300 text-center">
              <td className="px-4 py2">{item.id}</td>
              <td className="px-4 py2">{item.items.length}</td>
              <td className="px-4 py2">{item.checkAmount}</td>
              <td className="px-4 py2">
                {item.claimable === "true" ? "Yes" : "No"}
              </td>
              <td className="px-4 py2">{item.createdAt.split("T")[0]}</td>
              <td className="px-4 py-2 flex gap-2 justify-center">
                <Link
                  href={`/Main/Vouchers/${item.id}`}
                  className="bg-lightRed rounded-md py-1 px-3 text-white font-bold border  
                 hover:bg-white hover:text-black  hover:border  hover:border-darkRed"
                >
                  view
                </Link>
                <button
                  type="button"
                  onClick={() => handleDuplicate(item.id)}
                  className="bg-gray-700 rounded-md py-1 px-3 text-white font-bold border
                 hover:bg-white hover:text-black hover:border hover:border-gray-700"
                >
                  duplicate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VoucherTable;
