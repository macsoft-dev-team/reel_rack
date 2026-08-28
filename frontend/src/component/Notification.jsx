import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle } from "lucide-react";

export default function Notification() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      message: "Rack RACK-02 created successfully",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      message: "Low stock for RES_10K_0402 in RB-03",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "success",
      message: "Reel issued from RB-05",
      time: "1 hour ago",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const getIcon = (type) => {
    if (type === "warning") {
      return <AlertTriangle className="text-amber-500" size={18} />;
    }
    if (type === "success") {
      return <CheckCircle className="text-emerald-500" size={18} />;
    }
    return <Bell className="text-blue-600" size={18} />;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((note) => (
              <div
                key={note.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 ${
                  note.read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/50 border-blue-200 shadow-2xs"
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
                  {getIcon(note.type)}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{note.message}</p>
                  <span className="text-xs text-slate-500 mt-0.5 block">{note.time}</span>
                </div>

                {!note.read && (
                  <button
                    onClick={() => markAsRead(note.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
