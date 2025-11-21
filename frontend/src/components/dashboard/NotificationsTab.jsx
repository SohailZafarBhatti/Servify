import React from "react";

const NotificationsTab = ({ notifications }) => {
  if (!notifications.length) return <p>No notifications.</p>;

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li
          key={n._id}
          className={`p-3 rounded ${
            n.read ? "bg-gray-100" : "bg-blue-50"
          } shadow`}
        >
          <p>{n.message}</p>
          <small className="text-gray-400">
            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
          </small>
        </li>
      ))}
    </ul>
  );
};

export default NotificationsTab;
