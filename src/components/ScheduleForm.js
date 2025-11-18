import React, { useState, useEffect } from "react";
import "../styles/schedule.css";

const ScheduleForm = ({ editMode = false, editData = null, onClose }) => {
  const [id, setId] = useState("")
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Prefill data when editing
  useEffect(() => {
    if (editMode && editData) {
      setId(editData.id)
      setTitle(editData.title);
      setMessage(editData.message);
      setDate(editData.date);
      setTime(editData.time);
      setPreview(editData.image || null);
    }
  }, [editMode, editData]);

  const generateUniqueCode = () => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000000);
    return `TYPE-${timestamp}-${randomPart}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ----------------------------------------------------------
  // CREATE or UPDATE NOTIFICATION
  // ----------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", id)
    formData.append("title", title);
    formData.append("message", message);
    formData.append("type", "general");
    formData.append("detailed_content", "empty");
    formData.append("date", date);
    formData.append("time", `${time}:00`);
    formData.append("Status", 1);

    if (!editMode) {
      console.log(formData);


      if (imageFile) formData.append("image", imageFile);

      try {
        const res = await fetch(
          "https://users.mpdatahub.com/api/notification/date-time",
          { method: "POST", body: formData }
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          alert("Notification created!");
          onClose && onClose();
        } else {
          alert("Failed to create notification.");
        }
      } catch {
        alert("Server error.");
      }
    } else {
      // UPDATE
      if (imageFile) formData.append("image", imageFile);

      try {
        const res = await fetch(
          `https://users.mpdatahub.com/update-notification/${editData.id}`,
          { method: "POST", body: formData }
        );

        const text = await res.text();
        const result = JSON.parse(text);

        if (result.success) {
          alert("Notification updated!");
          onClose && onClose();
        } else {
          alert("Failed to update");
        }
      } catch {
        alert("Server error");
      }
    }
  };

  return (
    <div className="schedule-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Upload Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="btn">
          {editMode ? "Update Notification" : "Create Notification"}
        </button>

        {editMode && (
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        )}
      </form>
    </div>
  );
};

export default ScheduleForm;
