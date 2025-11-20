import React, { useState, useEffect } from 'react';
import '../styles/MainCategory.css';
import imageee from "../assets/lookit.webp"
import animationData from "../animation/Car.json";
import Lottie from "lottie-react";

function MainCategory() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);

    const limitText = (text, max = 50) => {
        if (!text) return "";
        return text.length > max ? text.substring(0, max) + "..." : text;
    };

    // Manual category title mapping
    const categoryTitles = {
        '157': 'INFORMATION',
        '158': 'HEALTH',
        '160': 'WOMENS CHOICE',
        '172': 'EDUCATION',
        '178': 'TECHTIPS',
        '185': 'LAW',
        '190': 'STORY SPOT',
        '195': 'HOW TO APPLY',
        '200': 'SUCCESS STORY',
        '202': 'MOTIVATION',
        '210': 'AI PROMPTS',
        '214': 'SPORTS',
        '224': 'UPDATES'
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://tnreaders.in/api/user/mainhomepost');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setApiResponse(data);

            // Process categories from the API response
            const processedCategories = {};

            if (data.homepageposts && typeof data.homepageposts === 'object') {
                Object.keys(data.homepageposts).forEach(categoryId => {
                    const posts = data.homepageposts[categoryId];

                    if (Array.isArray(posts) && posts.length > 0) {
                        // Use manual title from our mapping, fallback to API name
                        const categoryName = categoryTitles[categoryId] || posts[0]?.category?.name || `Category ${categoryId}`;
                        const categoryImage = posts[0]?.category?.FullImgPath;

                        processedCategories[categoryId] = {
                            id: categoryId,
                            name: categoryName,
                            image: categoryImage,
                            posts: posts,
                            categoryInfo: posts[0]?.category
                        };
                    }
                });
            }
            setCategories(processedCategories);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    // Debug component to show API response
    const DebugInfo = () => (
        <details className="debug-info">
            <summary>API Response (Debug)</summary>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </details>
    );

    const PostCard = ({ post }) => (
        <article className="post-cardm">
            {/* {post.istrending === 1 && (
                <div className="trending-badge">🔥 Trending</div>
            )} */}

            <div className="post-imagem">
                <img
                    src={
                        post.web_thumbnail ||
                        post.FullImgPath ||
                        post.img ||
                        imageee ||
                        "/assets/lookit.webp"
                    }
                    alt="post-image"
                    onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop
                        e.target.src = "/assets/lookit.webp"; // fallback local image
                    }}
                />
            </div>

            {/* <div className="post-headerm">
                <span className="category-tag">
                    {post.category?.name || 'Uncategorized'}
                </span>
                <span className="likes-count">
                    ❤️ {post.likes_count || 0}
                </span>
            </div> */}

            <div className="post-contentm">
                <h3 className="post-titlem">{limitText(post.title, 25)}</h3>

                {/* <p className="post-description">
                    {post.description && post.description.length > 150
                        ? `${post.description.substring(0, 150)}...`
                        : post.description || 'No description available.'
                    }
                </p> */}

                <div className="post-metam">
                    <span className="post-date">
                        {formatDate(post.created_at)}
                    </span>
                    {/* {post.content_type && (
                        <span className={`content-type ${post.content_type}`}>
                            {post.content_type === 'article' ? '📝 Article' : '🎥Article '}
                        </span>
                    )} */}
                </div>

                <div className="post-actions">
                    <a
                        href={post.BlogURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more-btn"
                    >
                        Read More
                    </a>

                    {/* {post.youtube_url && post.youtube_url !== 'nil' && (
                        <a
                            href={post.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="youtube-btn"
                        >
                            Video
                        </a>
                    )} */}
                </div>
            </div>
        </article>
    );

    const CategorySection = ({ categoryId, categoryData }) => (
        <section key={categoryId} className="category-section">
            <div className="category-headerm">
                <div className="category-title-wrapper">
                    <h2 className="category-title">{categoryData.name}</h2>
                </div>
                {/* <span className="post-count">{categoryData.posts.length} posts</span> */}
            </div>

            <div className="posts-gridm">
                {categoryData.posts.map((post, index) => (
                    <PostCard key={`${post.id}-${index}`} post={post} />
                ))}
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="dashboard-loadingdash">
                <Lottie className="dashboard-loadingdash" animationData={animationData} loop={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <h2>Error Loading Content</h2>
                <p>{error}</p>
                <button onClick={fetchPosts} className="retry-btn">Try Again</button>
                {apiResponse && <DebugInfo />}
            </div>
        );
    }

    return (
        <div className="App">
            {/* <header className="app-header">
        <h1>TN Readers</h1>
        <p>Discover interesting facts and knowledge across all categories</p>
        <div className="header-stats">
          <span>📊 {Object.keys(categories).length} Categories</span>
          <span>📝 {Object.values(categories).reduce((total, cat) => total + cat.posts.length, 0)} Total Posts</span>
        </div>
        <button onClick={fetchPosts} className="refresh-btn">Refresh</button>
      </header> */}

            <main className="main-content">
                {Object.keys(categories).length === 0 ? (
                    <div className="no-posts">
                        <h2>No Posts Available</h2>
                        <p>No posts were found in the API response.</p>
                        <button onClick={fetchPosts} className="retry-btn">Retry</button>
                        {apiResponse && <DebugInfo />}
                    </div>
                ) : (
                    <div className="categories-container">
                        {Object.keys(categories).map(categoryId => (
                            <CategorySection
                                key={categoryId}
                                categoryId={categoryId}
                                categoryData={categories[categoryId]}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MainCategory;