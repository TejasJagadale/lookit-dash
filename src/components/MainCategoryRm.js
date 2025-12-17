import React, { useState, useEffect } from 'react';
import '../styles/MainCategoryrm.css';
import imageee from "../assets/lookit.webp";
import animationData from "../animation/Car.json";
import Lottie from "lottie-react";

function MainCategoryRm() {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 1000,
        total: 0,
        last_page: 1
    });

    const limitText = (text, max = 50) => {
        if (!text) return "";
        return text.length > max ? text.substring(0, max) + "..." : text;
    };

    // Manual category title mapping
    const categoryTitles = {
        '9': 'INFORMATION',
        '158': 'HEALTH',
        '159': 'HEALTH',
        '160': 'WOMENS CHOICE',
        '161': 'INFORMATION',
        '172': 'EDUCATION',
        '178': 'TECHTIPS',
        '185': 'LAW',
        '190': 'STORY SPOT',
        '195': 'HOW TO APPLY',
        '200': 'SUCCESS STORY',
        '202': 'MOTIVATION',
        '203': 'MOTIVATION',
        '210': 'AI PROMPTS',
        '214': 'SPORTS',
        '224': 'UPDATES'
    };

    // Modified fetch function to handle pagination
    const fetchPosts = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            // Use perPage=1000 and currentPage parameter
            const response = await fetch(
                `https://tnreaders.in/mobile/list-readers-active?perPage=100&currentPage=${page}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setApiResponse(data);
            console.log('API Response for page', page, ':', data);

            // Update pagination state - Note: API returns current_page but we use currentPage in query
            if (data.current_page && data.per_page && data.total && data.last_page) {
                setPagination({
                    currentPage: data.current_page,
                    perPage: data.per_page,
                    total: data.total,
                    last_page: data.last_page
                });
            }

            // Process categories from the flat data array
            const processedCategories = {};

            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(post => {
                    const categoryId = post.category_id;
                    
                    if (!processedCategories[categoryId]) {
                        const categoryName = categoryTitles[categoryId] || 
                                           (post.category?.name || `Category ${categoryId}`);
                        const categoryImage = post.category?.FullImgPath;

                        processedCategories[categoryId] = {
                            id: categoryId,
                            name: categoryName,
                            image: categoryImage,
                            posts: [],
                            categoryInfo: post.category
                        };
                    }
                    
                    processedCategories[categoryId].posts.push(post);
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

    useEffect(() => {
        fetchPosts(); // Initial fetch with page 1
    }, []);

    // Pagination controls component
    const PaginationControls = () => (
        <div className="pagination-controls1">
            <button 
                onClick={() => fetchPosts(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="pagination-btn1"
            >
                Previous
            </button>
            
            <span className="pagination-info1">
                Page {pagination.currentPage} of {pagination.last_page}
                <span className="pagination-details1">
                    (Showing {pagination.perPage} per page)
                </span>
            </span>
            
            <button 
                onClick={() => fetchPosts(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.last_page}
                className="pagination-btn1"
            >
                Next
            </button>

            <div className="page-jump1">
                <span>Jump to page:</span>
                <input 
                    type="number" 
                    min="1" 
                    max={pagination.last_page}
                    defaultValue={pagination.currentPage}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= pagination.last_page) {
                                fetchPosts(page);
                            }
                        }
                    }}
                    className="page-input1"
                />
            </div>
        </div>
    );

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
        <details className="debug-info1">
            <summary>API Response (Debug)</summary>
            <div className="debug-content1">
                <h4>Current Page: {pagination.currentPage}</h4>
                <h4>Total Pages: {pagination.last_page}</h4>
                <h4>Total Items: {pagination.total}</h4>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
        </details>
    );

    const PostCard = ({ post }) => (
        <article className="post-cardm1">
            <div className="post-imagem1">
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
                        e.target.onerror = null;
                        e.target.src = "/assets/lookit.webp";
                    }}
                />
            </div>

            <div className="post-contentm1">
                <h3 className="post-titlem1">{limitText(post.title, 25)}</h3>
                <div className="post-metam1">
                    <span className="post-date1">
                        {formatDate(post.created_at)}
                    </span>
                </div>
                <div className="post-actions1">
                    <a
                        href={post.BlogURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-more-btn1"
                    >
                        Read More
                    </a>
                </div>
            </div>
        </article>
    );

    const CategorySection = ({ categoryId, categoryData }) => (
        <section key={categoryId} className="category-section1">
            <div className="category-headerm1">
                <div className="category-title-wrapper1">
                    <h2 className="category-title1">{categoryData.name}</h2>
                </div>
                <span className="post-count1">{categoryData.posts.length} posts</span>
            </div>

            <div className="posts-gridm1">
                {categoryData.posts.map((post, index) => (
                    <PostCard key={`${post.id}-${index}`} post={post} />
                ))}
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="dashboard-loadingdash1">
                <Lottie className="dashboard-loadingdash1" animationData={animationData} loop={true} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <h2>Error Loading Content</h2>
                <p>{error}</p>
                <button onClick={() => fetchPosts(1)} className="retry-btn1">Try Again</button>
                {apiResponse && <DebugInfo />}
            </div>
        );
    }

    return (
        <div className="App1">
            {/* Pagination controls at the top */}
            <div className="pagination-header1">
                <PaginationControls />
            </div>

            <main className="main-content1">
                {Object.keys(categories).length === 0 ? (
                    <div className="no-posts1">
                        <h2>No Posts Available</h2>
                        <p>No posts were found in the API response.</p>
                        <button onClick={() => fetchPosts(1)} className="retry-btn1">Retry</button>
                        {apiResponse && <DebugInfo />}
                    </div>
                ) : (
                    <div className="categories-containerrm1">
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

            {/* Pagination controls at the bottom */}
            <div className="pagination-footer">
                <PaginationControls />
            </div>
            
            {/* Debug info at bottom */}
            {/* <div className="debug-section">
                <DebugInfo />
            </div> */}
        </div>
    );
}

export default MainCategoryRm;