// app/providers.jsx
"use client";

import { UserContextProvider } from "@/context/UserContext";

export default function Providers({ children }) {
  return <UserContextProvider>{children}</UserContextProvider>;
}