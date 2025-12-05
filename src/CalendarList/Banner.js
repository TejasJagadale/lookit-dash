import { useEffect, useState } from "react";
import "../styles/BannerStyles.css";

export default function Banner() {
  const [activeBanners, setActiveBanners] = useState([]);
  const [inactiveBanners, setInactiveBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [urlLink, setUrlLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal editing state
  const [editingBanner, setEditingBanner] = useState(null);

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setSelectedCategory(banner.category_id);
    setUrlLink(banner.url_link);
    setPreviewImage(banner.banner_link);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBanner) return;

    const formData = new FormData();
    formData.append("category_id", selectedCategory);
    formData.append("url_link", urlLink);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(
        `https://tnreaders.in/mobile/banners-update/${editingBanner.id}`,
        { method: "POST", body: formData }
      );
      const json = await res.json();

      if (json.status) {
        alert("Banner updated successfully!");
        setEditingBanner(null);
        setSelectedCategory("");
        setUrlLink("");
        setImageFile(null);
        setPreviewImage("");
        loadBanners();
      } else {
        alert("Update failed: " + json.message);
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("https://tnreaders.in/mobile/list-main-selected");
      const json = await res.json();
      setCategories(json.filter((cat) => cat.status === "allow"));
    } catch (err) {
      console.log(err);
    }
  };

  const loadBanners = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://tnreaders.in/mobile/banners?category_id=${categoryId}`
      );
      const json = await res.json();
      if (json.status && Array.isArray(json.data.data)) {
        const list = json.data.data;
        setActiveBanners(list.filter((b) => b.status === 1));
        setInactiveBanners(list.filter((b) => b.status === 0));
      } else {
        setActiveBanners([]);
        setInactiveBanners([]);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) loadBanners();
  }, [categoryId]);

  const toggleBannerStatus = async (banner, isActive) => {
    const newStatus = isActive ? 0 : 1;
    try {
      const res = await fetch(
        `https://tnreaders.in/mobile/banners-chnage-status?id=${banner.id}&status=${newStatus}`
      );
      const json = await res.json();
      if (json.status) loadBanners();
      else alert("Failed to update status: " + json.message);
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return alert("Please select a category.");
    if (!imageFile) return alert("Please upload a banner image.");

    const formData = new FormData();
    formData.append("category_id", selectedCategory);
    formData.append("image", imageFile);
    formData.append("url_link", urlLink);

    setUploading(true);
    try {
      const res = await fetch("https://tnreaders.in/mobile/banners-store", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.status) {
        alert("Banner uploaded successfully!");
        setSelectedCategory("");
        setUrlLink("");
        setImageFile(null);
        setPreviewImage("");
        loadBanners();
      } else alert("Upload failed: " + json.message);
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }
    setUploading(false);
  };

  return (
    <div className="banner-dashboard">
      {/* UPLOAD SECTION */}
      <div className="upload-box">
        <h2 className="upload-title">Upload New Banner</h2>
        <form onSubmit={handleSubmit}>
          <label>Select Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label>URL Link</label>
          <input
            type="text"
            placeholder="Enter banner URL"
            value={urlLink}
            onChange={(e) => setUrlLink(e.target.value)}
          />
          <label>Upload Banner Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewImage && <img src={previewImage} className="preview-img" />}
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Banner"}
          </button>
        </form>
      </div>

      {/* CATEGORY FILTER */}
      <div className="category-filter-box">
        <h2>Select Category to View Banners</h2>
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* BANNER LISTS */}
      <div className="banner-flex">
        {loading && <p className="loading-text">Loading banners...</p>}

        {/* ACTIVE BANNERS */}
        <div className="banner-column">
          <h2 className="section-title active">Active Banners</h2>
          <div className="banner-grid">
            {activeBanners.map((banner) => (
              <div key={banner.id} className="banner-card">
                <h3>{banner.category}</h3>
                <a href={banner.url_link} target="_blank">
                  <img src={banner.banner_link} className="banner-image" />
                </a>
                <button
                  className="deactivate-btn"
                  onClick={() => toggleBannerStatus(banner, true)}
                >
                  Move to Inactive
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(banner)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INACTIVE BANNERS */}
        <div className="banner-column">
          <h2 className="section-title inactive">Inactive Banners</h2>
          <div className="banner-grid">
            {inactiveBanners.map((banner) => (
              <div key={banner.id} className="banner-card inactive-card">
                <h3>{banner.category}</h3>
                <a href={banner.url_link} target="_blank">
                  <img src={banner.banner_link} className="banner-image" />
                </a>
                <button
                  className="activate-btn"
                  onClick={() => toggleBannerStatus(banner, false)}
                >
                  Move to Active
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(banner)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingBanner && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Banner</h2>
            <form onSubmit={handleUpdate}>
              <label>Select Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label>URL Link</label>
              <input
                type="text"
                value={urlLink}
                onChange={(e) => setUrlLink(e.target.value)}
              />

              <label>Upload Banner Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <img src={previewImage} className="preview-img" />
              )}

              <div className="modal-buttons">
                <button type="submit" className="upload-btn">
                  Update Banner
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingBanner(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
