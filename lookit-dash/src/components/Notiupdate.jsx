import React, { useEffect, useState } from "react";
import "../styles/Notiupdate.css";

const API_BASE = "https://tnreaders.in/mobile";

const Notiupdate = () => {
    const [notifications, setNotifications] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        category_name: "",
        title: "",
        description: "",
        status: "1",
    });

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/listNotifications`);
            const data = await res.json();
            setNotifications(data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Handle inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle image file
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        submitData.append("category_name", formData.category_name);
        submitData.append("title", formData.title);
        submitData.append("description", formData.description);
        submitData.append("status", formData.status);
        if (imageFile) submitData.append("image", imageFile);

        const url = editingId
            ? `${API_BASE}/notifications/update/${editingId}`
            : `${API_BASE}/storeNotification`;

        try {
            await fetch(url, {
                method: "POST",
                body: submitData,
            });

            resetForm();
            fetchNotifications();
        } catch (err) {
            console.error("Submit error", err);
        } finally {
            setLoading(false);
        }
    };

    // Reset
    const resetForm = () => {
        setFormData({
            category_name: "",
            title: "",
            description: "",
            status: "1",
        });
        setImageFile(null);
        setPreview(null);
        setEditingId(null);
    };

    // Edit
    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            category_name: item.category_name,
            title: item.title,
            description: item.description,
            status: item.status,
        });
        setPreview(item.image);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Delete notification?")) return;
        await fetch(`${API_BASE}/notifications/delete/${id}`, {
            method: "POST",
        });
        fetchNotifications();
    };

    return (
        <div className="notification-container">
            <h2>{editingId ? "Update Notification" : "Add Notification"}</h2>

            <form className="notification-form" onSubmit={handleSubmit}>
                <input
                    name="category_name"
                    placeholder="Category Name"
                    value={formData.category_name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <input type="file" accept="image/*" onChange={handleImageChange} />

                {preview && (
                    <img src={preview} alt="preview" className="image-preview" />
                )}

                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? "Uploading..." : editingId ? "Update" : "Create"}
                </button>
            </form>

            <div className="notification-list">
                {notifications.map((item) => (
                    <div className="notification-card" key={item.id}>
                        <div className="card-header">
                            <h4>{item.title}</h4>

                            <span
                                className={`status-label ${item.status === "1" || item.status === 1 ? "active" : "inactive"
                                    }`}
                            >
                                {item.status === "1" || item.status === 1 ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <p className="category">{item.category_name}</p>
                        <p>{item.description}</p>

                        {item.image && (
                            <img src={item.image} alt="notification" />
                        )}

                        <div className="card-actions">
                            <button onClick={() => handleEdit(item)}>Edit</button>
                            <button className="delete" onClick={() => handleDelete(item.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notiupdate;
