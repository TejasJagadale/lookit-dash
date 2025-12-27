import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/categoryposts.css";

const CategoryPosts = () => {
    const { parentId } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://tnreaders.in/api/user/mainhomepost")
            .then((res) => res.json())
            .then((data) => {
                const trending = data.trendingposts || [];

                // Convert homepageposts into an array
                const homepage = Object.values(data.homepageposts || {}).flat();

                // Merge all posts
                let all = [...trending, ...homepage];

                // Filter only posts that match the parent category
                const matched = all.filter(
                    (p) => p.category?.parent_id == parentId
                );

                // Sort → Latest first
                const sorted = matched.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                setPosts(sorted);
                setLoading(false);
            })
            .catch((err) => {
                console.log("MainHomePost API Error:", err);
                setLoading(false);
            });
    }, [parentId]);

    if (loading) return <p className="loading">Loading...</p>;

    return (
        <>
            <h2 className="header-title">Category Posts</h2>
            <div className="post-page">

                {posts.length === 0 ? (
                    <p className="no-posts">No posts found</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="post-card">

                            {/* Main Image */}
                            <div className="img-wrap">
                                <img
                                    src={
                                        post.web_thumbnail ||
                                        post.app_thumbnail ||
                                        post.FullImgPath ||
                                        "https://via.placeholder.com/400x200/cccccc/000?text=No+Image"
                                    }
                                    className="post-img"
                                    alt={post.title}
                                    onError={(e) => {
                                        e.target.src =
                                            "https://via.placeholder.com/400x200/cccccc/000?text=No+Image";
                                    }}
                                />
                            </div>

                            <div className="post-info">
                                {/* Title */}
                                <h3 className="post-title">{post.title}</h3>

                                {/* Description */}
                                <p className="post-description">
                                    {post.description?.length > 120
                                        ? post.description.substring(0, 120) + "..."
                                        : post.description}
                                </p>

                                {/* Meta Row */}
                                <div className="post-meta">
                                    <span className="meta-item">❤️ {post.likes_count}</span>
                                    <span className="meta-item">💬 {post.comment_count}</span>
                                    <span className="meta-item">📅 {post.created_at?.slice(0, 10)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default CategoryPosts;
