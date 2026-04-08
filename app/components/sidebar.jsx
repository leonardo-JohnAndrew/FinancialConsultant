"use client";

import Link from "next/link";
import React, { useCallback, useState } from "react";
import { FiChevronDown , FiChevronUp } from "react-icons/fi";
export default function Sidebar(){
  const [openPurchase, setOpenPurchase] = useState(false);

  return (
    <aside className="min-w-54 bg-darkRed text-white flex flex-col p-4 print:hidden">
      <h1 className="text-xl font-bold mb-6">My App</h1>

      <nav className="flex flex-col gap-2">
        <Link href="/" className="hover:bg-red-400 p-2 rounded">
          Dashboard
        </Link>

        {/* Accordion */}
        <button
          onClick={() => setOpenPurchase(!openPurchase)}
          className="text-left hover:bg-red-400 p-2 rounded flex justify-between"
        >
          Purchase
          <span>{openPurchase ? <FiChevronUp/> : <FiChevronDown/>} </span>
        </button>

        {openPurchase && (
          <div className="ml-4 flex flex-col gap-1">
            <Link href="/Purchase/Requisition" className="hover:bg-red-300 p-2 rounded">
              Requisiton Form
            </Link>
            <Link href="/Purchase" className="hover:bg-red-300 p-2 rounded">
              All Purchase
            </Link>
          </div>
        )}

        <Link href="/Inventory" className="hover:bg-red-400 p-2 rounded">
          Inventory
        </Link>

        <Link href="/Reports" className="hover:bg-red-400 p-2 rounded">
          Reports
        </Link>
      </nav>
    </aside>
  );
}