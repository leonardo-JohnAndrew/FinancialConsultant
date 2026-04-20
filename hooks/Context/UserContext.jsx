"use client"
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext({ 
   user : {},  
   updateUser: () => {} , 
   getUser:() => {}
}); 

//2 Create the context Provider 
export function UserContextProvider({children}){ 
 const [user , setUser]  = useState({
    userID : "", 
    role: "", 
 })
  const getUser = () => { 
    return user
  }
 // update user 
  const updateUser = (UserInfo) =>{ 
    setUser((prev) =>({
        ...prev, 
        ...UserInfo
    }))

  }
  const contextValue = { 
    user, 
    getUser, 
    updateUser
  }

  return( 
    <UserContext.Provider
     value = {contextValue}>
    {children}
    </UserContext.Provider>
  ); 
}
  export default function useUserContext(){ 
    return useContext(UserContext); 
  }