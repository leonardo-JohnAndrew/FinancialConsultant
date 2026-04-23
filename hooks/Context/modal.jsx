"use client"
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const ModalContext = createContext({ 
   modal : {},  
   updateModal: () => {} , 
  
}); 

//2 Create the context Provider 
export function ModalContextProvider({children}){ 
     const [modal, setModal] = useState(false);
     const updateModal = () => {
        setModal(!modal)
     }

  return (
    <ModalContext.Provider value={{ modal, updateModal }}>
      {children}
    </ModalContext.Provider>
  );
}
  export default function useModalContext(){ 
    return useContext(ModalContext); 
  }