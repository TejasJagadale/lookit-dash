import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [posts, setPosts] = useState({
    trending: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all posts from the API
  const fetchPosts = async () => {
    try {
      const res = await fetch("https://tnreaders.in/api/user/home-posts");
      const data = await res.json();
      // Process the data according to requirements
      const processedData = processApiData(data);
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
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Datewise latest first
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
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Datewise latest first
          .slice(0, 3) // Limit to 3 posts per category
      })).filter(category => category.posts.length > 0); // Only include categories with posts
    }

    return result;
  };

  // Function to get content type badge
  // const getContentTypeBadge = (contentType) => {
  //   const types = {
  //     video: { text: "Video", class: "video" },
  //     article: { text: "Article", class: "article" }
  //   };

  //   return types[contentType] || { text: "Content", class: "default" };
  // };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle post click - navigate to detail page
  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`, { state: { post } });
  };

  useEffect(() => {
    fetchPosts();
  });

  const totalPosts = posts.trending.length + posts.categories.reduce((sum, cat) => sum + cat.posts.length, 0);
  const totalCategories = posts.categories.length;

  return (
    <>
      <div className="dashboard-container1">
        <h2>Content Dashboard</h2>
        {/* Statistics Overview */}
        <div className="stats-grid">
          <div className="stat-card total">
            <h3>Total Posts</h3>
            <p>{totalPosts}</p>
          </div>

          <div className="stat-card active">
            <h3>Trending Posts</h3>
            <p>{posts.trending.length}</p>
          </div>

          <div className="stat-card categories">
            <h3>Active Categories</h3>
            <p>{totalCategories}</p>
          </div>
        </div>
      </div>
      {/* Trending Posts Section */}
      {posts.trending.length > 0 && (
        <div className="trendsection">
          <h3>🔥 Trending Posts</h3>
          <div className="posts-grid1">
            {posts.trending.map((post, index) => {
              // const contentType = getContentTypeBadge(post.content_type);
              return (
                <div
                  key={`trending-${post.id}`}
                  className="post-card-trend trending"
                  onClick={() => handlePostClick(post)}
                >
                  {post.app_thumbnail && post.app_thumbnail !== "nil" && (
                    <img
                      src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.webp"}
                      className="post-image-trend"
                      alt="post-image"
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop
                        e.target.src = "/assets/lookit.webp"; // fallback local image
                      }}
                    />
                  )}

                  <div className="post-header">
                    <span className="post-title">{post.title}</span>
                    {/* <span className={`content-type ${contentType.class}`}>
                            {contentType.text}
                          </span> */}
                  </div>

                  <div className="post-meta">
                    <span className="date">{formatDate(post.created_at)}</span>
                    {/* <span className="category">{post.category?.name}</span>
                          <span className="likes">❤️ {post.likes_count}</span> */}
                  </div>
                  {/* <p className="post-description">
                        {post.description.length > 150
                          ? `${post.description.substring(0, 150)}...`
                          : post.description
                        }
                      </p> */}
                  {/* <div className="post-footer">
                          {post.youtube_url && post.youtube_url !== "nil" && (
                            <span className="youtube-link">🎥 YouTube</span>
                          )}
                        </div> */}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="dashboard-container">
        {loading ? (
          <p>Loading content data...</p>
        ) : (
          <>
            {/* Categories Section */}
            {posts.categories.map(category => (
              <div key={`category-${category.id}`} className="section">
                <div className="category-header">
                  <h3>{category.name}</h3>
                  {category.image && (
                    <img
                      src={category.image || "/assets/lookit.webp"}
                      alt={category.name}
                      className="category-icon"
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop
                        e.target.src = "/assets/lookit.webp"; // fallback local image
                      }}
                    />
                  )}
                </div>

                <div className="posts-grid">
                  {category.posts.map((post, index) => {
                    // const contentType = getContentTypeBadge(post.content_type);
                    return (
                      <div
                        key={`${category.id}-${post.id}`}
                        className="post-card"
                        onClick={() => handlePostClick(post)}
                      >
                        {post.app_thumbnail && post.app_thumbnail !== "nil" && (
                          <img
                            src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.webp"}
                            alt={post.title}
                            className="post-image"
                            onError={(e) => {
                              e.target.onerror = null; // prevent infinite loop
                              e.target.src = "/assets/lookit.webp"; // fallback local image
                            }}
                          />
                        )}
                        <div className="post-header">
                          <span className="post-title">{post.title}</span>
                          {/* <span className={`content-type ${contentType.class}`}>
                            {contentType.text}
                          </span> */}
                        </div>

                        {/* <p className="post-description">
                          {post.description.length > 120
                            ? `${post.description.substring(0, 120)}...`
                            : post.description
                          }
                        </p> */}

                        <div className="post-footer">
                          <span className="date">{formatDate(post.created_at)}</span>
                          {/* <span className="likes">❤️ {post.likes_count}</span> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {totalPosts === 0 && (
              <div className="no-data">
                <p>No content available at the moment.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;