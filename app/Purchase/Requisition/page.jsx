'use client' 
import axios from 'axios';
import React, { use, useEffect, useState } from 'react'
import {calculateQuantity, getItemInfo , } from "@/functions/purchase"
const CreateRequisition = () => {
  const [data, setData] =  useState([]); 
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

   const handleClick = async(e) => { 
    fetch = await getItemInfo(2, data); 
   setItemInfo({ 
    ItemRequiredBalance: fetch.requiredBalance, 
    ItemUnitPrice: fetch.unitPrice
   })
   }
   const handleQuantity = (e) => { 
    console.log(calculateQuantity(itemInfo.ItemRequiredBalance, 15)); 
    
   }
  return (
   <> 
      <div>
        <h5>
          
        </h5>
      </div>
   <div> 
       <button onClick={handleClick}>Fetch Item Info</button>
       <button onClick={handleQuantity}>Get Quantity</button>
   </div>
   </>
  )
}

export default CreateRequisition