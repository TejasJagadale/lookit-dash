import React, { useEffect, useState } from "react";
import "../styles/notifications.css";
import ScheduleForm from "./ScheduleForm";
import animationData from "../animation/lottie.json";
import Lottie from "lottie-react";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  // State for editing modal
  const [editingData, setEditingData] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("https://users.mpdatahub.com/api/notifications/list");
      const data = await res.json();
      console.log(data);

      setNotifications(data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // -------------------------------
  // Toggle Active / Inactive
  // -------------------------------
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      const res = await fetch(
        `https://users.mpdatahub.com/api/notification/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Status: newStatus }),
        }
      );

      if (res.ok) {
        alert(`Status updated!`);
        fetchNotifications();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  // DELETE NOTIFICATION
  // -------------------------------
  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      const res = await fetch(
        `https://users.mpdatahub.com/deletenotification/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        alert("Notification deleted!");
        fetchNotifications();
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  return (
    <div className="notification-container">
      <h2>All Notifications</h2>

      {/* ---------------------------- */}
      {/* EDIT MODAL (ScheduleForm Reused) */}
      {/* ---------------------------- */}
      {/* ✨ Modern Modal (Smooth Animation + Blur) */}
      {editingData && (
        <div className="modal-overlay">
          <div className="modal-box modal-animate">
            <button className="modal-close-btn" onClick={() => setEditingData(null)}>
              ✕
            </button>

            <h3 className="modal-title">Edit Notification</h3>

            <div className="modal-body">
              <ScheduleForm
                editMode={true}
                editData={editingData}
                onClose={() => {
                  setEditingData(null);
                  fetchNotifications();
                }}
              />
            </div>
          </div>
        </div>
      )}


      {loading ? (
        <div className="dashboard-loadingdash">
          <Lottie className="dashboard-loadingdash" animationData={animationData} loop={true} />
        </div>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((item) => (
            <li key={item.type_id} className="notification-card">
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <p><b>Date:</b> {item.date}</p>
              <p><b>Time:</b> {item.time}</p>

              <p>
                <b>Status:</b>{" "}
                <span className={item.Status === 1 ? "status-active" : "status-inactive"}>
                  {item.Status === 1 ? "Active" : "Inactive"}
                </span>
              </p>

              {/* Toggle Button */}
              <button
                className={`status-btn ${item.Status === 1 ? "deactivate" : "activate"}`}
                onClick={() => toggleStatus(item.id, item.Status)}
              >
                {item.Status === 1 ? "Deactivate" : "Activate"}
              </button>

              {/* EDIT BUTTON */}
              <button
                className="delete-btn"
                onClick={() => setEditingData(item)}
              >
                Edit
              </button>

              {/* DELETE BUTTON */}
              <button
                className="delete-btn"
                onClick={() => deleteNotification(item.id)}
              >
                Delete
              </button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
