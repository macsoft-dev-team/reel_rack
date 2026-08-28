import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle } from "lucide-react";
import TitleHead from "./layout/TitleHead";

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
      return <AlertTriangle className="text-yellow-500" />;
    }
    if (type === "success") {
      return <CheckCircle className="text-green-500" />;
    }
    return <Bell className="text-blue-500" />;
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <TitleHead title="Notifications" />
      </div>

      {/* NOTIFICATION CARD */}
      <div className="bg-white rounded-xl shadow p-6 max-w-4xl">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((note) => (
              <div
                key={note.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition
                  ${note.read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50 border-blue-300"
                  }`}
              >
                {/* ICON */}
                <div className="mt-1">{getIcon(note.type)}</div>

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{note.message}</p>
                  <span className="text-sm text-slate-500">{note.time}</span>
                </div>

                {/* ACTION */}
                {!note.read && (
                  <button
                    onClick={() => markAsRead(note.id)}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
}
