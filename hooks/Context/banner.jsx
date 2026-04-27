"use client";

import { createContext, useContext, useState } from "react";

const BannerContext = createContext(null);

export function BannerProvider({ children }) {
  const [banner, setBanner] = useState(null);

  const showSuccess = (message) => {
    setBanner({ type: "success", message });
    setTimeout(() => setBanner(null), 3000);
  };

  const showError = (message) => {
    setBanner({ type: "error", message });
    setTimeout(() => setBanner(null), 3000);
  };

  return (
    <BannerContext.Provider value={{ showSuccess, showError }}>
      {children}

      {/* GLOBAL BANNER UI */}
      {banner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white transition-all
          ${banner.type === "success" ? "bg-blue-500" : "bg-red-500"}`}
        >
          <div className="flex items-center gap-3">
            <span>{banner.type === "success" ? "✔️" : "❌"}</span>
            <p>{banner.message}</p>
            <button
              onClick={() => setBanner(null)}
              className="ml-4 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error("useBanner must be used inside BannerProvider");
  }
  return context;
}