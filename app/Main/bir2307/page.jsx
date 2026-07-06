// "use client";

// import { GetChiefAccountantSign } from "@/functions/vouchers";
// import { useState, useEffect } from "react";

// const ATC_OPTIONS = [
//   {
//     value: "WC158",
//     label: "WC158",
//     description:
//       "INCOME PAYMENT MADE BY TOP WITHHOLDING AGENTS TO THEIR LOCAL/RESIDENT SUPPLIER OF GOODS OTHER THAN THOSE COVERED BY OTHER RATES OF WITHHOLDING TAX",
//     rate: 0.01,
//   },
//   {
//     value: "WC160",
//     label: "WC160",
//     description:
//       "INCOME PAYMENT MADE BY TOP WITHHOLDING AGENTS TO THEIR LOCAL/RESIDENTSUPPLIER OF SERVICES\n OTHER THAN THOSE COVERED BY OTHER RATES OF WITHHOLDING TAX",
//     rate: 0.02,
//   },
//   {
//     value: "WC120",
//     label: "WC120",
//     description: "INCOME PAYMENTS TO CERTAIN CONTRACTORS",
//     rate: 0.02,
//   },
//   {
//     value: "WC100",
//     label: "WC100",
//     description:
//       "RENTALS: ON GROSS RENTAL OR LEASE FOR THE CONTINUED USE\n OR POSSESSION OF PERSONAL PROPERTY IN EXCESS OF TEN THOUSAND PESOS (P 10,000)\n ANNUALLY AND REAL PROPERTY USED IN BUSINESS WHICH THE PAYOR\n OR OBLIGOR HAS NOT TAKEN TITLE OR IS NOT TAKING TITLE,\n OR IN WHICH HAS NO EQUITY; POLES, SATELLITES, TRANSMISSION\n FACILITIES AND BILLBOARDS",
//     rate: 0.05,
//   },
// ];

// function getQuarter(month, year) {
//   const now = new Date();
//   const m = now.getMonth() + 1;
//   const y = now.getFullYear();

//   const month_index = month || m;
//   const years = year || y;
//   if (month_index <= 3)
//     return { label: "1st", from: `01/01/${years}`, to: `03/31/${years}` };
//   if (month_index <= 6)
//     return { label: "2nd", from: `04/01/${years}`, to: `06/30/${years}` };
//   if (month_index <= 9)
//     return { label: "3rd", from: `07/01/${years}`, to: `09/30/${years}` };
//   return { label: "4th", from: `10/01/${years}`, to: `12/31/${years}` };
// }

// function fmt(n) {
//   return Number(n)
//     .toFixed(2)
//     .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

// const tdBase =
//   "border border-neutral-500 px-2 py-1 align-top text-[12px] leading-snug";
// const thBase =
//   "border border-neutral-500 bg-neutral-100 px-2 py-1 text-center text-[11px] font-bold leading-snug";
// const inputBase =
//   "w-full border-none bg-transparent text-[13px] outline-none placeholder:text-neutral-400";
// const amountInputBase =
//   "w-full border-none bg-transparent text-right text-[13px] outline-none placeholder:text-neutral-400";
// const selectBase =
//   "w-full border border-neutral-400 bg-white px-1 py-1 text-[12px] outline-none";

// export default function BIR2307Page() {
//   const [quarter, setQuarter] = useState(() => getQuarter());
//   const [payeeTin, setPayeeTin] = useState("");
//   const [payeeName, setPayeeName] = useState("");
//   const [payeeAddress, setPayeeAddress] = useState("");
//   const [payeeZip, setPayeeZip] = useState("");
//   const [ChiefAccountantSign, setChiefAccountantSign] = useState("");
//   const [foreignAddress, setForeignAddress] = useState("");
//   const [atc, setAtc] = useState(ATC_OPTIONS[1]);
//   const [m1, setM1] = useState("");
//   const [m2, setM2] = useState("");
//   const [m3, setM3] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [months, setMonths] = useState();
//   const [years, setYears] = useState();
//   const [suppliers, setSuppliers] = useState([]);
//   const [vouchers, setVouchers] = useState([]);

//   useEffect(() => {
//     const fetchSuppliers = async () => {
//       const res = await fetch("/api/suppliers");
//       const data = await res.json();
//       setSuppliers(data);
//     };
//     fetchSuppliers();
//   }, []);

//   useEffect(() => {
//     const fetchVouchers = async () => {
//       const res = await fetch("/api/vouchers?limit=100");
//       const data = await res.json();
//       setVouchers(data.data || []);
//     };
//     fetchVouchers();
//   }, []);

//   const total =
//     (parseFloat(m1) || 0) + (parseFloat(m2) || 0) + (parseFloat(m3) || 0);
//   const tax = total * atc.rate;

//   const handleAtcChange = (e) => {
//     const found = ATC_OPTIONS.find((o) => o.value === e.target.value);
//     if (found) setAtc(found);
//   };

//   // ✅ FIXED: replaced axios with native fetch, fixed body and blob handling
//   const handleDownload = async () => {
//     setError("");
//     setLoading(true);

//     try {
//       const payload = {
//         quarter,
//         supplier: {
//           supplierTin: payeeTin,
//           supplierName: payeeName,
//           supplierAddress: payeeAddress,
//           zipCode: payeeZip,
//           foreignAddress,
//         },
//         atcCode: atc.value,
//         atcDescription: atc.description,
//         taxRate: atc.rate,
//         month1: parseFloat(m1) || 0,
//         month2: parseFloat(m2) || 0,
//         month3: parseFloat(m3) || 0,
//       };

