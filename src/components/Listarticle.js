import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/listall.css";

const Listarticle = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [editingPost, setEditingPost] = useState(null);
    const [viewingPost, setViewingPost] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const postsPerPage = 50;
    const [selectedMain, setSelectedMain] = useState("");
    const [selectedSub, setSelectedSub] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [youtubeURL, setYoutubeURL] = useState("");
    const [imageone, setImageone] = useState(null);
    const [imagetwo, setImagetwo] = useState(null);
    const [imageonePreview, setImageonePreview] = useState("");
    const [imagetwoPreview, setImagetwoPreview] = useState("");
    const [isSubCategoriesLoaded, setIsSubCategoriesLoaded] = useState(false);
    const [contentType, setContentType] = useState("");
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [filters, setFilters] = useState({
        category: "",
        status: "",
        contentType: "",
        trending: ""
    });

    const [allPosts, setAllPosts] = useState([]);

    // Fetch posts with pagination
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        setIsLoading(true);

        axios
            .get(`https://tnreaders.in/mobile/view-post-sub?currentPage=1&perPage=20`)
            .then((response) => {
                setAllPosts(response.data.data || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("API fetch error:", error);
                setIsLoading(false);
            });
    };

    // Apply filters to the posts
    useEffect(() => {
        if (allPosts.length === 0) return;

        let filtered = [...allPosts];
        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(
                (post) => post.category.parent_id.toString() === filters.category
            );
        }
        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter((post) => post.isActive === filters.status);
        }
        // Apply content type filter
        if (filters.contentType) {
            filtered = filtered.filter(
                (post) => post.content_type === filters.contentType
            );
        }
        // Apply trending filter
        if (filters.trending !== "") {
            filtered = filtered.filter(
                (post) => post.istrending.toString() === filters.trending
            );
        }
        // Calculate pagination
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filtered.slice(startIndex, endIndex);

        setPosts(paginatedPosts);
        setTotalPosts(filtered.length);
        setTotalPages(Math.ceil(filtered.length / postsPerPage));
    }, [allPosts, currentPage, filters]);

    // Fetch Main Categories on load
    useEffect(() => {
        axios
            .get("https://tnreaders.in/mobile/main-category")
            .then((res) => {
                const allowedCategories = (res.data || []).filter(
                    (cat) => cat.status === "allow"
                );
                setMainCategories(allowedCategories);
            })
            .catch((err) => console.error("Main category error", err));
    }, []);

    // Fetch Sub Categories when main category changes
    useEffect(() => {
        if (selectedMain) {
            setIsSubCategoriesLoaded(false);
            axios
                .get(`https://tnreaders.in/mobile/sub-category?id=${selectedMain}`)
                .then((res) => {
                    const subs = res.data || [];
                    setSubCategories(subs);
                    setIsSubCategoriesLoaded(true);
                    setIsEditLoading(false);
                })
                .catch((err) => {
                    console.error("Sub category error", err);
                    setIsEditLoading(false);
                });
        }
    }, [selectedMain]);

    // Set the subcategory after subcategories are loaded and we're editing a post
    useEffect(() => {
        if (isSubCategoriesLoaded && editingPost && editingPost.category_id) {
            setSelectedSub(editingPost.category_id.toString() || "");
        }
    }, [isSubCategoriesLoaded, editingPost]);

    // Handle image upload for App Thumbnail
    const handleImageOneChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageone(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImageonePreview(previewUrl);
        }
    };

    // Handle image upload for Web Thumbnail
    const handleImageTwoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagetwo(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagetwoPreview(previewUrl);
        }
    };

    // Clear image previews when component unmounts or editing is done
    useEffect(() => {
        return () => {
            if (imageonePreview) URL.revokeObjectURL(imageonePreview);
            if (imagetwoPreview) URL.revokeObjectURL(imagetwoPreview);
        };
    }, [imageonePreview, imagetwoPreview]);

    const handleEdit = async (post) => {
        setIsEditLoading(true);
        try {
            const [mainCatRes, subCatRes] = await Promise.all([
                axios.get("https://tnreaders.in/mobile/main-category"),
                axios.get(
                    `https://tnreaders.in/mobile/sub-category?id=${post.category.parent_id}`
                )
            ]);

            setEditingPost(post);
            setTitle(post.title || "");
            setDescription(post.description || "");
            setYoutubeURL(post.youtube_url || "");
            setContentType(post.content_type || "");

            // Set existing image URLs for preview (but don't set the file objects)
            setImageonePreview(post.app_thumbnail || "");
            setImagetwoPreview(post.web_thumbnail || "");

            // Clear the file objects when editing (user can choose new files if needed)
            setImageone(null);
            setImagetwo(null);

            const allowedCategories = (mainCatRes.data || []).filter(
                (cat) => cat.status === "allow"
            );
            setMainCategories(allowedCategories);
            setSubCategories(subCatRes.data || []);
            setSelectedMain(post.category.parent_id.toString());
            setSelectedSub(post.category_id.toString());
        } catch (err) {
            console.error("Edit load error:", err);
            alert("Failed to load edit data");
        } finally {
            setIsEditLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterName]: value
        }));
        setCurrentPage(1);
    };

    // Add reset filters function
    const resetFilters = () => {
        setFilters({
            category: "",
            status: "",
            contentType: "",
            trending: ""
        });
        setCurrentPage(1);
    };

    const handleView = (post) => {
        setViewingPost(post);
        setEditingPost(null);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        // Validate post_id is present when editing
        if (editingPost && !editingPost.id) {
            alert("Error: Post ID is missing for editing");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("user_id", "84");
        formData.append("category_id", selectedSub ? String(selectedSub) : "");
        formData.append("title", title || "");
        formData.append("message", description || "");
        formData.append("youtube_url", youtubeURL || "");
        formData.append("content_type", contentType || "");

        // Append image files if they are selected
        if (imageone) {
            formData.append("app_thumbnail", imageone);
        }
        if (imagetwo) {
            formData.append("web_thumbnail", imagetwo);
        }

        // Determine the endpoint based on whether we're editing or creating
        const endpoint = editingPost
            ? "https://tnreaders.in/mobile/store-new-post"
            : "https://tnreaders.in/mobile/upload-post";

        // Add post_id only when editing
        if (editingPost) {
            formData.append("post_id", editingPost.id.toString());
        }

        try {
            const response = await axios.post(endpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.success) {
                alert(editingPost ? "Post updated!" : "Post submitted!");
                setEditingPost(null);
                // Clear file inputs and previews
                setImageone(null);
                setImagetwo(null);
                setImageonePreview("");
                setImagetwoPreview("");
                fetchPosts();
            } else {
                alert(response.data.message || "Operation failed");
            }
        } catch (err) {
            console.error("Submission error", err);
            alert(err.response?.data?.message || "Error during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePostStatus = async (postId, currentStatus) => {
        const newStatus = currentStatus === "yes" ? "no" : "yes";
        setIsProcessing(true);
        try {
            await axios.post("https://tnreaders.in/mobile/update-status", {
                postId,
                isActive: newStatus
            });
            alert(
                `Post status updated to ${newStatus === "yes" ? "Active" : "Disabled"}`
            );
            setPosts(
                posts.map((post) =>
                    post.id === postId ? { ...post, isActive: newStatus } : post
                )
            );
            if (viewingPost?.id === postId) {
                setViewingPost({
                    ...viewingPost,
                    isActive: newStatus
                });
            }
        } catch (err) {
            console.error("Status update error", err);
            alert("Error updating post status");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleTrendingStatus = async (postId, currentTrendingStatus) => {
        const newTrendingStatus = currentTrendingStatus === 1 ? 0 : 1;
        const payloadStatus = currentTrendingStatus === 1 ? "no" : "yes";
        setIsProcessing(true);
        try {
            console.log(
                "Updating trending status for post:",
                postId,
                "to:",
                payloadStatus
            );

            const response = await axios.post(
                "https://tnreaders.in/mobile/update-trending",
                {
                    postId: postId,
                    isActive: payloadStatus
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }
                }
            );
            console.log("API Response:", response.data);
            if (response.data.success) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, istrending: newTrendingStatus }
                            : post
                    )
                );

                if (viewingPost?.id === postId) {
                    setViewingPost((prev) => ({
                        ...prev,
                        istrending: newTrendingStatus
                    }));
                }

                alert(
                    `Trending status updated to ${newTrendingStatus === 1 ? "Trending" : "Not Trending"
                    }`
                );
            } else {
                alert(response.data.message || "Failed to update trending status");
            }
        } catch (err) {
            console.error("Error updating trending status:", {
                error: err,
                response: err.response,
                message: err.message
            });
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const Loader = () => (
        <div className="loader-container">
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="articles-container">
            {isLoading ? (
                <Loader />
            ) : !editingPost && !viewingPost ? (
                <>
                    <h2 className="articles-header">Latest Posts</h2>
                    <div className="actions-bar">
                        <Link to="/" className="home-link">
                            Home
                        </Link>
                        <button
                            className="add-article-btn"
                            onClick={() => navigate("/add-articles")}
                        >
                            Add Articles
                        </button>
                    </div>
                    <div className="filters-section">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label">Category</label>
                                <select
                                    className="filter-select"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange("category", e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {mainCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Status</label>
                                <select
                                    className="filter-select"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="yes">Active</option>
                                    <option value="no">Disabled</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Content Type</label>
                                <select
                                    className="filter-select"
                                    value={filters.contentType}
                                    onChange={(e) =>
                                        handleFilterChange("contentType", e.target.value)
                                    }
                                >
                                    <option value="">All Content Types</option>
                                    <option value="article">Article</option>
                                    <option value="video">Video</option>
                                    <option value="shorts">Shorts</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Trending</label>
                                <select
                                    className="filter-select"
                                    value={filters.trending}
                                    onChange={(e) => handleFilterChange("trending", e.target.value)}
                                >
                                    <option value="">All Trending</option>
                                    <option value="1">Trending</option>
                                    <option value="0">Not Trending</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <button
                                    className="reset-filters-btn"
                                    onClick={resetFilters}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="posts-grid">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div className="post-cardss" key={post.id}>
                                    <img
                                        src={post.web_thumbnail}
                                        className="post-image"
                                        alt={post.FullImgPath}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="post-contentss">
                                        <h3 className="post-title">{post.title}</h3>
                                        <div className="post-meta">
                                            <div>
                                                <div className="post-category">
                                                    {post.category?.name || "Uncategorized"}
                                                </div>
                                            </div>
                                            <div className="post-date">
                                                <div className="date-label">Created At</div>
                                                <div className="date-value">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="post-actions">
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(post)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => handleView(post)}
                                                >
                                                    View
                                                </button>
                                            </div>
                                            <div className="status-controls">
                                                {/* Trending Toggle */}
                                                <div
                                                    className={`toggle-group ${post.istrending === 1
                                                        ? "trending-active"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        toggleTrendingStatus(post.id, post.istrending)
                                                    }
                                                >
                                                    <input
                                                        className="toggle-switch"
                                                        type="checkbox"
                                                        role="switch"
                                                        checked={post.istrending === 1}
                                                        readOnly
                                                    />
                                                    <span className="toggle-label">
                                                        {post.istrending === 1 ? "Trending" : "Normal"}
                                                    </span>
                                                </div>

                                                {/* Active Toggle */}
                                                <div
                                                    className={`toggle-group ${post.isActive === "yes"
                                                        ? "status-active"
                                                        : "status-inactive"
                                                        }`}
                                                    onClick={() =>
                                                        togglePostStatus(post.id, post.isActive)
                                                    }
                                                >
                                                    <input
                                                        className="toggle-switch"
                                                        type="checkbox"
                                                        role="switch"
                                                        checked={post.isActive === "yes"}
                                                        readOnly
                                                    />
                                                    <span className="toggle-label">
                                                        {post.isActive === "yes" ? "Active" : "Disabled"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-author">
                                        <small>By {post.submasteruser.name || "Unknown Author"}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p className="empty-text">No posts found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination-section">
                            <nav aria-label="Page navigation">
                                <ul className="pagination">
                                    <li
                                        className={`pagination-item ${currentPage === 1 ? "disabled" : ""
                                            }`}
                                    >
                                        <button
                                            className="pagination-link"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <li
                                                key={pageNum}
                                                className={`pagination-item ${currentPage === pageNum ? "active" : ""
                                                    }`}
                                            >
                                                <button
                                                    className="pagination-link"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li
                                        className={`pagination-item ${currentPage === totalPages ? "disabled" : ""
                                            }`}
                                    >
                                        <button
                                            className="pagination-link"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                            }
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}

                    <div className="results-info">
                        Showing {(currentPage - 1) * postsPerPage + 1} to{" "}
                        {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts}{" "}
                        posts
                    </div>
                </>
            ) : viewingPost ? (
                <div className="post-detail-container">
                    <h2 className="detail-header">Post Details</h2>
                    <div className="detail-content">
                        <div className="detail-grid">
                            <div className="detail-group">
                                <span className="detail-label">Title</span>
                                <p className="detail-value">{viewingPost.title}</p>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Content Type</span>
                                <p className="detail-value">{viewingPost.content_type}</p>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-group">
                                <span className="detail-label">Main Category</span>
                                <p className="detail-value">{viewingPost.main_category?.name || "N/A"}</p>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Sub Category</span>
                                <p className="detail-value">{viewingPost.sub_category?.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="detail-group">
                            <span className="detail-label">Description</span>
                            <p className="detail-value">{viewingPost.description}</p>
                        </div>

                        {viewingPost.youtube_url && (
                            <div className="detail-group">
                                <span className="detail-label">YouTube URL</span>
                                <a
                                    href={viewingPost.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-value"
                                >
                                    {viewingPost.youtube_url}
                                </a>
                            </div>
                        )}

                        <div className="detail-grid">
                            <div className="detail-group">
                                <span className="detail-label">App Thumbnail</span>
                                {viewingPost.app_thumbnail && (
                                    <img
                                        src={viewingPost.app_thumbnail}
                                        alt="App Thumbnail"
                                        className="detail-image"
                                    />
                                )}
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Web Thumbnail</span>
                                {viewingPost.web_thumbnail && (
                                    <img
                                        src={viewingPost.web_thumbnail}
                                        alt="Web Thumbnail"
                                        className="detail-image"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-group">
                                <span className="detail-label">Status</span>

                                <div className="status-controls-group">
                                    <div>
                                        <span className="detail-label">Trending:</span>
                                        {isProcessing ? (
                                            <div className="processing-overlay">
                                                <div className="processing-spinner"></div>
                                                <div className="processing-text">Updating...</div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`toggle-group ${viewingPost.istrending === 1
                                                    ? "trending-active"
                                                    : ""
                                                    }`}
                                                onClick={() =>
                                                    toggleTrendingStatus(
                                                        viewingPost.id,
                                                        viewingPost.istrending
                                                    )
                                                }
                                            >
                                                <input
                                                    className="toggle-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={viewingPost.istrending === 1}
                                                    readOnly
                                                />
                                                <span className="toggle-label">
                                                    {viewingPost.istrending === 1
                                                        ? "Trending"
                                                        : "Normal"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <span className="detail-label">Active:</span>
                                        {isProcessing ? (
                                            <div className="processing-overlay">
                                                <div className="processing-spinner"></div>
                                                <div className="processing-text">Updating...</div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`toggle-group ${viewingPost.isActive === "yes"
                                                    ? "status-active"
                                                    : "status-inactive"
                                                    }`}
                                                onClick={() =>
                                                    togglePostStatus(
                                                        viewingPost.id,
                                                        viewingPost.isActive
                                                    )
                                                }
                                            >
                                                <input
                                                    className="toggle-switch"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={viewingPost.isActive === "yes"}
                                                    readOnly
                                                />
                                                <span className="toggle-label">
                                                    {viewingPost.isActive === "yes"
                                                        ? "Active"
                                                        : "Disabled"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Author</span>
                                <p className="detail-value">{viewingPost.submasteruser?.name || "N/A"}</p>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Author</span>
                                <p className="detail-value">{viewingPost.submasteruser?.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-group">
                                <span className="detail-label">Created At</span>
                                <p className="detail-value">{new Date(viewingPost.created_at).toLocaleString()}</p>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Updated At</span>
                                <p className="detail-value">{new Date(viewingPost.updated_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="detail-actions">
                            <button
                                className="back-btn"
                                onClick={() => setViewingPost(null)}
                            >
                                Back to List
                            </button>
                            <button
                                className="edit-detail-btn"
                                onClick={() => {
                                    handleEdit(viewingPost);
                                    setViewingPost(null);
                                }}
                            >
                                Edit Post
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="form-container">
                    {isEditLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <h2 className="form-title">
                                {editingPost ? "Edit Article" : "Add Article"}
                            </h2>
                            {isSubmitting && (
                                <div className="processing-overlay">
                                    <div className="processing-spinner"></div>
                                    <p className="processing-text">Processing your request...</p>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Content Type</label>
                                <div className="radio-options">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="contentType"
                                            value="article"
                                            className="radio-input"
                                            checked={contentType === "article"}
                                            onChange={() => setContentType("article")}
                                        />
                                        Article
                                    </label>

                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="contentType"
                                            value="shorts"
                                            checked={contentType === "shorts"}
                                            onChange={() => setContentType("shorts")}
                                            className="radio-input"
                                        />
                                        Shorts
                                    </label>

                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="contentType"
                                            value="video"
                                            className="radio-input"
                                            checked={contentType === "video"}
                                            onChange={() => setContentType("video")}
                                        />
                                        Video
                                    </label>
                                </div>
                            </div>
                            <div className="form-columns">
                                <div className="form-group">
                                    <label className="form-label">Main Category</label>
                                    <select
                                        className="form-select"
                                        value={selectedMain}
                                        onChange={(e) => setSelectedMain(e.target.value)}
                                    >
                                        <option value="">Select Main Category</option>
                                        {mainCategories.length > 0 &&
                                            mainCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id.toString()}>
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
                                        {subCategories.length > 0 &&
                                            subCategories.map((sub) => (
                                                <option key={sub.id} value={sub.id.toString()}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    type="text"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">YouTube URL</label>
                                <input
                                    className="form-input"
                                    value={youtubeURL}
                                    onChange={(e) => setYoutubeURL(e.target.value)}
                                    type="text"
                                />
                            </div>

                            {/* App Thumbnail - File Upload */}
                            <div className="form-group">
                                <label className="form-label">App Thumbnail</label>
                                <input
                                    className="form-input-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageOneChange}
                                />
                                {imageonePreview && (
                                    <div className="image-preview">
                                        <img
                                            src={imageonePreview}
                                            alt="App Thumbnail Preview"
                                            className="preview-image"
                                        />
                                        <p className="preview-text">Selected: {imageone?.name || 'Current Image'}</p>
                                    </div>
                                )}
                                {editingPost && !imageonePreview && editingPost.app_thumbnail && (
                                    <div className="image-preview">
                                        <img
                                            src={editingPost.app_thumbnail}
                                            alt="Current App Thumbnail"
                                            className="preview-image"
                                        />
                                        <p className="preview-text">Current Image</p>
                                    </div>
                                )}
                            </div>

                            {/* Web Thumbnail - File Upload */}
                            <div className="form-group">
                                <label className="form-label">Web Thumbnail</label>
                                <input
                                    className="form-input-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageTwoChange}
                                />
                                {imagetwoPreview && (
                                    <div className="image-preview">
                                        <img
                                            src={imagetwoPreview}
                                            alt="Web Thumbnail Preview"
                                            className="preview-image"
                                        />
                                        <p className="preview-text">Selected: {imagetwo?.name || 'Current Image'}</p>
                                    </div>
                                )}
                                {editingPost && !imagetwoPreview && editingPost.web_thumbnail && (
                                    <div className="image-preview">
                                        <img
                                            src={editingPost.web_thumbnail}
                                            alt="Current Web Thumbnail"
                                            className="preview-image"
                                        />
                                        <p className="preview-text">Current Image</p>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    className="submit-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span
                                                className="processing-spinner"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>
                                            Processing...
                                        </>
                                    ) : editingPost ? (
                                        "Update Article"
                                    ) : (
                                        "Submit Article"
                                    )}
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setEditingPost(null);
                                        // Clear file inputs and previews when canceling
                                        setImageone(null);
                                        setImagetwo(null);
                                        setImageonePreview("");
                                        setImagetwoPreview("");
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Listarticle;