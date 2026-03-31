'use client '
import React, { use, useEffect , useState} from 'react'
import { formatMoney } from '@/functions/formatCurrency';
import { getItemInfo , calculateQuantity  } from '@/functions/purchase';
import { getTotal } from '@/functions/purchase';
const PurchaseSubmitTable = React.memo((props) => {
  // destructure props to get data, item, setItemInfo, setItemIds, and tableHeader
  const {
    handleSubmitInfo, 
    item, 
    setItemIds, 
    itemIds,
    setItemInfo, 
    itemInfo,  
    setData, 
    setEndingInventoryDate,
  } = props
  
    
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
   const [NewItem, setNewItem] = useState([
    {isNew: false}
   ]);

  useEffect(() => {
    //alert(props.message? props.message : "No message provided"); 
    console.log(itemIds); 
  },[itemIds])
   //handle item info when item is selected in the dropdown
  const handleChange = (index, value,e) =>{
  let ItemId 
  const updatedData = [...itemIds];
  if(e.target.name ==="EndingInventoryDate"){
      setEndingInventoryDate(value);
  } 
  if(e.target.type === "text" && e.target.name === "ItemName"){
    ItemId = itemInfo[itemInfo.length].index; // set value to the length of the item list to represent the new item 
    value = e.target.value
    console.log("New Item Id: ",  e.target.type, ItemId);
    //alert("New Item: " + value);
  }else if(e.target.type === "select-one"){
    ItemId = value;
    value = item.find(i => i.ItemsID == ItemId)?.ItemName || ""; // get item name based on the selected item id from the dropdown
    console.log("Selected Item Id: ",  e.target.type, ItemId , value);
  }else{
    ItemId = itemIds[index]; // if not changing item name, use the existing item id to get the item info and calculate quantity and total
  }

  if(e.target.name === "ItemName"){
    updatedData[index] = Number(ItemId);
  }
  console.log(updatedData);
  handleItemInfo(e.target.name, ItemId, index, value);
  setItemIds(updatedData);
 }
  //get item info when item is selected in the dropdown
 const handleItemInfo = async ( name,itemId, index,value) => {
   // if item is new, set isNewItem to true to show input fields for new item details
   //alert(`Handle Item Info: \n Name: ${name} \n ItemId: ${itemId} \n Index: ${index} \n Value: ${value}`);
   if(itemId === "new"){
    setNewItem(prev => {
      const updated = [...prev];
      updated[index] = {
        isNew: true, 
      };
      return updated;
    });
    return;
   }
  //  alert("Selected Item Id: " + itemId);
   const info = getItemInfo(Number(itemId), props.item); 
   console.log("Info: ",info )
   const updatedItemInfo = [...itemInfo];
   console.log("Updated Item Info before update: ", updatedItemInfo, "Index: ", index);
   updatedItemInfo[Number(index)] = { ...updatedItemInfo[Number(index)],
     ItemRequiredBalance: info.requiredBalance ||0,
     ItemUnitPrice: info.unitPrice || 0, 
     EndingInventory:0,
     ItemQuantity:0, 
     ItemTotal:0,
     ItemId: Number(itemId) || 0,
    }
   // console.log("updated item info:", updatedItemInfo );

  await new Promise(resolve => setTimeout(resolve, 100)); // wait for state to update
  await handleChangeInfo( name, index, value, updatedItemInfo); // calculate quantity and total based on required balance
}

const handleChangeInfo = async ( name,index, value, updated) => {
  console.log(`Index: ${index} \n Name: ${name} \n Value: ${value}`);
  console.log("Updated Item Info before calculation: ", updated[index]);
  const current = updated[index] || {};
  const requiredBalance = name === "ItemRequiredBalance" ? Number(value) : current.ItemRequiredBalance || 0;
  //console.log("Updated Item Info before calculation: ", current);
  const endingInventory = name === "EndingInventory" ? Number(value) : current.EndingInventory || current.ItemRequiredBalance || 0;
 //alert('Ending Inventory: ' + endingInventory);
  const quantity = calculateQuantity(requiredBalance, endingInventory);
  const unitPrice = current.ItemUnitPrice && name === "UnitPrice" ? Number(value) : current.ItemUnitPrice || 0;
  const total = quantity * unitPrice;
  updated[index] = {
    ...current,
    [name]:  name === "ItemName" ? value : Number(value),
    ItemQuantity: quantity,
    ItemTotal: total,
    ItemUnitPrice: unitPrice, 
    EndingInventory : endingInventory || 0
  }
  //console.log(`Current Item Info: ${JSON.stringify(itemInfo[index])}`);
  console.log('updated', updated); 
  console.log(`Item Quantity:  ${updated[index].ItemQuantity}\n Item  Price: ${updated[index].ItemUnitPrice} \n Item Total: ${updated[index].ItemUnitPrice * updated[index].ItemQuantity}\n another total : ${updated[index].ItemTotal}`);
  setItemInfo(updated);
 }
useEffect(() => {
  console.log(itemInfo); 
  console.log(itemIds);
}, [itemInfo])
  setData

useEffect(() => {
  //update data remove item alread selected
  console.log("Updating data", item);
}, [item])
  return (
    <div>
       <table className="border border-gray-300 w-full">
                <thead  className="bg-black text-white border-3 border-darkRed sticky top-0 z-10"> 
                  <tr> 
                    {props.tableHeader.map((header, index) => (
                      <th key={index} className='border-b border-gray-300 text-left px-4 py-2 text-sm font-bold'>
                        {header}
                         {
                           header === "ENDING INVENTORY" && (
                           <div className='w-auto pr-10'>   <input className="bg-gray-300 text-red-500 w-full" name='EndingInventoryDate' onChange={(e)=> handleChange(index, e.target.value, e)} type = 'date' defaultValue = {
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
                                NewItem[index]?.isNew?(
                                  <div className='flex flex-row gap-2'>
                                    <input type="text" className='border border-gray-300 bg-gray-200 text-black flex-1'  placeholder="Item Name" 
                                    onChange ={(e) => handleChange(index, e.target.value, e)} name="ItemName"
                                    />
                                     {/* button back to select item */} 
                                     <button className='p-1 px-2 bg-[#FF8C8C] md:text-sm text-white font-bold  border border-darkRed' onClick={() => setNewItem(prev => {
                                       const updated = [...prev];
                                       updated[index] = {isNew: false};
                                       return updated;
                                     })}>
                                       Select
                                     </button>
                                  </div>
                                ):
                              <select name="ItemName" id="" 
                              className='px-2 py-1 border border-darkRed w-full text-white bg-[#FF8C8C] font-bold' 
                              value={itemIds[index] || ""}
                              onChange={(e) => {
                                handleChange(index, e.target.value, e);
                              }}>
                                <option value="">Select an item</option>
                              {props.item?.filter(dataItem => {
                             // allow current selected item in this row
                                  return !itemIds.includes(dataItem.ItemsID) || itemIds[index] === dataItem.ItemsID;
                              })
                               .map((dataItem, i) => (
                                <option key={i} value={dataItem.ItemsID}>
                                 {dataItem.ItemName}
                                </option>
                               ))} 
                                  <option value="new">+ Add new item</option>
                              </select>
                               }

                              </td>
                              <td className='px-4 py-2'>
                                { NewItem[index]?.isNew?(
                                  <div className='flex flex-row gap-2'>
                                    <input type="number" name='ItemRequiredBalance' className='border border-gray-300 bg-gray-200 text-black'
                                     onChange={(e)=> handleChange(index, e.target.value, e)}
                                    />
                                     {/* button back to select item */} 
                                  </div>
                                ):( getItemInfo(Number(itemIds[index]), props.item)?.requiredBalance || 0 )}
                                 {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item.RequiredBalance} readOnly= {true} /> */}
                              </td>
                              <td className='px-4 py-2'>
                                 <input className="bg-gray-200 min-w-30 border border-gray-300 outline-1 outline-gray-200" name='EndingInventory' type="number"
                                 value={ itemInfo[index]?.EndingInventory || 0} 
                                 onChange={(e) => handleChange(index, e.target.value,e)}
                                 min={0}
                                 max={itemInfo[index]?.ItemRequiredBalance || 0}
                                 />
                              </td>
                              <td className='px-4 py-2'>
                                 <h5>{itemInfo[index]?.ItemQuantity || 0}</h5>
                              </td>
                              <td className='px-4 py-2' name="Unit">
                                { NewItem[index]?.isNew?(
                                 <select name="item" id="" 
                                     className='px-2 py-1 border border-darkRed w-full text-white bg-[#FF8C8C] font-bold' 
                                     value={itemIds[index] || ""}
                                     onChange={(e) => {
                                     handleChange(index, e.target.value, e);
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
                                 handleChange(index, e.target.value,e)
                                 }} readOnly= {false} />
                              </td>
                              <td className='px-4 py-2 '>
                                 <h4 className="px-2 py-1 w-full my-1 bg-darkRed text-white" >{formatMoney(itemInfo[index]?.ItemTotal || 0, 'PHP', 'en-PH')}</h4>    
                              </td> 
                         </tr>             
                      ))}
                    </tbody>
                </table>
                 <div className ='mt-5 flex relative flex-row place-content-end mb-5 w-auto'>
                    <div className='grid-cols-[auto_auto_auto] place-content-end'>
                        <div className='w-auto h-auto bg-darkRed p-2 text-lg font-bold text-white'>
                            <h4>Total: {formatMoney(itemInfo.reduce((sum, item) => sum + (item.ItemTotal || 0), 0), 'PHP', 'en-PH')}</h4>
                        </div>
                    </div>
                 </div>
          </div>
      )
  })

export default PurchaseSubmitTable