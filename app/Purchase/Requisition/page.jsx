'use client' 
import axios from 'axios';
import React, { use, useCallback, useEffect, useState } from 'react'
import {calculateQuantity, getItemInfo , } from "@/functions/purchase"
import PurchaseSubmitTable from '@/app/components/Tables/purchase-submit-table';
import { formatDates } from '@/functions/formattDate';
import { FiMinus , FiPlus } from 'react-icons/fi';
const CreateRequisition = () => {
  const [data, setData] =  useState([]); 
  const [row , setRow] = useState([]); 
  const [itemIds, setItemIds] = useState([]);
  //const [totalRow, setTotalRow] = useState(0);
  const [itemInfo, setItemInfo] = useState([{
    EndingInventory:0, 
    ItemRequiredBalance:0, 
    ItemUnitPrice:0, 
    ItemQuantity:0, 
    EndingInventoryDate: null 
  }]);
  const [endindInventoryDate, setEndingInventoryDate] = useState(null);
  let fetch ; 

  const fetchData = async () =>{ 
     try{ 
       const response = await axios.get('/api/purchase/items');
       setData(response.data.items); 
       //  console.log(response.data);
     }catch(error){ 
       console.error("Error fetching data:", error); 
     }
  }
  useEffect(() => {
    //  alert('fetch')
    fetchData(); 
    // console.log(data); 
  },[])

  // useEffect(() => { 
  //   console.log(itemInfo); 
  // },[itemInfo])



   const handleSubmitInfo = useCallback(async () => { 
     // map through itemInfo to add ending inventory date
     if(itemInfo.length === 0) return ;     
     // alert(`row length: ${row.length}, itemInfo length: ${itemInfo.length}`);
     if(itemInfo.length > row.length) {      
       // remove extra itemInfo if it exceeds the number of rows 
       setItemInfo(prev => prev.slice(0, row.length));
       setItemIds(prev => prev.slice(0, row.length));
      }
      console.log("Submitting purchase requisition with item info:", itemInfo);
      console.log("Ending Inventory Date:", endindInventoryDate);
     
      resetTable();

      return; 
    const itemInfoWithDate = itemInfo.map(item => ({
      ...item,
      EndingInventoryDate: endindInventoryDate
    }));
    //
    try{ 
      const response = await axios.post('/api/purchase', { purchaseItem: itemInfoWithDate });
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting purchase requisition:", error);
    }
   }, [itemInfo])



   const handleQuantity = (e) => { 
    console.log(calculateQuantity(itemInfo.ItemRequiredBalance, 15)); 
   }

   const addTableRow = (added = 1) => {
    // adding multiple rows based on the input value
      for(let i = 0; i < added; i++){
        setRow(prevData => [...prevData, {id: prevData.length + 1, ItemName: "New Item", RequiredBalance: 0, EndingInventory: 0, Quantity: 0, Unit: "pcs", UnitPrice: 0}]);
      }  
     //setData([...data, {id: data.length + 1, ItemName: "New Item", RequiredBalance: 0, EndingInventory: 0, Quantity: 0, Unit: "pcs", UnitPrice: 0}])
   } 
       // console.log("Row changed:", value); 
       // setRow(prevData => prevData.map(row => row.id === value.id ? {...row, ...value} : row)); 
    const handleRowChange = (value) => {
      alert(`Value changed: ${value}`);
      if (value === row.length) return;

      if (value > row.length) {   
    addTableRow(value - row.length);
     } else {
    // remove rows if value is smaller
        setRow(prev => prev.slice(0, value));
        // setData(prev => prev.slice(0, value));
        // setItemInfo(prev => prev.slice(0, value));
        // setItemIds(prev => prev.slice(0, value));
  }
};
    

 const handleDeleteRow = () => {  
    setRow(prevData => prevData.filter((_, i) => i !== row.length - 1));
  //setData(prevData => prevData.filter((_, i) => i !== row.length - 1));
    setItemInfo(prevData => prevData.filter((_, i) => i !== row.length - 1));
    setItemIds(prevData => prevData.filter((_, i) => i !== row.length - 1));
     // setRow(prevData => prevData.filter((_, i) => i !== index));// through index to delete specific row
     // setData(prevData => prevData.filter((_, i) => i !== index));
     // setItemInfo(prevData => prevData.filter((_, i) => i !== index));
     // setItemIds(prevData => prevData.filter((_, i) => i !== index));
     // console.log("Deleted row at index:", index);
     // console.log("Updated data after deletion:", data);
     // console.log("Updated itemInfo after deletion:", itemInfo);
     // console.log("Updated itemIds after deletion:", itemIds);
    // setData(prevData => prevData.filter((_, i) => i !== index));
  }
   useEffect(() => { 
      addTableRow(5);
   },[])

   const resetTable = () => { 
    setRow([]);
    setItemInfo([]);
    setItemIds([]);
    addTableRow(5)
   }
  return (
   <> 
      <div className="flex relative mb-5 w-auto">
        <div className="w-1/2 flex flex-row gap-2">
        {/* {formatMoney(parseFloat(total), 'PHP', 'en-PH')} */}
          <h5 className="text-xl font-bold">Requestor Department:</h5> <h5 className = 'display-inline text-red-950 text-xl font-extrabold'></h5>
        </div>
        <div className="w-1/2 flex flex-row gap-2 place-content-end">
          {/* <h5 className= 'place-self-end font-bold text-xl'>Requisition Date:</h5><h5 className = 'display-inline text-red-950 text-xl font-extrabold'></h5> */}
        </div>
    </div>
      <div className = "grid grid-row-3 mb-5">  
      <hr className = 'border-t border-gray-300'/>
      <div className = 'flex text-xl '> 
      <h5 className ='display-inline text-black-500 font-bold text-xl p-5 px-0'> Requisition Date: {formatDates(new Date())}</h5> 
      <h5 className ='display-inline text-red-700 font-bold p-5'> </h5>
      </div> 
      <hr className = 'border-t border-gray-300'/>
      </div>     
       {/* <button onClick={handleClick}>Fetch Item Info</button> */}
       <div className='flex relative flex-row place-content-end mb-5 w-auto'>
          <div className='grid-cols-[auto_auto_auto] place-content-end flex flex-row '> 
      
      <button className="text-white outline outline-darkRed font-bold rounded-tl-lg rounded-bl-lg bg-black pl-2 py-1 w-10 hover:bg-gray-300 hover:text-black text-sm flex flex-row" onClick={()=>handleDeleteRow()}><FiMinus size={20}/></button>
          <input type="Number" className='bg-gray-100 border border-gray-300 outline outline-gray-400 w-20 mx-1 text-center' 
          value={row.length || 0} onChange={(e)=>handleRowChange(parseInt(e.target.value) || 0)} />
        <button className='bg-darkRed text-white pl-2 py-1 w-10 text-sm outline outline-darkRed rounded-tr-lg rounded-br-lg  hover:bg-btnRed hover:text-black flex flex-row ' onClick={(e) => addTableRow(1)}><FiPlus size={20}/></button>
           </div> 
       </div>
     <div className="h-125 scrollbar-custom overflow-y-auto">      
       <PurchaseSubmitTable 
       data={row} 
       item={data} 
       tableHeader={["NO", "ITEM DESCRIPTION", "REQUIRED BALANCE", "ENDING INVENTORY", "QUANTITY","UNIT" , "UNIT PRICE", "TOTAL"]}    
       setData={setData}
       setItemInfo={setItemInfo}
       itemInfo={itemInfo}
       setItemIds={setItemIds}
       itemIds={itemIds}
       setEndingInventoryDate={setEndingInventoryDate}
       />
       </div>
        {/* buttons submit */}
       {/* 
       Design 
        
       Table 
              
              submit button               
       */}
          <div className='mt-10 flex relative flex-row place-content-end mb-5 w-auto'>
          <div className='grid-cols-[auto_auto_auto] place-content-end'>  
        <button className='bg-darkRed text-white py-1 w-30 text-lg outline outline-darkRed rounded-lg hover:bg-btnRed hover:text-black'  onClick={(e) => handleSubmitInfo()}>Submit</button>
           </div> 
       </div>
   </>
  )
}

export default CreateRequisition