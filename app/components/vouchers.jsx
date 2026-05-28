import { formatMoney } from "@/functions/formatCurrency";
import { formatVoucherDate } from "@/functions/formattDate";
import React from "react";

const VourcherComponent = (props) => {
  const { voucher, index, checkAmount } = props;

  return (
    <div className="mt-10">
      <div className="mb-3 flex justify-end">
        <h4 className="text-lg">Slip#: {voucher.slipNo || "_______"}</h4>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-2 flex-col">
          <h4 className="text-xl font-semibold">PAYMENT VOUCHER</h4>
          <h4 className="text-lg font-bold">Date</h4>
          <h4>
            {voucher.payment_voucher_formatted_date ||
              formatVoucherDate(voucher.createdAt)}
          </h4>
        </div>
        <div className="self-end-safe border-2 h-auto border-black">
          <div className="flex flex-col ">
            <h4 className="border-b-2 p-3 px-5 border-black font-bold">Cash</h4>
            <h4 className="p-3">{voucher.cash || 0}</h4>
          </div>
        </div>
        <div className="border-2 h-auto border-black border-l-0">
          <div className="flex flex-col ">
            <h4 className="border-b-2 p-3 px-5 border-black font-bold">PM</h4>
            <h4></h4>
          </div>
        </div>
      </div>
      {/* table start  */}
      <div className="flex justify-center items-center h-5">
        <h4 className="font-bold text-lg">
          {index === 0
            ? `Amount - ${formatMoney(parseFloat(checkAmount) || 0)}`
            : ``}
        </h4>
      </div>
      {/* flex rows FIrst Part */}
      <div className="flex flex-row">
        <div className="w-87.5 flex border-2">
          <div className=" p-2 border-black">
            <h4 className="font-semibold"> PAYMENT ITEM</h4>
          </div>

          <div className="border-x-2 p-2 px-5.5  border-black">
            <h4>{voucher.payment_item}</h4>
          </div>
          <div className=" p-2 border-l-0 border-r-0">
            <h4 className="font-semibold">PAYEE (NAME)</h4>
          </div>
        </div>
        <div className="flex-2 flex justify-center items-center border-2 border-l-0 border-r-0">
          {/* Payee Name */}
          <h4 className="italic">{voucher.title}</h4>
        </div>
        <div className="w-87.5 border-2 flex justify-center items-end">
          <h4>SIGNATURE</h4>
        </div>
      </div>
      {/*2ND Rows  */}
      <div className="flex flex-row ">
        <div className="w-87.5 flex flex-col border-2 border-t-0">
          <div className="flex justify-center items-center border-b-2">
            <h4>Job#</h4>
          </div>
          <div className="grid grid-cols-10  ">
            <h4 className=" flex justify-center items-center border-r">4</h4>
            <h4 className=" flex justify-center items-center border-r">5</h4>
            <h4 className=" flex justify-center items-center border-r">6</h4>
            <h4 className=" flex justify-center items-center border-r">7</h4>
            <h4 className=" flex justify-center items-center border-r">8</h4>
            <h4 className=" flex justify-center items-center border-r">9</h4>
            <h4 className=" flex justify-center items-center border-r">#</h4>
            <h4 className=" flex justify-center items-center border-r">#</h4>
            <h4 className=" flex justify-center items-center border-r">#</h4>
            <h4 className=" flex justify-center items-center ">#</h4>
          </div>
        </div>
        <div className="flex-2 border-b-2 flex items-center justify-center">
          <h4 className="font-bold text-2xl italic">DESCRIPTION</h4>
        </div>
        <div className="w-87.5 flex-col border-2 border-t-0">
          <div className="flex justify-center items-center border-b-2">
            <h4 className="font-bold">AMOUNT</h4>
          </div>
          <div className="grid grid-cols-9">
            <h4 className=" flex justify-center items-center border-r ">16</h4>
            <h4 className=" flex justify-center items-center border-r">17</h4>
            <h4 className=" flex justify-center items-center border-r">18</h4>
            <h4 className=" flex justify-center items-center border-r">19</h4>
            <h4 className=" flex justify-center items-center border-r">20</h4>
            <h4 className=" flex justify-center items-center border-r">21</h4>
            <h4 className=" flex justify-center items-center border-r">22</h4>
            <h4 className=" flex justify-center items-center border-r">23</h4>
            <h4 className=" flex justify-center items-center ">24</h4>
          </div>
        </div>
      </div>
      {/* 3RD ROWS */}
      <div className="flex flex-row">
        <div className="flex justify-center items-center border-2 border-r-2 border-t-0 p-10 w-87.5">
          <h4>{voucher.job}</h4>
        </div>
        <div className="flex-2 flex-col ">
          {/* description iteration  */}
          {voucher?.children?.map((item, i) => (
            <div
              key={i}
              className="flex-1 border-b-2  p-3.5 flex justify-center items-center"
            >
              <h4 className="italic">{item.title || ""}</h4>
              {/* <input
                type="text"
                className="w-full text-center italic"
                name="description1"
                value={
                  item.title ||
                  "Purchase of Various medicines for Office Consumption with SI#125269"
                }
                onChange={(e) => handleChange(index, e)}
              /> */}
            </div>
          ))}
        </div>
        <div className="w-87.5 flex-col border-2 border-t-0 border-b-0">
          {/*iteration amounts */}
          {voucher?.children?.map((amt, i) => (
            <div
              key={i}
              className="flex flex-row border-b-2 border-t-0 justify-start"
            >
              <div className="p-3 pr-7  border-l-0 border-r-2">
                <h4 className="text-lg">{voucher.voucherType.split(" ")[1]}</h4>
              </div>
              <div className="flex-2 p-2 flex justify-end items-center">
                <h4 className="text-lg">
                  {voucher.voucherType.includes("PHP")
                    ? formatMoney(Number(amt.amount), "PHP")
                    : formatMoney(Number(amt.amount), "USD", "en-US")}
                </h4>
                {/* <input
                  type="number"
                  className="text-lg text-end"
                  name="amount1"
                  value={parseFloat(amt.amount) || 13195.09}
                  onChange={(e) => handleChange(index, e)}
                /> */}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 4TH ROWS */}
      <div className="flex flex-row ">
        <div
          className="w-87.5
                       grid grid-cols-10"
        >
          <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
        </div>
        <div className="flex-2 border-b-2"></div>
        <div className="w-87.5 border-2 border-t-0"></div>
      </div>
      {/* 5th rows */}
      <div className="flex flex-row ">
        <div
          className="w-87.5
                       grid grid-cols-10"
        >
          <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
        </div>
        <div className="flex-2 border-b-2"></div>
        <div className="w-87.5 border-2 border-t-0"></div>
      </div>
      {/* 6th rows */}
      <div className="flex flex-row ">
        <div className="w-87.5 grid grid-cols-10">
          <div className="border-r-2 border-b-2 p-4 py-5 border-l-2 "></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
          <div className="border-r-2 border-b-2 p-4 py-5"></div>
        </div>
        <div className="flex-2 border-b-2"></div>
        <div className="w-87.5 border-2 border-t-0"></div>
      </div>
      {/* 7th rows */}
      <div className="flex flex-row">
        <div className="w-87.5 h-16   flex flex-col ">
          <div className="border-2 border-t-0 flex justify-center items-center">
            <h4 className="font-semibold p-1">ISSUING DEPT.</h4>
          </div>
          <div className="border-2 border-t-0 flex justify-center items-center">
            <h4 className="font-semibold p-0.5">JOB DEPT.</h4>
          </div>
        </div>
        <div className="flex-2 flex flex-row  h-15.5 border-b-2">
          <div className="flex-1 border-r-2"></div>
          <div className="flex-3 flex justify-center items-center">
            <h4 className="font-semibold">TOTAL</h4>
          </div>
        </div>
        <div className="w-87.5">
          <div className="flex  h-15.5 flex-row border-2 border-t-0 justify-start">
            <div
              className="pr-7 
                              border-r-2"
            >
              <h4 className="text-lg pl-3 pt-3">
                {voucher.voucherType.split(" ")[1]}
              </h4>
            </div>
            <div className="flex-2 p-3 flex justify-end items-center">
              <h4 className="text-lg">
                {voucher?.children?.reduce(
                  (store, current) => store + current.amount,
                  0,
                ) || 0}
              </h4>
              {/* <input
                type="number"
                className="text-lg text-end"
                name="total"
                value={
                  voucher?.children?.reduce(
                    (store, current) => store + current.amount,
                    0,
                  ) || 0
                }
                onChange={(e) => handleChange(index, e)}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VourcherComponent;
