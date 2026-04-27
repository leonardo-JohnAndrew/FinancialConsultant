'use client '
import React, { use, useEffect , useState} from 'react'
import { formatMoney } from '@/functions/formatCurrency';
import { getItemInfo , calculateQuantity  } from '@/functions/purchase';
import { getTotal } from '@/functions/purchase';
import AutoSuggestInput from '../modals/autosuggested';
import useUserContext from '@/hooks/Context/UserContext';
import axios from 'axios';
import { userInfo } from 'os';
import { data } from 'autoprefixer';
import usePurchaseContext from '@/hooks/Context/purchaseContext';
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
    {isNew : true}
  ]);
  const {user} = useUserContext();
  const [listItem , setListItem] = useState([])
  const [unit ,setUnit] = useState([])
  const { purchase, updatePurchase} = usePurchaseContext();  
  if(!user){
    return <div className="p-4 text-white">Loading...</div>;
  }
 
  useEffect(()=>{
      if(!item || item.length === 0) return;
       let array = []; 
      item.map((i )=> { 
        array.push(i.ItemName)
      })
      setListItem(array); 
  },[item])

  useEffect(()=>{
    const fetchUnit = async()=>{ 
      let array = []; 
       const res = await axios.get("/api/purchase/items/suggested"); 
       // console.log(res)
        if(res.status === 200 ){ 
          res?.data?.Unit?.map((u) => { 
              array.push(u.Unit)
          })
        }
        setUnit(array);
     }
     fetchUnit(); 
  },[])
 
  const handleChange = (index, field, value) => {
  if (field === "ItemName") {
   //  console.log(item)
    const selectedItem = item.find(
      (i) =>
        i.ItemName.trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (selectedItem) {
      setItemInfo((prev) => {
        const update = [...prev];

        update[index] = {
          ...update[index],
          ItemName: selectedItem.ItemName,
          Unit: selectedItem.Unit,
          UnitPrice: selectedItem.UnitPrice,
        };

        return update;
      
      });

      return;
    }
  }

  setItemInfo((prev) => {
    const update = [...prev];

    if (!update[index]) {
      update[index] = {};
    }

    update[index][field] = value;

    return update;
  });
};
  return (
    <>
     
    <div className='max-h-125 scrollbar-custom overflow-y-auto'>
       <table className="border border-gray-300 w-full ">
                <thead  className="bg-black text-white border-3 border-darkRed sticky top-0 z-10"> 
                  <tr> 
                    {props.tableHeader.map((header, index) => (
                      <th key={index} className='border-b border-gray-300 text-left px-4 py-2 text-sm font-bold print:text-black '>
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
                                <AutoSuggestInput
                              item={listItem}
                              index={index}
                              onChange={handleChange}
                              name="ItemName"
                              value={itemInfo[index]?.ItemName || ""} //add this
                              />
                              </td>
                              { 
                               user.role === "Admin" && (
                               <div>
                              <td className='px-4 py-2'>
                                { NewItem[index]?.isNew?(
                                  <div className='flex flex-row gap-2'>
                                    <input type="number" name='ItemRequiredBalance' className='border border-gray-300 bg-gray-200 text-black 
                                    print:border-0 print:outline-none print:bg-transparent'
                                    onChange={{}}
                                    />
                                     {/* button back to select item */} 
                                  </div>
                                ):( 0 )}
                                 {/* <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200"  type="text" defaultValue={item.RequiredBalance} readOnly= {true} /> */}
                              </td>
                              <td className='px-4 py-2'>
                                 <input className="bg-gray-200 min-w-30 border border-gray-300 outline-1 outline-gray-200
                                 print:border-0 print:outline-none print:bg-transparent" name='EndingInventory' type="number"
                                 value={ itemInfo[index]?.EndingInventory || 0} 
                                 onChange={{}}
                                 min={0}
                                 max={itemInfo[index]?.ItemRequiredBalance || 0}
                                 />
                              </td>
                                 </div>
                               )
                              }
                              <td className='px-4 py-2'>
                                 <h5>{itemInfo[index]?.ItemQuantity || 0}</h5>
                              </td>
                              <td className='px-4 py-2' name="Unit">
                                 <input type="text" className="bg-gray-200 min-w-30 border border-gray-300 outline-1 outline-gray-200
                                 print:border-0 print:outline-none print:bg-transparent" 
                                 onChange={(e) => {handleChange(index, "Unit",e.target.value)}} 
                                 value={itemInfo[index]?.Unit || ""}/>
                              </td>
                              <td className='px-4 py-2'>
                                 <input className="bg-gray-200 border border-gray-300 outline-1 outline-gray-200 
                                 print:border-0 print:outline-none print:bg-transparent"
                                  type="number" 
                                  name="UnitPrice" 
                                  readOnly= {false} 
                                  onChange={(e)=> {handleChange(index, "UnitPrice", e.target.value)}}
                                  value={itemInfo[index]?.UnitPrice||0}
                                  />       
                                                      </td>
                              <td className='px-4 py-2 '>
                                 <h4 className="px-2 py-1 w-full my-1 bg-darkRed text-white" >{formatMoney(itemInfo[index]?.ItemTotal || 0, 'PHP', 'en-PH')}</h4>    
                              </td> 
                         </tr>             
                      ))}
                    </tbody>
                </table>
          </div>
    
          </>
      )
  })

export default PurchaseSubmitTable