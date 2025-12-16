import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Addarticle.css";

const AddArticleRm = () => {
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedMain, setSelectedMain] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [youtubeURL, setYoutubeURL] = useState("");
    const [imageone, setImageone] = useState(null);
    const [imagetwo, setImagetwo] = useState(null);
    const [contentType, setContentType] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Toast state
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    // Reset form after success
    const resetForm = () => {
        setSelectedMain("");
        setSelectedSub("");
        setTitle("");
        setDescription("");
        setYoutubeURL("");
        setImageone(null);
        setImagetwo(null);
        setContentType("");
        setProgress(0);
    };

    // Fetch main category
    useEffect(() => {
        axios
            .get("https://tnreaders.in/mobile/list-main-category-readers")
            .then((res) => {
                const allowed = (res.data || []).filter((cat) => cat.status === "allow");
                setMainCategories(allowed);
            })
            .catch(() => showToast("Failed to load main categories", "error"));
    }, []);

    // Fetch sub category
    useEffect(() => {
        if (selectedMain) {
            axios
                .get(`https://tnreaders.in/mobile/sub-category?id=${selectedMain}`)
                .then((res) => setSubCategories(res.data || []))
                .catch(() => showToast("Failed to load sub categories", "error"));
        }
    }, [selectedMain]);

    const handleSubmit = async () => {
        if (!title || !description || !selectedSub || !contentType) {
            showToast("Please fill all required fields!", "error");
            return;
        }

        const formData = new FormData();
        console.log();
        
        formData.append("title", title);
        formData.append("user_id", "84");
        formData.append("message", description);
        formData.append("category_id", selectedSub);
        formData.append("youtube_url", youtubeURL);
        formData.append("content_type", contentType);

        if (imageone) formData.append("app_thumbnail", imageone);
        if (imagetwo) formData.append("web_thumbnail", imagetwo);

        try {
            setLoading(true);

            await axios.post(
                "https://tnreaders.in/mobile/store-new-readersmenu",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded / progressEvent.total) * 100
                        );
                        setProgress(percent);
                    },
                }
            );

            showToast("Post submitted successfully!", "success");
            resetForm();

        } catch (err) {
            console.error(err);
            showToast("Submission failed!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="alignthem">

            {/* TOAST UI */}
            {toast.show && (
                <div className={`toast-box ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="add-post-container">

                <h2 className="form-title">Add Articles to ReadersMenu</h2>

                {/* Content Type */}
                <div className="form-group">
                    <label className="form-label">Content Type</label>
                    <div className="radio-group">
                        {["article", "shorts", "video"].map((type) => (
                            <label key={type} className="radio-label">
                                <input
                                    type="radio"
                                    name="contentType"
                                    value={type}
                                    className="checking"
                                    checked={contentType === type}
                                    onChange={() => setContentType(type)}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Category Row */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Main Category</label>
                        <select
                            className="form-select"
                            value={selectedMain}
                            onChange={(e) => setSelectedMain(e.target.value)}
                        >
                            <option value="">Select Main Category</option>
                            {mainCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sub Category</label>
                        <select
                            className="form-select"
                            value={selectedSub}
                            onChange={(e) => setSelectedSub(e.target.value)}
                        >
                            <option value="">Select Sub Category</option>
                            {subCategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Title */}
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                    />
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Youtube */}
                <div className="form-group">
                    <label className="form-label">YouTube URL</label>
                    <input
                        className="form-input"
                        value={youtubeURL}
                        onChange={(e) => setYoutubeURL(e.target.value)}
                        type="text"
                    />
                </div>

                {/* Images */}
                <div className="form-group">
                    <label className="form-label">App Thumbnail</label>
                    <input
                        className="form-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageone(e.target.files[0])}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Web Thumbnail</label>
                    <input
                        className="form-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagetwo(e.target.files[0])}
                    />
                </div>

                {/* Upload progress */}
                {loading && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>
                            {progress}%
                        </div>
                    </div>
                )}

                <button className="submit-button" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Uploading..." : "சமர்ப்பிக்கவும்"}
                </button>

            </div>
        </div>
    );
};

export default AddArticleRm;
