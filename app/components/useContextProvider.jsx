'use client' 
import { createContext, useState , useContext } from "react";
export const UserContext = createContext({
    user: {},
    updateUser: () => {}
})

export const UserProvider = ({children}) => {
    const [user, setUser] = useState({
        role: "Admin"
    }); 
   
    const updateUser = (newUser) => {
        setUser(newUser);
    }
    const contextValue = {
        user,
        updateUser
    } 
    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )

}

export default function useUserContext() {
    return useContext(UserContext);
}