//       const res = await fetch("/api/bir2307", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(
//           errData.error_message || "Failed to generate Excel file.",
//         );
//       }

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `BIR2307_${payeeName || "export"}.xlsx`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       setError(err.message || "Something went wrong.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-neutral-200 px-3 py-6 font-sans md:px-6">
//       <div className="mx-auto w-full max-w-[1400px] border border-black bg-white p-4 shadow-lg md:p-6">
//         {/* HEADER */}
//         <div className="relative mb-2 flex items-center justify-between border-b border-neutral-500 pb-2">
//           <div className="min-w-[70px] text-[11px] leading-tight">
//             BCS/
//             <br />
//             Item:
//           </div>

//           <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
//             <img
//               src="/uploads/bir logo/logo.webp"
//               alt="Logo"
//               className="h-14 w-auto"
//             />
//             <div className="text-center text-[13px] font-bold leading-tight md:text-[14px]">
//               Republic of the Philippines
//               <br />
//               Department of Finance
//               <br />
//               Bureau of Internal Revenue
//             </div>
//           </div>
//         </div>

//         <div className="relative my-3 flex items-center justify-between gap-4">
//           <div className="min-w-[110px]">
//             <div className="text-[10px] md:text-[11px]">BIR Form No.</div>
//             <div className="text-center text-3xl font-bold leading-none md:text-4xl">
//               2307
//             </div>
//             <div className="text-[10px] md:text-[11px]">
//               January 2018 (ENCS)
//             </div>
//           </div>

//           <div className="absolute left-1/2 -translate-x-1/2 text-center text-xl font-bold leading-tight md:text-2xl">
//             Certificate of Creditable Tax
//             <br />
//             Withheld at Source
//           </div>

//           {/* RIGHT - Barcode */}
//           <div className="min-w-[100px] text-right text-[10px]">
//             <img
//               src="/uploads/bir logo/barcode.jpg"
//               alt="barcode"
//               className="ml-auto mb-1 h-12 w-auto"
//             />
//             2307 01/18ENCS
//           </div>
//         </div>

//         <div className="mb-2 border-b border-neutral-300 pb-2 text-[11px] leading-relaxed md:text-[12px]">
//           Fill in all applicable spaces. Mark all appropriate boxes with an
//           &quot;X&quot;.
//         </div>

//         <div className="overflow-x-auto">
//           {/* PERIOD */}
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <tr>
//                 <Td className="w-8">
//                   <span className="text-[11px] font-bold">1</span>
//                 </Td>
//                 <Td colSpan={8}>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     For the Period &nbsp; From&nbsp;
//                   </span>
//                   <strong className="text-[12px] md:text-[13px]">
//                     {quarter.from}
//                   </strong>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     &nbsp;(MM/DD/YYYY)&nbsp;&nbsp; To&nbsp;
//                   </span>
//                   <strong className="text-[12px] md:text-[13px]">
//                     {quarter.to}
//                   </strong>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     &nbsp;(MM/DD/YYYY)
//                   </span>
//                 </Td>
//               </tr>
//             </tbody>
//           </table>

//           {/* PART I – PAYEE */}
//           <SectionHeader>Part I – Payee Information</SectionHeader>
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <LabelRow num="2" label="Taxpayer Identification Number (TIN)" />
//               <InputRow>
//                 <input
//                   className={inputBase}
//                   value={payeeTin}
//                   onChange={(e) => setPayeeTin(e.target.value)}
//                   placeholder="000-000-000-00000"
//                 />
//               </InputRow>

//               <LabelRow
//                 num="3"
//                 label="Payee's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
//               />
//               <InputRow>
//                 <select
//                   className={selectBase}
//                   onChange={async (e) => {
//                     const selectedVoucher = vouchers
//                       .flatMap((v) => v.items || [])
//                       .find((item) => item.id === parseInt(e.target.value));

//                     //console.log("selectedVoucher:", selectedVoucher.check_id);
//                     const sign = await GetChiefAccountantSign({
//                       id: selectedVoucher.check_id,
//                     });
//                     setChiefAccountantSign(sign.signature);
//                     //console.log("signature", sign.signature);
//                     // console.log("suppliers:", suppliers);
//                     if (selectedVoucher) {
//                       const supplier = suppliers.find(
//                         // (s) =>
//                         // s.supplierName.trim() ===
//                         // selectedVoucher.title.trim(),
//                         (s) =>
//                           selectedVoucher.title
//                             .trim()
//                             .toLowerCase()
//                             .includes(s.supplierName.trim().toLowerCase()) ||
//                           s.supplierName
//                             .trim()
//                             .toLowerCase()
//                             .includes(
//                               selectedVoucher.title.trim().toLowerCase(),
//                             ),
//                       );
//                       // console.log("matched supplier:", supplier);
//                       setPayeeName(selectedVoucher.title || "");
//                       if (supplier) {
//                         setPayeeTin(supplier.supplierTin || "");
//                         setPayeeAddress(supplier.supplierAddress || "");
//                         setPayeeZip(supplier.zipCode || "");
//                       }
//                       const voucherDate = new Date(
//                         selectedVoucher.payment_voucher_date,
//                       );
//                       const month = voucherDate.getMonth() + 1;
//                       const quarterStartMonth = [1, 4, 7, 10].find(
//                         (m) => month >= m && month < m + 3,
//                       );
//                       const year = voucherDate.getFullYear();
//                       setQuarter(getQuarter(month, year));

//                       const monthInQuarter = month - quarterStartMonth + 1;
//                       const amount = selectedVoucher.amount || 0;

//                       if (monthInQuarter === 1) {
//                         setM1(amount);
//                         setM2("");
//                         setM3("");
//                       }
//                       if (monthInQuarter === 2) {
//                         setM1("");
//                         setM2(amount);
//                         setM3("");
//                       }
//                       if (monthInQuarter === 3) {
//                         setM1("");
//                         setM2("");
//                         setM3(amount);
//                       }
//                     }
//                   }}
//                 >
//                   <option value="">-- Select Voucher --</option>
//                   {vouchers
//                     .flatMap((v) => v.items || [])
//                     .map((item) => (
//                       <option key={item.id} value={item.id}>
//                         {item.title} —{" "}
//                         {item.payment_voucher_date?.split("T")[0]}
//                       </option>
//                     ))}
//                 </select>
//               </InputRow>

//               <tr>
//                 <Td>
//                   <span className="text-[11px] font-bold">4</span>
//                 </Td>
//                 <Td colSpan={7}>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     Registered Address
//                   </span>
//                 </Td>
//                 <Td colSpan={2}>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     4A ZIP Code
//                   </span>
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={8}>
//                   <input
//                     className={inputBase}
//                     value={payeeAddress}
//                     onChange={(e) => setPayeeAddress(e.target.value)}
//                     placeholder="Address"
//                   />
//                 </Td>
//                 <Td colSpan={2}>
//                   <input
//                     className={inputBase}
//                     value={payeeZip}
//                     onChange={(e) => setPayeeZip(e.target.value)}
//                     placeholder="ZIP"
//                   />
//                 </Td>
//               </tr>

//               <LabelRow num="5" label="Foreign Address, if applicable" />
//               <InputRow>
//                 <input
//                   className={inputBase}
//                   value={foreignAddress}
//                   onChange={(e) => setForeignAddress(e.target.value)}
//                   placeholder=""
//                 />
//               </InputRow>
//             </tbody>
//           </table>

//           {/* PART II – PAYOR */}
//           <SectionHeader>Part II – Payor Information</SectionHeader>
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <LabelRow num="6" label="Taxpayer Identification Number (TIN)" />
//               <tr>
//                 <Td colSpan={10} className="text-[13px] font-bold">
//                   000-484-418-00000
//                 </Td>
//               </tr>

//               <LabelRow
//                 num="7"
//                 label="Payor's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
//               />
//               <tr>
//                 <Td colSpan={10} className="text-[13px] font-bold">
//                   ORIENTAL CONSULTANTS GLOBAL CO. LTD. - PHILIPPINE BRANCH
//                 </Td>
//               </tr>

//               <tr>
//                 <Td>
//                   <span className="text-[11px] font-bold">8</span>
//                 </Td>
//                 <Td colSpan={7}>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     Registered Address
//                   </span>
//                 </Td>
//                 <Td colSpan={2}>
//                   <span className="text-[11px] text-neutral-600 md:text-[12px]">
//                     8A ZIP Code
//                   </span>
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={8} className="text-[12px]">
//                   UNIT 38C RUFINO PACIFIC TOWER, 6784 AYALA AVE., BRGY. SAN
//                   LORENZO, 4TH DIST., MAKATI CITY
//                 </Td>
//                 <Td colSpan={2} className="text-center font-bold">
//                   1223
//                 </Td>
//               </tr>
//             </tbody>
//           </table>

//           {/* PART III – EWT */}
//           <SectionHeader>
//             Part III – Details of Monthly Income Payments and Taxes Withheld
//           </SectionHeader>
//           <table className="w-full min-w-[1100px] border-collapse">
//             <thead>
//               <tr>
//                 <Th colSpan={4} rowSpan={2}>
//                   Income Payments Subject to Expanded Withholding Tax
//                 </Th>
//                 <Th rowSpan={2}>ATC</Th>
//                 <Th colSpan={4}>AMOUNT OF INCOME PAYMENTS</Th>
//                 <Th rowSpan={2}>Tax Withheld for the Quarter</Th>
//               </tr>
//               <tr>
//                 <Th>1st Month of the Quarter</Th>
//                 <Th>2nd Month of the Quarter</Th>
//                 <Th>3rd Month of the Quarter</Th>
//                 <Th>Total</Th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="h-14">
//                 <Td
//                   colSpan={4}
//                   className="align-middle text-[11px] leading-snug"
//                 >
//                   {atc.description}
//                 </Td>
//                 <Td className="align-middle p-1">
//                   <select
//                     className={selectBase}
//                     value={atc.value}
//                     onChange={handleAtcChange}
//                   >
//                     {ATC_OPTIONS.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))}
//                   </select>
//                 </Td>
//                 <Td>
//                   <input
//                     className={amountInputBase}
//                     type="number"
//                     value={m1}
//                     onChange={(e) => setM1(e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </Td>
//                 <Td>
//                   <input
//                     className={amountInputBase}
//                     type="number"
//                     value={m2}
//                     onChange={(e) => setM2(e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </Td>
//                 <Td>
//                   <input
//                     className={amountInputBase}
//                     type="number"
//                     value={m3}
//                     onChange={(e) => setM3(e.target.value)}
//                     placeholder="0.00"
//                   />
//                 </Td>
//                 <Td className="text-right font-bold">{fmt(total)}</Td>
//                 <Td className="text-right font-bold">{fmt(tax)}</Td>
//               </tr>

//               {Array.from({ length: 11 }).map((_, i) => (
//                 <tr key={i} className="h-6">
//                   <Td colSpan={4} />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                 </tr>
//               ))}

//               <tr className="bg-neutral-50">
//                 <Td colSpan={4} className="font-bold">
//                   Total
//                 </Td>
//                 <Td />
//                 <Td className="text-right">{fmt(parseFloat(m1) || 0)}</Td>
//                 <Td className="text-right">{fmt(parseFloat(m2) || 0)}</Td>
//                 <Td className="text-right">{fmt(parseFloat(m3) || 0)}</Td>
//                 <Td className="text-right font-bold">{fmt(total)}</Td>
//                 <Td className="text-right font-bold">{fmt(tax)}</Td>
//               </tr>

//               <tr className="bg-neutral-50">
//                 <Td colSpan={4} className="font-bold">
//                   Money Payments Subject to Withholding of Business Tax
//                   (Government &amp; Private)
//                 </Td>
//                 <Td />
//                 <Td className="text-right"></Td>
//                 <Td className="text-right"></Td>
//                 <Td className="text-right"></Td>
//                 <Td className="text-right font-bold"></Td>
//                 <Td className="text-right font-bold"></Td>
//               </tr>
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <tr key={i} className="h-6">
//                   <Td colSpan={4} />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                   <Td />
//                 </tr>
//               ))}

//               <tr className="bg-neutral-50">
//                 <Td colSpan={4} className="font-bold">
//                   Total
//                 </Td>
//                 <Td />
//                 <Td className="text-right"></Td>
//                 <Td className="text-right"></Td>
//                 <Td className="text-right"></Td>
//                 <Td className="text-right font-bold"></Td>
//                 <Td className="text-right font-bold"></Td>
//               </tr>
//             </tbody>
//           </table>

//           {/* DECLARATION */}
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <tr>
//                 <Td colSpan={10} className="px-2 py-2 text-[11px] leading-6">
//                   &nbsp;&nbsp;&nbsp;We declare under the penalties of perjury
//                   that this certificate has been made in good faith, verified by
//                   us, and to the best of our knowledge and belief, is true and
//                   correct, pursuant to the provisions of the National Internal
//                   Revenue Code, as amended, and the regulations issued under
//                   authority thereof. Further, we give our consent to the
//                   processing of our information as contemplated under the Data
//                   Privacy Act of 2012 (R.A. No. 10173) for legitimate and lawful
//                   purposes.
//                 </Td>
//               </tr>
//             </tbody>
//           </table>

//           {/* PAYOR SIGNATURE BLOCK */}
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <tr>
//                 <Td
//                   colSpan={10}
//                   className="h-[80px] align-bottom px-2 py-1 text-[12px]"
//                 >
//                   ELSA G. OCRETO
//                   <br />
//                   <span className="text-[11px]">
//                     ASSISTANT GENERAL MANAGER, FINANCE &amp; ACCOUNTING / TIN
//                     119-839-069
//                   </span>
//                 </Td>
//               </tr>
//               <tr>
//                 <Td
//                   colSpan={10}
//                   className="border-t border-t-black px-2 py-1 text-[11px]"
//                 >
//                   Signature over Printed Name of Payor/Payor&apos;s Authorized
//                   Representative/Tax Agent
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={10} className="px-2 py-1 text-[11px]">
//                   (Indicate Title/Designation and TIN)
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={4} className="text-[11px]">
//                   Tax Agent Accreditation No./
//                 </Td>
//                 <Td colSpan={3} className="text-center text-[11px]">
//                   Date of Issue
//                   <br />
//                   (MM/DD/YYYY)
//                 </Td>
//                 <Td colSpan={3} className="text-center text-[11px]">
//                   Date of Expiry
//                   <br />
//                   (MM/DD/YYYY)
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={10} className="text-[11px]">
//                   Attorney&apos;s Roll No. (if applicable)
//                 </Td>
//               </tr>
//             </tbody>
//           </table>

//           {/* CONFORME / PAYEE SIGNATURE BLOCK */}
//           <table className="w-full min-w-[1100px] border-collapse">
//             <tbody>
//               <tr>
//                 <Td colSpan={10} className="px-2 py-1 text-[12px] font-bold">
//                   CONFORME:
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={10} className="h-[80px]" />
//               </tr>
//               <tr>
//                 <Td
//                   colSpan={10}
//                   className="border-t border-t-black px-2 py-1 text-[11px]"
//                 >
//                   Signature over Printed Name of Payee/Payee&apos;s Authorized
//                   Representative/Tax Agent
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={10} className="px-2 py-1 text-[11px]">
//                   (Indicate Title/Designation and TIN)
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={4} className="text-[11px]">
//                   Tax Agent Accreditation No./
//                 </Td>
//                 <Td colSpan={3} className="text-center text-[11px]">
//                   Date of Issue
//                   <br />
//                   (MM/DD/YYYY)
//                 </Td>
//                 <Td colSpan={3} className="text-center text-[11px]">
//                   Date of Expiry
//                   <br />
//                   (MM/DD/YYYY)
//                 </Td>
//               </tr>
//               <tr>
//                 <Td colSpan={10} className="text-[11px]">
//                   Attorney&apos;s Roll No. (if applicable)
//                 </Td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* NOTE */}
//         <div className="mt-0 border-t border-neutral-500 px-1 py-2 text-[11px] text-neutral-700">
//           *NOTE: The BIR Data Privacy is in the BIR website (www.bir.gov.ph)
//         </div>

//         {/* DOWNLOAD BUTTON */}
//         {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

//         <button
//           className={`mt-4 inline-flex items-center gap-2 rounded-md bg-[#1F4E79] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#173a59] ${
//             loading ? "cursor-not-allowed opacity-70" : ""
//           }`}
//           onClick={handleDownload}
//           disabled={loading}
//         >
//           {loading ? "Generating..." : "⬇ Download BIR 2307 (.xlsx)"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* Helper Components */

// function Td({ children, colSpan, rowSpan, className = "" }) {
//   return (
//     <td
//       colSpan={colSpan}
//       rowSpan={rowSpan}
//       className={`${tdBase} ${className}`}
//     >
//       {children}
//     </td>
//   );
// }

// function Th({ children, colSpan, rowSpan, className = "" }) {
//   return (
//     <th
//       colSpan={colSpan}
//       rowSpan={rowSpan}
//       className={`${thBase} ${className}`}
//     >
//       {children}
//     </th>
//   );
// }

// function SectionHeader({ children }) {
//   return (
//     <div className="border-x border-b border-neutral-500 bg-neutral-300 px-2 py-1 text-center text-[12px] font-bold md:text-[13px]">
//       {children}
//     </div>
//   );
// }

// function LabelRow({ num, label }) {
//   return (
//     <tr>
//       <Td>
//         <span className="text-[11px] font-bold">{num}</span>
//       </Td>
//       <Td colSpan={9}>
//         <span className="text-[11px] text-neutral-600 md:text-[12px]">
//           {label}
//         </span>
//       </Td>
//     </tr>
//   );
// }

// function InputRow({ children }) {
//   return (
//     <tr>
//       <Td colSpan={10} className="border-t-0">
//         {children}
//       </Td>
//     </tr>
//   );
// }
"use client";

import { GetChiefAccountantSign } from "@/functions/vouchers";
import { useState, useEffect } from "react";

const ATC_OPTIONS = [
  {
    value: "WC158",
    label: "WC158",
    description:
      "INCOME PAYMENT MADE BY TOP WITHHOLDING AGENTS TO THEIR LOCAL/RESIDENT SUPPLIER OF GOODS OTHER THAN THOSE COVERED BY OTHER RATES OF WITHHOLDING TAX",
    rate: 0.01,
  },
  {
    value: "WC160",
    label: "WC160",
    description:
      "INCOME PAYMENT MADE BY TOP WITHHOLDING AGENTS TO THEIR LOCAL/RESIDENTSUPPLIER OF SERVICES\n OTHER THAN THOSE COVERED BY OTHER RATES OF WITHHOLDING TAX",
    rate: 0.02,
  },
  {
    value: "WC120",
    label: "WC120",
    description: "INCOME PAYMENTS TO CERTAIN CONTRACTORS",
    rate: 0.02,
  },
  {
    value: "WC100",
    label: "WC100",
    description:
      "RENTALS: ON GROSS RENTAL OR LEASE FOR THE CONTINUED USE\n OR POSSESSION OF PERSONAL PROPERTY IN EXCESS OF TEN THOUSAND PESOS (P 10,000)\n ANNUALLY AND REAL PROPERTY USED IN BUSINESS WHICH THE PAYOR\n OR OBLIGOR HAS NOT TAKEN TITLE OR IS NOT TAKING TITLE,\n OR IN WHICH HAS NO EQUITY; POLES, SATELLITES, TRANSMISSION\n FACILITIES AND BILLBOARDS",
    rate: 0.05,
  },
];

function getQuarter(month, year) {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  const month_index = month || m;
  const years = year || y;
  if (month_index <= 3)
    return { label: "1st", from: `01/01/${years}`, to: `03/31/${years}` };
  if (month_index <= 6)
    return { label: "2nd", from: `04/01/${years}`, to: `06/30/${years}` };
  if (month_index <= 9)
    return { label: "3rd", from: `07/01/${years}`, to: `09/30/${years}` };
  return { label: "4th", from: `10/01/${years}`, to: `12/31/${years}` };
}

function fmt(n) {
  return Number(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const tdBase =
  "border border-neutral-500 px-2 py-1 align-top text-[12px] leading-snug";
const thBase =
  "border border-neutral-500 bg-neutral-100 px-2 py-1 text-center text-[11px] font-bold leading-snug";
const inputBase =
  "w-full border-none bg-transparent text-[13px] outline-none placeholder:text-neutral-400";
const amountInputBase =
  "w-full border-none bg-transparent text-right text-[13px] outline-none placeholder:text-neutral-400";
const selectBase =
  "w-full border border-neutral-400 bg-white px-1 py-1 text-[12px] outline-none";

export default function BIR2307Page() {
  const [quarter, setQuarter] = useState(() => getQuarter());
  const [payeeTin, setPayeeTin] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [payeeAddress, setPayeeAddress] = useState("");
  const [payeeZip, setPayeeZip] = useState("");
  const [ChiefAccountantSign, setChiefAccountantSign] = useState("");
  const [foreignAddress, setForeignAddress] = useState("");
  const [atc, setAtc] = useState(ATC_OPTIONS[1]);
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [m3, setM3] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [months, setMonths] = useState();
  const [years, setYears] = useState();
  const [suppliers, setSuppliers] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      const res = await fetch("/api/vouchers?limit=100");
      const data = await res.json();
      setVouchers(data.data || []);
    };
    fetchVouchers();
  }, []);

  const total =
    (parseFloat(m1) || 0) + (parseFloat(m2) || 0) + (parseFloat(m3) || 0);
  const tax = total * atc.rate;

  const handleAtcChange = (e) => {
    const found = ATC_OPTIONS.find((o) => o.value === e.target.value);
    if (found) setAtc(found);
  };

  // ✅ FIXED: replaced axios with native fetch, fixed body and blob handling
  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      const payload = {
        quarter,
        supplier: {
          supplierTin: payeeTin,
          supplierName: payeeName,
          supplierAddress: payeeAddress,
          zipCode: payeeZip,
          foreignAddress,
        },
        atcCode: atc.value,
        atcDescription: atc.description,
        taxRate: atc.rate,
        month1: parseFloat(m1) || 0,
        month2: parseFloat(m2) || 0,
        month3: parseFloat(m3) || 0,
        chiefAccountantSign: ChiefAccountantSign,
      };

      const res = await fetch("/api/bir2307", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error_message || "Failed to generate Excel file.",
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BIR2307_${payeeName || "export"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 px-3 py-6 font-sans md:px-6">
      <div className="mx-auto w-full max-w-[1400px] border border-black bg-white p-4 shadow-lg md:p-6">
        {/* HEADER */}
        <div className="relative mb-2 flex items-center justify-between border-b border-neutral-500 pb-2">
          <div className="min-w-[70px] text-[11px] leading-tight">
            BCS/
            <br />
            Item:
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <img
              src="/uploads/bir logo/logo.webp"
              alt="Logo"
              className="h-14 w-auto"
            />
            <div className="text-center text-[13px] font-bold leading-tight md:text-[14px]">
              Republic of the Philippines
              <br />
              Department of Finance
              <br />
              Bureau of Internal Revenue
            </div>
          </div>
        </div>

        <div className="relative my-3 flex items-center justify-between gap-4">
          <div className="min-w-[110px]">
            <div className="text-[10px] md:text-[11px]">BIR Form No.</div>
            <div className="text-center text-3xl font-bold leading-none md:text-4xl">
              2307
            </div>
            <div className="text-[10px] md:text-[11px]">
              January 2018 (ENCS)
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center text-xl font-bold leading-tight md:text-2xl">
            Certificate of Creditable Tax
            <br />
            Withheld at Source
          </div>

          {/* RIGHT - Barcode */}
          <div className="min-w-[100px] text-right text-[10px]">
            <img
              src="/uploads/bir logo/barcode.jpg"
              alt="barcode"
              className="ml-auto mb-1 h-12 w-auto"
            />
            2307 01/18ENCS
          </div>
        </div>

        <div className="mb-2 border-b border-neutral-300 pb-2 text-[11px] leading-relaxed md:text-[12px]">
          Fill in all applicable spaces. Mark all appropriate boxes with an
          &quot;X&quot;.
        </div>

        <div className="overflow-x-auto">
          {/* PERIOD */}
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <tr>
                <Td className="w-8">
                  <span className="text-[11px] font-bold">1</span>
                </Td>
                <Td colSpan={8}>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    For the Period &nbsp; From&nbsp;
                  </span>
                  <strong className="text-[12px] md:text-[13px]">
                    {quarter.from}
                  </strong>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    &nbsp;(MM/DD/YYYY)&nbsp;&nbsp; To&nbsp;
                  </span>
                  <strong className="text-[12px] md:text-[13px]">
                    {quarter.to}
                  </strong>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    &nbsp;(MM/DD/YYYY)
                  </span>
                </Td>
              </tr>
            </tbody>
          </table>

          {/* PART I – PAYEE */}
          <SectionHeader>Part I – Payee Information</SectionHeader>
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <LabelRow num="2" label="Taxpayer Identification Number (TIN)" />
              <InputRow>
                <input
                  className={inputBase}
                  value={payeeTin}
                  onChange={(e) => setPayeeTin(e.target.value)}
                  placeholder="000-000-000-00000"
                />
              </InputRow>

              <LabelRow
                num="3"
                label="Payee's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
              />
              <InputRow>
                <select
                  className={selectBase}
                  onChange={async (e) => {
                    const selectedVoucher = vouchers
                      .flatMap((v) => v.items || [])
                      .find((item) => item.id === parseInt(e.target.value));

                    //console.log("selectedVoucher:", selectedVoucher.check_id);
                    const sign = await GetChiefAccountantSign({
                      id: selectedVoucher.check_id,
                    });
                    setChiefAccountantSign(sign.signature);
                    //console.log("signature", sign.signature);
                    // console.log("suppliers:", suppliers);
                    if (selectedVoucher) {
                      const supplier = suppliers.find(
                        // (s) =>
                        // s.supplierName.trim() ===
                        // selectedVoucher.title.trim(),
                        (s) =>
                          selectedVoucher.title
                            .trim()
                            .toLowerCase()
                            .includes(s.supplierName.trim().toLowerCase()) ||
                          s.supplierName
                            .trim()
                            .toLowerCase()
                            .includes(
                              selectedVoucher.title.trim().toLowerCase(),
                            ),
                      );
                      // console.log("matched supplier:", supplier);
                      setPayeeName(selectedVoucher.title || "");
                      if (supplier) {
                        setPayeeTin(supplier.supplierTin || "");
                        setPayeeAddress(supplier.supplierAddress || "");
                        setPayeeZip(supplier.zipCode || "");
                      }
                      const voucherDate = new Date(
                        selectedVoucher.payment_voucher_date,
                      );
                      const month = voucherDate.getMonth() + 1;
                      const quarterStartMonth = [1, 4, 7, 10].find(
                        (m) => month >= m && month < m + 3,
                      );
                      const year = voucherDate.getFullYear();
                      setQuarter(getQuarter(month, year));

                      const monthInQuarter = month - quarterStartMonth + 1;
                      const amount = selectedVoucher.amount || 0;

                      if (monthInQuarter === 1) {
                        setM1(amount);
                        setM2("");
                        setM3("");
                      }
                      if (monthInQuarter === 2) {
                        setM1("");
                        setM2(amount);
                        setM3("");
                      }
                      if (monthInQuarter === 3) {
                        setM1("");
                        setM2("");
                        setM3(amount);
                      }
                    }
                  }}
                >
                  <option value="">-- Select Voucher --</option>
                  {vouchers
                    .flatMap((v) => v.items || [])
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} —{" "}
                        {item.payment_voucher_date?.split("T")[0]}
                      </option>
                    ))}
                </select>
              </InputRow>

              <tr>
                <Td>
                  <span className="text-[11px] font-bold">4</span>
                </Td>
                <Td colSpan={7}>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    Registered Address
                  </span>
                </Td>
                <Td colSpan={2}>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    4A ZIP Code
                  </span>
                </Td>
              </tr>
              <tr>
                <Td colSpan={8}>
                  <input
                    className={inputBase}
                    value={payeeAddress}
                    onChange={(e) => setPayeeAddress(e.target.value)}
                    placeholder="Address"
                  />
                </Td>
                <Td colSpan={2}>
                  <input
                    className={inputBase}
                    value={payeeZip}
                    onChange={(e) => setPayeeZip(e.target.value)}
                    placeholder="ZIP"
                  />
                </Td>
              </tr>

              <LabelRow num="5" label="Foreign Address, if applicable" />
              <InputRow>
                <input
                  className={inputBase}
                  value={foreignAddress}
                  onChange={(e) => setForeignAddress(e.target.value)}
                  placeholder=""
                />
              </InputRow>
            </tbody>
          </table>

          {/* PART II – PAYOR */}
          <SectionHeader>Part II – Payor Information</SectionHeader>
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <LabelRow num="6" label="Taxpayer Identification Number (TIN)" />
              <tr>
                <Td colSpan={10} className="text-[13px] font-bold">
                  000-484-418-00000
                </Td>
              </tr>

              <LabelRow
                num="7"
                label="Payor's Name (Last Name, First Name, Middle Name for Individual OR Registered Name for Non-Individual)"
              />
              <tr>
                <Td colSpan={10} className="text-[13px] font-bold">
                  ORIENTAL CONSULTANTS GLOBAL CO. LTD. - PHILIPPINE BRANCH
                </Td>
              </tr>

              <tr>
                <Td>
                  <span className="text-[11px] font-bold">8</span>
                </Td>
                <Td colSpan={7}>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    Registered Address
                  </span>
                </Td>
                <Td colSpan={2}>
                  <span className="text-[11px] text-neutral-600 md:text-[12px]">
                    8A ZIP Code
                  </span>
                </Td>
              </tr>
              <tr>
                <Td colSpan={8} className="text-[12px]">
                  UNIT 38C RUFINO PACIFIC TOWER, 6784 AYALA AVE., BRGY. SAN
                  LORENZO, 4TH DIST., MAKATI CITY
                </Td>
                <Td colSpan={2} className="text-center font-bold">
                  1223
                </Td>
              </tr>
            </tbody>
          </table>

          {/* PART III – EWT */}
          <SectionHeader>
            Part III – Details of Monthly Income Payments and Taxes Withheld
          </SectionHeader>
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr>
                <Th colSpan={4} rowSpan={2}>
                  Income Payments Subject to Expanded Withholding Tax
                </Th>
                <Th rowSpan={2}>ATC</Th>
                <Th colSpan={4}>AMOUNT OF INCOME PAYMENTS</Th>
                <Th rowSpan={2}>Tax Withheld for the Quarter</Th>
              </tr>
              <tr>
                <Th>1st Month of the Quarter</Th>
                <Th>2nd Month of the Quarter</Th>
                <Th>3rd Month of the Quarter</Th>
                <Th>Total</Th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-14">
                <Td
                  colSpan={4}
                  className="align-middle text-[11px] leading-snug"
                >
                  {atc.description}
                </Td>
                <Td className="align-middle p-1">
                  <select
                    className={selectBase}
                    value={atc.value}
                    onChange={handleAtcChange}
                  >
                    {ATC_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input
                    className={amountInputBase}
                    type="number"
                    value={m1}
                    onChange={(e) => setM1(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
                <Td>
                  <input
                    className={amountInputBase}
                    type="number"
                    value={m2}
                    onChange={(e) => setM2(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
                <Td>
                  <input
                    className={amountInputBase}
                    type="number"
                    value={m3}
                    onChange={(e) => setM3(e.target.value)}
                    placeholder="0.00"
                  />
                </Td>
                <Td className="text-right font-bold">{fmt(total)}</Td>
                <Td className="text-right font-bold">{fmt(tax)}</Td>
              </tr>

              {Array.from({ length: 11 }).map((_, i) => (
                <tr key={i} className="h-6">
                  <Td colSpan={4} />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ))}

              <tr className="bg-neutral-50">
                <Td colSpan={4} className="font-bold">
                  Total
                </Td>
                <Td />
                <Td className="text-right">{fmt(parseFloat(m1) || 0)}</Td>
                <Td className="text-right">{fmt(parseFloat(m2) || 0)}</Td>
                <Td className="text-right">{fmt(parseFloat(m3) || 0)}</Td>
                <Td className="text-right font-bold">{fmt(total)}</Td>
                <Td className="text-right font-bold">{fmt(tax)}</Td>
              </tr>

              <tr className="bg-neutral-50">
                <Td colSpan={4} className="font-bold">
                  Money Payments Subject to Withholding of Business Tax
                  (Government &amp; Private)
                </Td>
                <Td />
                <Td className="text-right"></Td>
                <Td className="text-right"></Td>
                <Td className="text-right"></Td>
                <Td className="text-right font-bold"></Td>
                <Td className="text-right font-bold"></Td>
              </tr>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="h-6">
                  <Td colSpan={4} />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ))}

              <tr className="bg-neutral-50">
                <Td colSpan={4} className="font-bold">
                  Total
                </Td>
                <Td />
                <Td className="text-right"></Td>
                <Td className="text-right"></Td>
                <Td className="text-right"></Td>
                <Td className="text-right font-bold"></Td>
                <Td className="text-right font-bold"></Td>
              </tr>
            </tbody>
          </table>

          {/* DECLARATION */}
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <tr>
                <Td colSpan={10} className="px-2 py-2 text-[11px] leading-6">
                  &nbsp;&nbsp;&nbsp;We declare under the penalties of perjury
                  that this certificate has been made in good faith, verified by
                  us, and to the best of our knowledge and belief, is true and
                  correct, pursuant to the provisions of the National Internal
                  Revenue Code, as amended, and the regulations issued under
                  authority thereof. Further, we give our consent to the
                  processing of our information as contemplated under the Data
                  Privacy Act of 2012 (R.A. No. 10173) for legitimate and lawful
                  purposes.
                </Td>
              </tr>
            </tbody>
          </table>

          {/* PAYOR SIGNATURE BLOCK */}
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <tr>
                <Td
                  colSpan={10}
                  className="h-[80px] align-bottom px-2 py-1 text-[12px]"
                >
                  {ChiefAccountantSign && (
                    <img
                      src={ChiefAccountantSign}
                      alt="E-Signature"
                      className="h-10 w-auto"
                    />
                  )}
                  ELSA G. OCRETO
                  <br />
                  <span className="text-[11px]">
                    ASSISTANT GENERAL MANAGER, FINANCE &amp; ACCOUNTING / TIN
                    119-839-069
                  </span>
                </Td>
              </tr>
              <tr>
                <Td
                  colSpan={10}
                  className="border-t border-t-black px-2 py-1 text-[11px]"
                >
                  Signature over Printed Name of Payor/Payor&apos;s Authorized
                  Representative/Tax Agent
                </Td>
              </tr>
              <tr>
                <Td colSpan={10} className="px-2 py-1 text-[11px]">
                  (Indicate Title/Designation and TIN)
                </Td>
              </tr>
              <tr>
                <Td colSpan={4} className="text-[11px]">
                  Tax Agent Accreditation No./
                </Td>
                <Td colSpan={3} className="text-center text-[11px]">
                  Date of Issue
                  <br />
                  (MM/DD/YYYY)
                </Td>
                <Td colSpan={3} className="text-center text-[11px]">
                  Date of Expiry
                  <br />
                  (MM/DD/YYYY)
                </Td>
              </tr>
              <tr>
                <Td colSpan={10} className="text-[11px]">
                  Attorney&apos;s Roll No. (if applicable)
                </Td>
              </tr>
            </tbody>
          </table>

          {/* CONFORME / PAYEE SIGNATURE BLOCK */}
          <table className="w-full min-w-[1100px] border-collapse">
            <tbody>
              <tr>
                <Td colSpan={10} className="px-2 py-1 text-[12px] font-bold">
                  CONFORME:
                </Td>
              </tr>
              <tr>
                <Td colSpan={10} className="h-[80px]" />
              </tr>
              <tr>
                <Td
                  colSpan={10}
                  className="border-t border-t-black px-2 py-1 text-[11px]"
                >
                  Signature over Printed Name of Payee/Payee&apos;s Authorized
                  Representative/Tax Agent
                </Td>
              </tr>
              <tr>
                <Td colSpan={10} className="px-2 py-1 text-[11px]">
                  (Indicate Title/Designation and TIN)
                </Td>
              </tr>
              <tr>
                <Td colSpan={4} className="text-[11px]">
                  Tax Agent Accreditation No./
                </Td>
                <Td colSpan={3} className="text-center text-[11px]">
                  Date of Issue
                  <br />
                  (MM/DD/YYYY)
                </Td>
                <Td colSpan={3} className="text-center text-[11px]">
                  Date of Expiry
                  <br />
                  (MM/DD/YYYY)
                </Td>
              </tr>
              <tr>
                <Td colSpan={10} className="text-[11px]">
                  Attorney&apos;s Roll No. (if applicable)
                </Td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NOTE */}
        <div className="mt-0 border-t border-neutral-500 px-1 py-2 text-[11px] text-neutral-700">
          *NOTE: The BIR Data Privacy is in the BIR website (www.bir.gov.ph)
        </div>

        {/* DOWNLOAD BUTTON */}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <button
          className={`mt-4 inline-flex items-center gap-2 rounded-md bg-[#1F4E79] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#173a59] ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? "Generating..." : "⬇ Download BIR 2307 (.xlsx)"}
        </button>
      </div>
    </div>
  );
}

/* Helper Components */

function Td({ children, colSpan, rowSpan, className = "" }) {
  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`${tdBase} ${className}`}
    >
      {children}
    </td>
  );
}

function Th({ children, colSpan, rowSpan, className = "" }) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`${thBase} ${className}`}
    >
      {children}
    </th>
  );
}

function SectionHeader({ children }) {
  return (
    <div className="border-x border-b border-neutral-500 bg-neutral-300 px-2 py-1 text-center text-[12px] font-bold md:text-[13px]">
      {children}
    </div>
  );
}

function LabelRow({ num, label }) {
  return (
    <tr>
      <Td>
        <span className="text-[11px] font-bold">{num}</span>
      </Td>
      <Td colSpan={9}>
        <span className="text-[11px] text-neutral-600 md:text-[12px]">
          {label}
        </span>
      </Td>
    </tr>
  );
}

function InputRow({ children }) {
  return (
    <tr>
      <Td colSpan={10} className="border-t-0">
        {children}
      </Td>
    </tr>
  );
}
