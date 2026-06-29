"use client";
import Menus from "@/functions/menus";
import useUserContext from "@/hooks/Context/UserContext";
import axios from "axios";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import NotificationBell from "../components/NotificationBell";

export default function Sidebar() {
  const [openPurchase, setOpenPurchase] = useState(false);
  const { user, fetchUser } = useUserContext();
  const router = useRouter();
  const [name, setName] = useState();
  const pathname = usePathname(); // get current path
  const menu = user ? Menus(user.role).filter((i) => i.section === "menu") : [];
  const others = user
    ? Menus(user.role).filter((i) => i.section === "others")
    : [];
  const logout = user
    ? Menus(user.role).filter((i) => i.section === "footer")
    : [];

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogOut = async () => {
    // api call logout
    const rs = await axios.post("/api/logout");
    if (rs.status == 200) {
      router.push("/PR");
    }
  };
  if (!user) {
    return <aside className="p-4 text-white">Loading...</aside>;
  } else {
    console.log(user);
  }
  return (
    <aside className="min-w-54 min-h-270 relative  bg-darkRed text-white flex flex-col p-4 print:hidden">
      {/* profile picture and then name */}
      <div className="mt-7 flex flex-col justify-center items-center">
        <img
          src={
            user?.profile ||
            `https://ui-avatars.com/api/?name=${user?.name}&background=dc2626&color=fff`
          }
          // src={"/profile/Geb"}
          // alt="profile"
          className="w-20 h-20 mt-2 mb-3 rounded-full object-cover border-2 border-white/30"
        />
        <h2 className="text-red-100 text-sm">{user?.name}</h2>
        <NotificationBell />
      </div>
      {/* content side bar  */}
      {/* Main Menu */}
      <h3 className="text-red-100 text-sm ml-2 mt-5 opacity-70">Main menu</h3>
      <nav className="flex flex-col gap-2 ">
        {menu?.map((item, index) => {
          // MENU WITH SUBMENU
          if (item.hasDropdown) {
            return (
              <div key={index}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`text-left w-full p-2 rounded flex justify-between items-center hover:bg-red-300 ${
                    item.subItem?.some((sub) => pathname.startsWith(sub.path))
                      ? "bg-white text-black font-semibold hover:bg-white"
                      : ""
                  }`}
                >
                  <span>{item.label}</span>

                  <span>
                    {openMenus[item.label] ? (
                      <FiChevronUp size={21} />
                    ) : (
                      <FiChevronDown size={21} />
                    )}
                  </span>
                </button>

                {openMenus[item.label] && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {item.subItem?.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.path}
                        className={`p-2 rounded hover:bg-red-300 ${
                          pathname.startsWith(sub.path)
                            ? "bg-white text-black font-semibold hover:bg-white"
                            : ""
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // NORMAL MENU
          return (
            <Link
              key={index}
              href={item.path}
              className={`p-2 rounded hover:bg-red-300 ${
                pathname.startsWith(item.path)
                  ? "bg-white text-black font-semibold hover:bg-white"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        {/* others */}

        <h3 className="text-red-100 text-sm ml-2 mt-5 opacity-70">
          {others.length === 0 ? "" : others.length > 1 ? "Others" : "Other"}
        </h3>
        <div className=" flex flex-col gap-2">
          {others?.map((item, index) => (
            <Link
              key={index}
              href={`${item.path}`}
              className={`hover:bg-red-300 p-2 rounded ${pathname === item.path ? "bg-white text-black font-semibold hover:bg-white" : ""} `}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className=" absolute bottom-2 p-2 w-full">
          <button
            className="hover:font-semibold"
            onClick={() => handleLogOut()}
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
