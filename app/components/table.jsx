'use client'
import { useState } from "react";
import { formatMoney } from "@/functions/formatCurrency";
const Table = (props) => { 

  return (
    <> 
      <div className='table-container w-full '>
        <table className="border border-gray-300 w-full">
          <thead  className="bg-black text-white border-3 border-darkRed sticky top-0 z-10"> 
            <tr> 
              {props.tableHeader.map((header, index) => (
                <th key={index} className='border-b border-gray-300 text-left px-4 py-2 text-sm font-bold'>
                  {header}
                  {header === "ENDING INVENTORY" && (
                    <div className='w-auto pr-10'>   <input className="bg-gray-300 text-red-500 w-full"   type = 'date' defaultValue = {
                        props.data.purchase?.purchaseItems[0]?.EndingInventoryDate ? props.data.purchase.purchaseItems[0].EndingInventoryDate.split('T')[0] : ""
                    }/> </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
            <tbody>
                {props.data?.purchase?.purchaseItems.map((item, index) => (
                    <tr key={index} className='border-b border-gray-300'>
                        <td className='px-4 py-2'>{parseInt(index + 1) } 
                        </td>
                        <td className='px-4 py-2'>
                          <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200 -"  type="text" defaultValue={item.ItemName} readOnly= {true} />
                        </td>
                        <td className='px-4 py-2'>{item?.RequiredBalance}
                           {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item.RequiredBalance} readOnly= {true} /> */}
                        </td>
                        <td className='px-4 py-2'>
                           <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item?.EndingInventory || 0} readOnly= {true} />
                        </td>
                        <td className='px-4 py-2'>
                            <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item?.Quantity} readOnly= {true} />
                        </td>
                        <td className='px-4 py-2'>{item.Unit}
                        </td>
                        <td className='px-4 py-2'>
                           <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item?.UnitPrice} readOnly= {true} />
                        </td>
                        <td className='px-4 py-2 '>
                           <h4 className="px-2 py-1 w-auto my-1 bg-darkRed text-white" >{formatMoney(item?.Quantity * item?.UnitPrice || 0, 'PHP', 'en-PH')}</h4>    
                        </td> 
                 </tr>             
                ))}
                 {/* for list of all purchases */}
                  {props.list?.map((purchase, index) => (
                    <tr key={index} className='border-b border-gray-300'>
                        <td className='px-4 py-2'>{purchase.PurchaseID}</td>  
                        <td className='px-4 py-2'>{purchase.RequestorName}</td>
                        <td className='px-4 py-2'>{purchase.RequestorDepartment}</td>
                        <td className='px-4 py-2'>{purchase.purchaseItems.length}</td>
                        <td className='px-4 py-2'>{formatMoney(purchase.purchaseItems.reduce((total, item) => total + (item.Quantity * item.UnitPrice), 0), 'PHP', 'en-PH')}</td>
                        <td className='px-4 py-2'>{purchase.Remark}</td>
                        <td className='px-4 py-2'>{new Date(purchase.createdAt).toLocaleDateString()}</td>
                        <td className='px-4 py-2'>
                          <a href={`/Purchase/${purchase.PurchaseID}`} className="px-4 py-2 w-auto my-1 border border-darkRed bg-[#FF8C8C] rounded-xl text-darkRed hover:bg-white text-sm" >
                            View
                          </a>
                        </td>
                 </tr>             
                ))}
            </tbody>
        </table>
      </div>
    </>
  ); 
};

export default Table;