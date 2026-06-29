"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext({
  user: null,
  updateUser: () => {},
  fetchUser: () => {},
});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/cookies");

      if (res.status === 200) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default function useUserContext() {
  return useContext(UserContext);
}
