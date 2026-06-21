"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";

const typeColors = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

const typeIcons = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // for modal
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllRead } =
    useNotifications(30000);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (notif) => {
    if (!notif.isRead) await markAsRead(notif.id);
    setSelected(notif); // open modal instead of routing immediately
    setOpen(false);
  };

  const handleModalAction = () => {
    if (selected?.link) {
      setSelected(null);
      router.push(selected.link);
    } else {
      setSelected(null);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-full hover:bg-red-700 transition"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 
                 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 
                 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 
                 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="fixed left-56 top-40 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {loading ?
                <div className="p-6 text-center text-gray-400 text-sm">
                  Loading...
                </div>
              : notifications.length === 0 ?
                <div className="p-6 text-center text-gray-400 text-sm">
                  No notifications
                </div>
              : notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-50
                      ${!notif.isRead ? "bg-blue-50" : ""}`}
                  >
                    <span className="text-lg mt-0.5">
                      {typeIcons[notif.type] || "ℹ️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)} // close on backdrop click
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {typeIcons[selected.type] || "ℹ️"}
                </span>
                <h2 className="text-base font-semibold text-gray-800">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Type Badge */}
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${typeColors[selected.type] || typeColors.info}`}
            >
              {selected.type?.toUpperCase() || "INFO"}
            </span>

            {/* Full Message */}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
              {selected.message}
            </p>

            {/* Timestamp */}
            <p className="text-xs text-gray-400 mb-4">
              {formatTime(selected.createdAt)}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              {selected.link && (
                <button
                  onClick={handleModalAction}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  View Details →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
