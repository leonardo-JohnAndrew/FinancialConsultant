'use client' 
import axios from 'axios';
import React, { use, useCallback, useEffect, useState } from 'react'
import {calculateQuantity, getItemInfo , } from "@/functions/purchase"
import PurchaseSubmitTable from '@/app/components/Tables/purchase-submit-table';
const CreateRequisition = () => {
  const [data, setData] =  useState([]); 
  const [row , setRow] = useState([]); 
  const [itemInfo, setItemInfo] = useState({
     ItemRequiredBalance: "", 
     ItemUnitPrice: ""
  });
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

  useEffect(() => { 
    console.log(itemInfo); 
  },[itemInfo])


   const handelItemInfo = useCallback(async (itemId) => { 
    console.log(itemId);
    fetch = await getItemInfo(1, data); 
   setItemInfo({ 
    ItemRequiredBalance: fetch.requiredBalance, 
    ItemUnitPrice: fetch.unitPrice
   })
   }, [itemInfo])



   const handleQuantity = (e) => { 
    console.log(calculateQuantity(itemInfo.ItemRequiredBalance, 15)); 
   }

   const addTableRow = (added = 1) => {
      for(let i = 0; i < added; i++){
          setRow(prevData => [...prevData, {id: prevData.length + 1, ItemName: "New Item", RequiredBalance: 0, EndingInventory: 0, Quantity: 0, Unit: "pcs", UnitPrice: 0}]);
      } 
     //setData([...data, {id: data.length + 1, ItemName: "New Item", RequiredBalance: 0, EndingInventory: 0, Quantity: 0, Unit: "pcs", UnitPrice: 0}])
   }

   useEffect(() => { 
      addTableRow(5);
   },[])

  return (
   <> 
   <div> 
   
       {/* <button onClick={handleClick}>Fetch Item Info</button> */}
       <button onClick={handleQuantity}>Get Quantity</button>
       <PurchaseSubmitTable 
       data={row} 
       item={data} 
       tableHeader={["NO", "ITEM DESCRIPTION", "REQUIRED BALANCE", "ENDING INVENTORY", "QUANTITY","UNIT" , "UNIT PRICE", "TOTAL"]}    
       />
   </div>
   </>
  )
}

export default CreateRequisition