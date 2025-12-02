import React from 'react';
import '../styles/dashboard.css';
import '../styles/SubCategory.css';
import SubCategory from './SubCategory';
import AddArticle from './AddArticle';
import Listarticle from './Listarticle';
import List from './List';
import NotificationList from './NotificationList';
import ScheduleForm from './ScheduleForm';

const MainContent = ({ activeMenu }) => {
  const [categories, setCategories] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [apiResponse, setApiResponse] = React.useState(null);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const response = await fetch('https://tnreaders.in/api/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        console.log(data);
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
      setDashboardLoading(false);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setDashboardLoading(false);
    }
  };

  // Simple bar chart component
  const BarChart = ({ data, color, height = 40 }) => {
    if (!data || data.length === 0) {
      return <div className="bar-chart" style={{ height: `${height}px` }}>No data</div>;
    }

    const maxValue = Math.max(...data);
    return (
      <div className="bar-chart" style={{ height: `${height}px` }}>
        {data.map((value, index) => (
          <div
            key={index}
            className="bar"
            style={{
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: color
            }}
            title={`Value: ${value}`}
          />
        ))}
      </div>
    );
  };

  // Stat card component
  const StatCard = ({ title, value, change, icon, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p>{title}</p>
        {change !== undefined && (
          <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );

  // Activity item component (using last three posts as recent activities)
  const ActivityItem = ({ activity }) => (
    <div className="activity-item info">
      <div className="activity-icon">
        📝
      </div>
      <div className="activity-content">
        <p className="activity-action">New Post Published</p>
        <p className="activity-meta">
          {activity.title?.substring(0, 30)}...
        </p>
      </div>
    </div>
  );

  // Top post card component
  const TopPostCard = ({ post }) => (
    <div className="top-post-card">
      <div className="post-header">
        <h4 title={post.title}>{post.title?.substring(0, 40)}...</h4>
        <span className="post-category">{post.category?.name}</span>
      </div>
      <div className="post-stats">
        <div className="stat">
          <span className="stat-icon">👁️</span>
          <span>{post.view_count || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">❤️</span>
          <span>{post.likes_count || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💬</span>
          <span>{post.comment_count || 0}</span>
        </div>
      </div>
    </div>
  );

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

  React.useEffect(() => {
    if (activeMenu === 'Main-Category') {
      fetchPosts();
    } else if (activeMenu === 'Dashboard') {
      fetchDashboardData();
    }
  }, [activeMenu]);

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
      <div className="post-imagem">
        <img
          src={
            post.web_thumbnail ||
            post.FullImgPath ||
            post.img ||
            "/assets/lookit.webp"
          }
          alt="post-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/lookit.webp";
          }}
        />
      </div>

      <div className="post-contentm">
        <h3 className="post-titlem">{limitText(post.title, 25)}</h3>
        <div className="post-metam">
          <span className="post-date">
            {formatDate(post.created_at)}
          </span>
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
      </div>
      <div className="posts-gridm">
        {categoryData.posts.map((post, index) => (
          <PostCard key={`${post.id}-${index}`} post={post} />
        ))}
      </div>
    </section>
  );

  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <div className="dashboard-loadingdash">
          Loading dashboard data...
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="error">
          <h2>Error Loading Dashboard</h2>
          <p>Unable to load dashboard data</p>
          <button onClick={fetchDashboardData} className="retry-btn">Try Again</button>
        </div>
      );
    }

    // Generate mock weekly data for charts based on actual data
    const generateWeeklyData = (baseValue) => {
      return Array(7).fill(0).map(() =>
        Math.floor(baseValue / 7) + Math.floor(Math.random() * (baseValue / 14))
      );
    };

    const weeklyViews = generateWeeklyData(parseInt(dashboardData.total_views) || 100);
    const weeklyPosts = generateWeeklyData(dashboardData.total_posts || 0);

    return (
      <div className="dashboard-container1">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-content">
            <h1>Welcome to LookIt Dashboard! 🎉</h1>
            <p>Here's what's happening with your content today</p>
          </div>
          <div className="welcome-actions">
            <button className="btn-primary" onClick={() => window.location.hash = '#Add Article'}>
              Create New Post
            </button>
            <button className="btn-secondary">View Analytics</button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Views"
            value={parseInt(dashboardData.total_views) || 0}
            change={12.5}
            icon="👁️"
            color="#667eea"
          />
          <StatCard
            title="Total Posts"
            value={dashboardData.total_posts || 0}
            change={8.2}
            icon="📝"
            color="#764ba2"
          />
          <StatCard
            title="Active Users"
            value={dashboardData.active_users || 0}
            change={15.3}
            icon="👥"
            color="#f093fb"
          />
          <StatCard
            title="Engagement Rate"
            value={Math.round((dashboardData.active_users / (dashboardData.total_posts || 1)) * 100) || 0}
            change={3.7}
            icon="💫"
            color="#4ecdc4"
          />
        </div>

        {/* Charts and Analytics Section */}
        <div className="analytics-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Weekly Views Overview</h3>
              <select className="time-filter">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <BarChart data={weeklyViews} color="#667eea" height={120} />
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <span key={day} className="chart-label">{day}</span>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Content Distribution</h3>
            </div>
            <div className="category-distribution">
              {dashboardData.category_wise_post_count?.map((category, index) => (
                <div key={category.category_id} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-percentage">
                      {category.post_count}
                    </span>
                  </div>
                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{
                        width: `${((category.post_count))}%`,
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#ff6b6b'][index % 5]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          {/* Recent Activities - Using last three posts */}
          <div className="activities-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <button className="view-all-btn" onClick={() => window.location.hash = '#List & Edit Articles'}>
                View All
              </button>
            </div>
            <div className="activities-list">
              {dashboardData.last_three_posts?.map((post, index) => (
                <ActivityItem key={post.id || index} activity={post} />
              ))}
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="top-posts-card">
            <div className="card-header">
              <h3>Recent Posts</h3>
              <button className="view-all-btn" onClick={() => window.location.hash = '#List & Edit Articles'}>
                View All
              </button>
            </div>
            <div className="top-posts-list">
              {dashboardData.last_three_posts?.map((post) => (
                <TopPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => window.location.hash = '#Add Article'}
              >
                <span className="action-icon">📝</span>
                <span>Write Article</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>View Analytics</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">👥</span>
                <span>Manage Users</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return renderDashboard();

      case 'Main-Category':
        if (loading) {
          return (
            <div className="dashboard-loadingdash">
              Loading content...
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
          <div className="main-category-content">
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
          </div>
        );

      case 'sub-Category':
        return <SubCategory />;

      case 'Article':
        return <h2>Article Management</h2>;
      case 'Add Article':
        return <AddArticle />;
      case 'List':
        return <List />;
      case 'List & Edit Articles':
        return <Listarticle />;
      case 'Notifications':
        return <NotificationList />;
      case 'Schedule':
        return <ScheduleForm />;
      default:
        return <h2>{activeMenu} Content</h2>;
    }
  };

  return (
    <main className="main-content">
      <div className="content-body">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;