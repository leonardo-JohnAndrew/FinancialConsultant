"use client"
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const PurchaseContext = createContext({ 
   purchase : {},  
   updatePurchase: () => {} , 
  
}); 

//2 Create the context Provider 
export function PurchaseContextProvider({children}){ 
     const [purchase, setPurchase] = useState([]);
     const updatePurchase = (item) => {
         setPurchase(item)
     }

  return (
    <PurchaseContext.Provider value={{ purchase, updatePurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
}
  export default function usePurchaseContext(){ 
    return useContext(PurchaseContext); 
  }