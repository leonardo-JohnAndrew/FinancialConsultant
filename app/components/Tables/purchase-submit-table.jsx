'use client '
import React, { use, useEffect , useState} from 'react'
import { formatMoney } from '@/functions/formatCurrency';
import { getItemInfo , calculateQuantity  } from '@/functions/purchase';
const PurchaseSubmitTable = React.memo((props) => {
  const [itemIds, setItemIds] = useState([]); //
  const [itemInfo, setItemInfo] = useState([{
    EndingInventory:0, 
    ItemRequiredBalance:0, 
    ItemUnitPrice:0, 
    ItemQuantity:0
  }]);
  /*
 [ 
   {  EndingInventory:0, 
    ItemRequiredBalance:0, 
    ItemUnitPrice:0, 
    ItemQuantity:0} 
   }, 
   {

   }
 ]


  */
   const [isNewItem, setIsNewItem] = useState([
    {isNew: false}
   ]);

  useEffect(() => {
    console.log(itemIds); 
  },[itemIds])
   //handle item info when item is selected in the dropdown
  const handleChange = (index, value) =>{
  const updatedData = [...itemIds];
  updatedData[index] = value;
  console.log(updatedData);
  handleItemInfo(value, index);
  setItemIds(updatedData);
 }
  //get item info when item is selected in the dropdown
 const handleItemInfo = (itemId, index) => {
   // if item is new, set isNewItem to true to show input fields for new item details
   //
   if(itemId === "new"){
    /* 
       IsNewItem: [ 
          { 
            isNew: true, 
            ItemName: "", 
            ItemRequiredBalance:0, 
            ItemUnitPrice:0, 
            ItemUnit:"", 
            ItemEndingInventory:0, 
            ItemQuantity:0, 
            ItemTotal:0
          }
       ]
    */
    setIsNewItem(prev => {
      const updated = [...prev];
      updated[index] = {
        isNew: true, 
        ItemName: "", 
        ItemRequiredBalance:0, 
        ItemUnitPrice:0,
        ItemUnit:"", 
        ItemEndingInventory:0, 
        ItemQuantity:0, 
        ItemTotal:0
      };
      return updated;
    });
    return;
   }
   const info = getItemInfo(Number(itemId), props.item); 
   const updatedItemInfo = [...itemInfo];
   updatedItemInfo[Number(itemId)] = {
     ItemRequiredBalance: info.requiredBalance,
    ItemUnitPrice: info.unitPrice, 
    ItemQuantity:0, 
    ItemTotal:0
  }
  setItemInfo(updatedItemInfo);
 }
 const handleChangeInfo = ( e,index, value) => {
  const updatedItemInfo = [...itemInfo];
  updatedItemInfo[index] = {
    ...updatedItemInfo[index],
    [e.target.name]: Number(value),
    ItemQuantity: calculateQuantity(
      updatedItemInfo[index]?.ItemRequiredBalance || 0, 
      e.target.name === "EndingInventory" ? Number(value) : updatedItemInfo[index]?.EndingInventory || 0
    ), 
    ItemTotal: updatedItemInfo[index]?.ItemQuantity * updatedItemInfo[index]?.ItemUnitPrice || 0
  }
  console.log(`Item Quantity:  ${updatedItemInfo[index].ItemQuantity}\n Item  Price: ${updatedItemInfo[index].ItemUnitPrice} \n Item Total: ${updatedItemInfo[index].ItemUnitPrice * updatedItemInfo[index].ItemQuantity}\n another total : ${updatedItemInfo[index].ItemTotal}`);
  setItemInfo(updatedItemInfo);
 }
useEffect(() => {
  console.log(itemInfo); 
}, [itemInfo])

 
  return (
    <div>
        {JSON.stringify(props.item)}
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
                      {props.data?.map((item, index) => (
                          <tr key={index} className='border-b border-gray-300'>
                              <td className='px-4 py-2'>{parseInt(index + 1) } 
                              </td>
                              <td className='px-4 py-2'>
                               {
                                // if item is new, show input fields for new item details 
                                isNewItem[index]?.isNew?(
                                  <div className='flex flex-row gap-2'>
                                    <input type="text" className='border border-gray-300 bg-gray-200 text-black flex-1'  placeholder="Item Name" />
                                     {/* button back to select item */} 
                                     <button className='p-1 px-2 bg-[#FF8C8C] text-white font-bold  border border-darkRed' onClick={() => setIsNewItem(prev => {
                                       const updated = [...prev];
                                       updated[index] = {isNew: false};
                                       return updated;
                                     })}>
                                       Select Item
                                     </button>
                                  </div>
                                ):
                              <select name="item" id="" 
                              className='px-2 py-1 border border-darkRed w-full text-white bg-[#FF8C8C] font-bold' 
                              value={itemIds[index] || ""}
                              onChange={(e) => {
                                handleChange(index, e.target.value);
                              }}>
                                <option value="">Select an item</option>
                                {props.item?.map((dataItem, index) => (
                                  <option key={index} value={dataItem.ItemsID}>
                                    {dataItem.ItemName}
                                  </option>
                                ))}
                                  <option value="new">+ Add new item</option>
                              </select>
                               }

                              </td>
                              <td className='px-4 py-2'>
                                { isNewItem[index]?.isNew?(
                                  <div className='flex flex-row gap-2'>
                                    <input type="number" className='border border-gray-300 bg-gray-200 text-black' />
                                     {/* button back to select item */} 
                                  </div>
                                ):( getItemInfo(Number(itemIds[index]), props.item)?.requiredBalance || 0 )}
                                 {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item.RequiredBalance} readOnly= {true} /> */}
                              </td>
                              <td className='px-4 py-2'>
                                 <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200" name='EndingInventory' type="text" defaultValue={item.EndingInventory || 0} 
                                 onChange={(e) => handleChangeInfo(e,itemIds[index], e.target.value)}
                                 />
                              </td>
                              <td className='px-4 py-2'>
                                  <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200 " name="ItemQuantity"  type="text" value={itemInfo[Number(itemIds[index])]?.ItemQuantity || 0
                                   } onChange={(e)=>handleChangeInfo(e, itemIds[index], e.target.value)} readOnly= {true} />
                              </td>
                              <td className='px-4 py-2' name="Unit">
                                { isNewItem[index]?.isNew?(
                                 <select name="item" id="" 
                                     className='px-2 py-1 border border-darkRed w-full text-white bg-[#FF8C8C] font-bold' 
                                     value={itemIds[index] || ""}
                                     onChange={(e) => {
                                     handleChange(index, e.target.value);
                                  }}>
                                  <option value="bxs">bxs</option>
                                  <option value="can">can</option>
                                  <option value="pcks">pcks</option>
                                  <option value="kilo">kilo</option>
                                  <option value="btls">btls</option>
                                  <option value="pcs">pcs</option>
                              </select>
                               /*
                               'bxs','can', 'pcks', 'kilo','btls','pcs'
                               */
                                ):

                                getItemInfo(Number(itemIds[index]), props.item)?.unit||""}

                              </td>
                              <td className='px-4 py-2'>
                                 <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" value={(getItemInfo(Number(itemIds[index]), props.item)?.unitPrice || 0)} onChange={(e)=>{ 
                                  handleChangeInfo(e,itemIds[index],e.target.value)
                                 }} readOnly= {false} />
                              </td>
                              <td className='px-4 py-2 '>
                                 <h4 className="px-2 py-1 w-auto my-1 bg-darkRed text-white" >{formatMoney(itemInfo[Number(itemIds[index])]?.ItemTotal || 0, 'PHP', 'en-PH')}</h4>    
                              </td> 
                       </tr>             
                      ))}
                    </tbody>
                </table>
          </div>
      )
  })

export default PurchaseSubmitTable