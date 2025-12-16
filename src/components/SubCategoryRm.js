import React, { useEffect, useState } from "react";
import "../styles/SubCategory.css";

const SubCategoryRm = () => {
    const [posts, setPosts] = useState({
        trending: [],
        categories: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch all posts from the API
    const fetchPosts = async () => {
        try {
            const res = await fetch("https://tnreaders.in/api/user/home-posts");
            const data = await res.json();
            // Process the data according to requirements
            const processedData = processApiData(data);
            console.log(processedData);

            setPosts(processedData);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    // Process API data to organize by trending, categories, date, etc.
    const processApiData = (apiData) => {
        const result = {
            trending: [],
            categories: []
        };

        // 1. Get trending posts (istrending = 1 and status = "request")
        if (apiData.trendingposts) {
            result.trending = apiData.trendingposts
                .filter(post =>
                    post.istrending === 1 &&
                    post.status === "request" &&
                    post.isActive === "yes"
                )
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 6)
        }

        // 2. Process homepage categories
        if (apiData.homepageposts) {
            result.categories = apiData.homepageposts.map(category => ({
                id: category.id,
                parent_id: category.parent_id,
                name: category.name,
                status: category.status,
                image: category.FullImgPath,
                posts: (category.contentposts || [])
                    .filter(post =>
                        post.status === "request" &&
                        post.isActive === "yes"
                    )
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
            })).filter(category => category.posts.length > 0);
        }

        return result;
    };

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Handle post click - show modal with post details
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setShowModal(true);
    };

    // Handle view all for categories
    const handleViewAll = (category) => {
        alert(`View all posts for ${category.name}\nTotal posts: ${category.posts.length}`);
        // You can implement a category modal here if needed
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedPost(null);
    };

    // Handle click outside modal to close
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Limit text to specific characters
    const limitText = (text, max = 50) => {
        if (!text) return "";
        return text.length > max ? text.substring(0, max) + "..." : text;
    };

    // Function to safely render HTML content
    const renderHTML = (htmlString) => {
        return { __html: htmlString || '' };
    };

    const totalPosts = posts.trending.length + posts.categories.reduce((sum, cat) => sum + cat.posts.length, 0);
    const totalCategories = posts.categories.length;

    if (loading) {
        return (
            <div className="dashboard-loadingdash">
                <div className="loading-text">Loading Sub Categories...</div>
            </div>
        );
    }

    return (
        <div className="professional-dashboarddash">
            <div className="content-header">
                <h1>Sub Categories</h1>
                <p>Browse trending posts and categories</p>
            </div>

            {/* Main Dashboard Grid */}
            <div className="dashboard-maindash">
                {/* Trending Posts Section */}
                {posts.trending.length > 0 && (
                    <div className="section-carddash trending-sectiondash">
                        <div className="section-headerdash">
                            <div className="section-titledash">
                                <span className="title-icondash">🔥</span>
                                <h2>Trending Content</h2>
                            </div>
                        </div>
                        <div className="trending-griddash">
                            {posts.trending.map((post, index) => (
                                <div
                                    key={`trending-${post.id}`}
                                    className="trending-carddash"
                                    onClick={() => handlePostClick(post)}
                                >
                                    <div className="card-imagedash">
                                        <img
                                            src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.webp"}
                                            alt={post.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/lookit.webp";
                                            }}
                                        />
                                        <div className="trending-overlaydash">
                                            <h4 className="trending-titledash">{limitText(post.title, 40)}</h4>
                                            <span className="trending-datedash">{formatDate(post.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistics Overview */}
                <div className="stats-sectiondash">
                    <div className="stats-griddash">
                        <div className="stat-carddash">
                            <div className="stat-icondash totaldash">
                                <img className="icon-postdash" src="/svg/post.svg" alt="Posts" />
                            </div>
                            <div className="stat-infodash">
                                <h3>{totalPosts}</h3>
                                <p>Total Posts</p>
                            </div>
                        </div>

                        <div className="stat-carddash">
                            <div className="stat-icondash trendingdash">
                                <img className="icon-postdash" src="/svg/trend.svg" alt="Trending" />
                            </div>
                            <div className="stat-infodash">
                                <h3>{posts.trending.length}</h3>
                                <p>Trending Posts</p>
                            </div>
                        </div>

                        <div className="stat-carddash">
                            <div className="stat-icondash categoriesdash">
                                <img className="icon-postdash" src="/svg/category.svg" alt="Categories" />
                            </div>
                            <div className="stat-infodash">
                                <h3>{totalCategories}</h3>
                                <p>Active Categories</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="categories-griddash">
                    {posts.categories.map(category => (
                        <div key={`category-${category.id}`} className="section-carddash category-sectiondash">
                            <div className="section-headerdash">
                                <div className="category-infodash">
                                    {category.image && (
                                        <img
                                            src={category.image || "/assets/lookit.webp"}
                                            alt={category.name}
                                            className="category-avatardash"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/assets/lookit.webp";
                                            }}
                                        />
                                    )}
                                    <div className="category-infodash1">
                                        <h3>{category.name}</h3>
                                        <span className="posts-countdash">{category.posts.length} posts</span>
                                    </div>
                                </div>
                                {/* <button 
                                    className="view-all-btn"
                                    onClick={() => handleViewAll(category)}
                                >
                                    View All
                                </button> */}
                            </div>

                            <div className="category-postsdash">
                                {category.posts.map((post) => (
                                    <div
                                        key={`${category.id}-${post.id}`}
                                        className="post-carddash"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className="post-imagedash">
                                            <img
                                                src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.webp"}
                                                alt={post.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/assets/lookit.webp";
                                                }}
                                            />
                                        </div>
                                        <div className="post-contentdash">
                                            <h4 className="post-titledash">{limitText(post.title, 35)}</h4>
                                            <div className="post-footerdash">
                                                <span className="datedash">{formatDate(post.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {totalPosts === 0 && (
                    <div className="empty-statedash">
                        <div className="empty-icondash">📝</div>
                        <h3>No Content Available</h3>
                        <p>There's no content to display at the moment.</p>
                        <button onClick={fetchPosts} className="retry-btn">Retry</button>
                    </div>
                )}
            </div>

            {/* Article Detail Modal */}
            {showModal && selectedPost && (
                <div className="modal-backdrop" onClick={handleBackdropClick}>
                    <div className="article-modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedPost.title}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="article-hero-image">
                                <img
                                    src={selectedPost.app_thumbnail || selectedPost.web_thumbnail || selectedPost.FullImgPath || "/assets/lookit.webp"}
                                    alt={selectedPost.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/assets/lookit.webp";
                                    }}
                                />
                            </div>
                            
                            <div className="article-meta">
                                <div className="meta-item">
                                    <strong>Published:</strong>
                                    <span>{formatDate(selectedPost.created_at)}</span>
                                </div>
                                {selectedPost.category && (
                                    <div className="meta-item">
                                        <strong>Category:</strong>
                                        <span>{selectedPost.category.name}</span>
                                    </div>
                                )}
                                {selectedPost.istrending === 1 && (
                                    <div className="meta-item trending-badge">
                                        <strong>🔥 Trending</strong>
                                    </div>
                                )}
                            </div>

                            <div className="article-content">
                                {selectedPost.content ? (
                                    <div 
                                        className="content-html"
                                        dangerouslySetInnerHTML={renderHTML(selectedPost.content)}
                                    />
                                ) : selectedPost.description ? (
                                    <p>{selectedPost.description}</p>
                                ) : (
                                    <p>No content available for this article.</p>
                                )}
                            </div>

                            {selectedPost.BlogURL && (
                                <div className="article-actions">
                                    <a
                                        href={selectedPost.BlogURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="external-link-btn"
                                    >
                                        Read Full Article on Website
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategoryRm;