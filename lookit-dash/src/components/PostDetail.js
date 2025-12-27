import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/postDetail.css";

const PostDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { post } = location.state || {};

    if (!post) {
        return (
            <div className="post-detail-container">
                <div className="error-message">
                    <h2>Post Not Found</h2>
                    <p>The post you're looking for doesn't exist.</p>
                    <button onClick={() => navigate("/")} className="back-button">
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Function to get content type badge
    const getContentTypeBadge = (contentType) => {
        const types = {
            video: { text: "Video", class: "video" },
            article: { text: "Article", class: "article" }
        };

        return types[contentType] || { text: "Content", class: "default" };
    };

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to handle YouTube URL
    const getYouTubeEmbedUrl = (url) => {
        if (!url || url === "nil") return null;

        // Extract video ID from various YouTube URL formats
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const contentType = getContentTypeBadge(post.content_type);
    const youtubeEmbedUrl = getYouTubeEmbedUrl(post.youtube_url);

    return (
        <div className="post-detail-container">
            <button onClick={() => navigate(-1)} className="back-button">
                ← Back
            </button>

            <article className="post-detail">
                {/* Header Section */}
                <header className="post-headerdet">
                    <div className="post-meta">
                        <span className={`content-type-badge ${contentType.class}`}>
                            {contentType.text}
                        </span>
                        <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>

                    <h1 className="post-titledet">{post.title}</h1>

                    {post.sub_title && post.sub_title !== "Subtitle" && (
                        <h2 className="post-subtitle">{post.sub_title}</h2>
                    )}

                    <div className="post-stats">
                        <span className="category-badge">{post.category?.name}</span>
                        <span className="likes-count">❤️ {post.likes_count} Likes</span>
                        {post.popular > 0 && (
                            <span className="popular-badge">🔥 Popular</span>
                        )}
                    </div>
                </header>

                {/* Featured Image */}
                {(post.FullImgPath && post.FullImgPath !== "https://tnreaders.in/images/post/news-detail/7d7702b1-54d2-40.jpg") && (
                    <div className="featured-image">
                        <img
                            src={post.FullImgPath || "/assets/lookit.webp"}
                            alt={post.title}
                            className="main-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/lookit.webp";
                            }}
                        />
                    </div>
                )}

                {/* Thumbnail Images */}
                <div className="thumbnail-images">
                    {post.app_thumbnail && post.app_thumbnail !== "nil" && (
                        <div className="thumbnail">
                            <img src={post.app_thumbnail || "/assets/lookit.webp"} alt="App Thumbnail" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/lookit.webp";
                            }} />
                            <span>App Thumbnail</span>
                        </div>
                    )}
                    {post.web_thumbnail && post.web_thumbnail !== "nil" && (
                        <div className="thumbnail">
                            <img src={post.web_thumbnail || "/assets/lookit.webp"} alt="Web Thumbnail" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/assets/lookit.webp";
                            }} />
                            <span>Web Thumbnail</span>
                        </div>
                    )}
                </div>

                {/* YouTube Video */}
                {youtubeEmbedUrl && (
                    <div className="video-section">
                        <h3>Watch Video</h3>
                        <div className="video-container">
                            <iframe
                                src={youtubeEmbedUrl}
                                title={post.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <a
                            href={post.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="youtube-link"
                        >
                            🎥 Watch on YouTube
                        </a>
                    </div>
                )}

                {/* Content Section */}
                <div className="post-content">
                    <h3>Description</h3>
                    <div className="description-text">
                        {post.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                {/* SEO Information */}
                <div className="seo-info">
                    <h3>SEO Information</h3>
                    <div className="seo-details">
                        {post.seo_title && (
                            <div className="seo-item">
                                <strong>SEO Title:</strong> {post.seo_title}
                            </div>
                        )}
                        {post.seo_keyword && (
                            <div className="seo-item">
                                <strong>SEO Keywords:</strong> {post.seo_keyword}
                            </div>
                        )}
                        {post.seo_description && (
                            <div className="seo-item">
                                <strong>SEO Description:</strong> {post.seo_description}
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="additional-info">
                    <h3>Additional Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Content Type:</strong> {post.content_type}
                        </div>
                        <div className="info-item">
                            <strong>Status:</strong> {post.status}
                        </div>
                        <div className="info-item">
                            <strong>Is Trending:</strong> {post.istrending ? "Yes" : "No"}
                        </div>
                        <div className="info-item">
                            <strong>Last Updated:</strong> {formatDate(post.updated_at)}
                        </div>
                    </div>
                </div>

                {/* External Links */}
                <div className="external-links">
                    {post.BlogURL && (
                        <a
                            href={post.BlogURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            📖 Read Full Article on Blog
                        </a>
                    )}
                </div>
            </article>
        </div>
    );
};

export default PostDetail;