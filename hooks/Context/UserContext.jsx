"use client"
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext({ 
   user : {},  
   updateUser: () => {} , 
   fetchUser: () =>{}
}); 

//2 Create the context Provider 
export function UserContextProvider({children}){ 
     const [user, setUser] = useState(null);
     
       const updateUser = (newUser) => {
         setUser(newUser);
         localStorage.setItem("user", JSON.stringify(newUser));
       };


  const fetchUser = async () => {
    const res = await axios.get("/api/cookies")
    if(res.status === 200){
       //  console.log(res.data); 
        setUser(res.data); 
    }else{
        setUser(null); 
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
  export default function useUserContext(){ 
    return useContext(UserContext); 
  }