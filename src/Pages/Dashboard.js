import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import animationData from "../animation/lottie.json";
import "../styles/dashboard.css";
import Lottie from "lottie-react";

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
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle post click - navigate to detail page
  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`, { state: { post } });
  };

  // Handle view all for categories
  const handleViewAll = (category) => {
    navigate(`/category/${category.id}`, {
      state: {
        category: {
          ...category,
          posts: category.posts // Pass the current posts to avoid immediate API call
        }
      }
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Limit text to specific characters
  const limitText = (text, max = 50) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const totalPosts = posts.trending.length + posts.categories.reduce((sum, cat) => sum + cat.posts.length, 0);
  const totalCategories = posts.categories.length;

  if (loading) {
    return (
      <div className="dashboard-loadingdash">
        <Lottie className="dashboard-loadingdash" animationData={animationData} loop={true} />
      </div>
    );
  }

  return (
    <div className="professional-dashboarddash">
      {/* Header Section */}
      <div className="dashboard-headerdash">
        <div className="header-contentdash">
          <h1>Content Dashboard</h1>
          <p>Manage and monitor your content performance</p>
        </div>
        <div className="header-statsdash">
          <div className="stat-badgedash">
            <span className="stat-numberdash">{totalPosts}</span>
            <span className="stat-labeldash">Total Posts</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-maindash">
        {/* Statistics Overview */}
        <div className="stats-sectiondash">
          <div className="stats-griddash">
            <div className="stat-carddash">
              <div className="stat-icondash totaldash">
                {/* <i className="icon-postdash">📄</i> */}
                <img className="icon-postdash" src="/svg/post.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{totalPosts}</h3>
                <p>Total Posts</p>
              </div>
            </div>

            <div className="stat-carddash">
              <div className="stat-icondash trendingdash">
                {/* <i className="icon-trendingdash">🔥</i> */}
                <img className="icon-postdash" src="/svg/trend.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{posts.trending.length}</h3>
                <p>Trending Posts</p>
              </div>
            </div>

            <div className="stat-carddash">
              <div className="stat-icondash categoriesdash">
                {/* <i className="icon-categorydash">📂</i> */}
                <img className="icon-postdash" src="/svg/category.svg" alt="" />
              </div>
              <div className="stat-infodash">
                <h3>{totalCategories}</h3>
                <p>Active Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Posts Section */}
        {posts.trending.length > 0 && (
          <div className="section-carddash trending-sectiondash">
            <div className="section-headerdash">
              <div className="section-titledash">
                <span className="title-icondash">🔥</span>
                <h2>Trending Content</h2>
              </div>
              {/* <div className="section-badgedash">
                {posts.trending.length} posts
              </div> */}
            </div>
            <div className="trending-griddash">
              {posts.trending.map((post, index) => (
                <div
                  key={`trending-${post.id}`}
                  className="trending-carddash"
                  onClick={() => handlePostClick(post)}
                >
                  {/* <div className="card-headerdash">
                    <span className="trending-badgedash">Trending #{index + 1}</span>
                  </div> */}
                  <div className="card-imagedash">
                    <img
                      src={post.app_thumbnail || post.web_thumbnail || "/assets/lookit.webp"}
                      alt={post.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/lookit.webp";
                      }}
                    />
                  </div>
                  {/* <div className="card-contentdash">
                    <h4 className="post-titledash">{limitText(post.title, 30)}</h4>
                    <div className="post-metadash">
                      <span className="datedash">{formatDate(post.created_at)}</span>
                    </div>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        )}

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
                  className="view-all-btndash"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;