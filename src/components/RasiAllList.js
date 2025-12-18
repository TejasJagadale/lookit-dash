import React, { useState, useEffect, useCallback } from 'react';
import "../styles/RasiAllList.css"

const RasiAllList = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredRasi, setFilteredRasi] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCalendar, setShowCalendar] = useState(false);
    const [yearlyData, setYearlyData] = useState([]);


    // Edit state
    const [editingRasi, setEditingRasi] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        date: '',
        rasiId: '',
        name: '',
        summary: '',
        luckyNumbers: '',
        lucky_dr: '',
        lucky_color: '',
        prayers: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState({});

    // API endpoints
    const API_ENDPOINTS = {
        daily: 'https://tnreaders.in/mobile/rasi-daily-list',
        weekly: 'https://tnreaders.in/mobile/listWeekly',
        monthly: 'https://tnreaders.in/mobile/listemonthly',
        yearly: 'https://tnreaders.in/mobile/listyearly'
    };

    // Rasi names in Tamil with colors
    const rasiData = {
        "1": { name: "மேஷம்", color: "#FF6B6B", emoji: "🐏" },
        "2": { name: "ரிஷபம்", color: "#4ECDC4", emoji: "🐂" },
        "3": { name: "மிதுனம்", color: "#45B7D1", emoji: "👫" },
        "4": { name: "கடகம்", color: "#96CEB4", emoji: "🦀" },
        "5": { name: "சிம்மம்", color: "#FFEAA7", emoji: "🦁" },
        "6": { name: "கன்னி", color: "#DDA0DD", emoji: "👸" },
        "7": { name: "துலாம்", color: "#98D8C8", emoji: "⚖️" },
        "8": { name: "விருச்சிகம்", color: "#F7DC6F", emoji: "🦂" },
        "9": { name: "தனுசு", color: "#BB8FCE", emoji: "🏹" },
        "10": { name: "மகரம்", color: "#85C1E9", emoji: "🐊" },
        "11": { name: "கும்பம்", color: "#82E0AA", emoji: "🏺" },
        "12": { name: "மீனம்", color: "#F8C471", emoji: "🐟" }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ta-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format date for display
    const formatDate1 = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    console.log(yearlyData);

    // Fetch data based on active tab
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_ENDPOINTS[activeTab]);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Automatically select today's date for daily tab
            if (activeTab === 'daily') {
                const processedData = data || [];
                setDailyData(processedData);

                // Select today's date by default
                const today = getTodayDate();
                const dateExists = processedData.some(item => item.date === today);
                if (dateExists) {
                    setSelectedDate(today);
                } else if (processedData.length > 0) {
                    // Select the first date if today doesn't exist
                    setSelectedDate(processedData[0]?.date || null);
                }
            } else if (activeTab === 'weekly') {
                setWeeklyData(data?.data || []);
            } else if (activeTab === 'monthly') {
                setMonthlyData(data?.data || []);
            }
            else if (activeTab === 'yearly') {
                setYearlyData(data?.data || []);
            }

        } catch (err) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab, fetchData]);

    // Filter and sort daily data
    useEffect(() => {
        if (activeTab === 'daily' && dailyData.length > 0) {
            let result = [...dailyData];

            // Sort by date
            result.sort((a, b) => {
                return sortOrder === 'desc'
                    ? new Date(b.date) - new Date(a.date)
                    : new Date(a.date) - new Date(b.date);
            });

            setFilteredRasi(result);
        }
    }, [dailyData, activeTab, sortOrder]);

    // Handle edit button click
    const handleEditClick = (rasi, date) => {
        setEditingRasi({ ...rasi, date });
        setIsEditing(true);
        setEditForm({
            date: date,
            rasiId: rasi.rasiId || '',
            name: rasi.name || '',
            summary: rasi.summary || '',
            luckyNumbers: rasi.luckyNumbers || '',
            lucky_dr: rasi.lucky_dr || '',
            lucky_color: rasi.lucky_color || '',
            image: null
        });
        setImagePreview(rasi.imageUrl || '');
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission for update
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            Object.keys(editForm).forEach(key => {
                if (key === 'image' && editForm[key]) {
                    formData.append('image', editForm[key]);
                } else if (editForm[key] !== null && editForm[key] !== undefined) {
                    const backendKey = key === 'rasiId' ? 'rasi_id' :
                        key === 'luckyNumbers' ? 'lucky_numbers' : key;
                    formData.append(backendKey, editForm[key]);
                }
            });

            const response = await fetch('https://tnreaders.in/mobile/rasi-daily-update', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Update failed with status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Update Result:', result);

            if (result.success) {
                alert('Rasi updated successfully!');
                setIsEditing(false);
                setEditingRasi(null);
                fetchData();
            } else {
                alert(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert(`Failed to update Rasi: ${error.message}`);
        }
    };

    // Handle status toggle with confirmation
    const handleStatusToggle = async (date, currentStatus) => {
        if (!date) return;

        const newStatus = currentStatus === 'allow' ? 'disallow' : 'allow';
        const confirmMessage = `Are you sure you want to ${newStatus === 'allow' ? 'enable' : 'disable'} predictions for ${formatDate(date)}?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        const statusId = isUpdatingStatus[date];
        if (statusId) {
            clearTimeout(statusId);
        }

        // Optimistic update
        const updatedDailyData = dailyData.map(item => {
            if (item.date === date) {
                return { ...item, status: newStatus };
            }
            return item;
        });
        setDailyData(updatedDailyData);

        setIsUpdatingStatus(prev => ({
            ...prev,
            [date]: setTimeout(() => {
                setIsUpdatingStatus(prev => {
                    const newState = { ...prev };
                    delete newState[date];
                    return newState;
                });
            }, 2000)
        }));

        try {
            const response = await fetch(
                `https://tnreaders.in/mobile/rasi-daily-status?date=${date}&status=${newStatus}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error('Status update failed');
            }

            const result = await response.json();

            if (!result.success) {
                // Revert on failure
                const revertedData = dailyData.map(item => {
                    if (item.date === date) {
                        return { ...item, status: currentStatus };
                    }
                    return item;
                });
                setDailyData(revertedData);
                alert('Failed to update status');
            } else {
                alert(`Status updated to ${newStatus === 'allow' ? 'Enabled' : 'Disabled'}`);
            }
        } catch (error) {
            console.error('Status toggle error:', error);
            const revertedData = dailyData.map(item => {
                if (item.date === date) {
                    return { ...item, status: currentStatus };
                }
                return item;
            });
            setDailyData(revertedData);
            alert('Failed to update status');
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingRasi(null);
        setEditForm({
            date: '',
            rasiId: '',
            name: '',
            summary: '',
            luckyNumbers: '',
            lucky_dr: '',
            lucky_color: '',
            image: null
        });
        setImagePreview('');
    };

    const getMonthlyRasiId = (rasi) => {
        return rasi.rasiId || rasi.rasi || '';
    };

    const getYearlyRasiId = (rasi) => {
        return rasi?.rasiId || rasi?.rasi || '';
    };

    const renderComplexValue = (value) => {
        if (!value) return '—';

        if (Array.isArray(value)) {
            if (!value.length) return '—';
            return value.map((obj, i) => (
                <div key={i} className="kv-row">
                    {Object.entries(obj).map(([k, v]) => (
                        <div key={k}>
                            <strong>{k}:</strong> {v}
                        </div>
                    ))}
                </div>
            ));
        }

        return value;
    };


    // Render Daily Content
    const renderDailyContent = () => {
        if (!dailyData.length) return <div className="no-data">No daily data available</div>;

        const groupedByDate = dailyData.reduce((acc, item) => {
            acc[item.date] = item;
            return acc;
        }, {});

        return (
            <div className="daily-container">
                {/* Edit Form Modal */}
                {isEditing && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>✏️ Edit Rasi Prediction</h3>
                                <button className="close-btn" onClick={handleCancelEdit}>×</button>
                            </div>
                            <form onSubmit={handleUpdateSubmit} className="edit-form">
                                <div className="form-group">
                                    <label>Date:</label>
                                    <input
                                        type="text"
                                        name="date"
                                        value={formatDate(editForm.date)}
                                        className="form-input"
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Select Rasi:</label>
                                    <select
                                        name="rasiId"
                                        value={editForm.rasiId}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select Rasi</option>
                                        {Object.entries(rasiData).map(([id, data]) => (
                                            <option key={id} value={id}>
                                                {data.emoji} {data.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Rasi Name:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter Rasi name in Tamil"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Summary:</label>
                                    <textarea
                                        name="summary"
                                        value={editForm.summary}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Enter prediction summary in Tamil"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>🎲 Lucky Numbers:</label>
                                        <input
                                            type="text"
                                            name="luckyNumbers"
                                            value={editForm.luckyNumbers}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., 5, 12, 24"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>🎨 Lucky Color:</label>
                                        <input
                                            type="text"
                                            name="lucky_color"
                                            value={editForm.lucky_color}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., சிவப்பு"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>🧭 Lucky Direction:</label>
                                    <input
                                        type="text"
                                        name="lucky_dr"
                                        value={editForm.lucky_dr}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., வடக்கு"
                                        required
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Rasi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Date Selector with Calendar View */}
                <div className="date-selector-container">
                    <div className="date-selector-header">
                        <h3>📅 Select Date</h3>
                    </div>

                    {showCalendar && (
                        <div className="calendar-view">
                            {filteredRasi.map((item) => (
                                <div
                                    key={item.date}
                                    className={`calendar-date ${selectedDate === item.date ? 'selected' : ''}`}
                                    onClick={() => setSelectedDate(item.date)}
                                >
                                    <div className="calendar-date-day">
                                        {new Date(item.date).getDate()}
                                    </div>
                                    <div className="calendar-date-month">
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </div>
                                    <div className={`calendar-status ${item.status}`}>
                                        {item.status === 'allow' ? '✓' : '✗'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="date-scroll">
                        {filteredRasi.map(item => (
                            <div key={item.date} className="date-item">
                                <button
                                    className={`date-btn ${selectedDate === item.date ? 'active' : ''}`}
                                    onClick={() => setSelectedDate(item.date === selectedDate ? null : item.date)}
                                >
                                    <div className="date-btn-content">
                                        <div className="date-btn-full-date">
                                            {formatDate1(item.date)}
                                        </div>
                                        <div className="date-btn-weekday">
                                            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                    </div>
                                </button>

                                <div className="status-control">
                                    <span className={`status-badge ${item.status}`}>
                                        {item.status === 'allow' ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <button
                                        className={`status-toggle ${item.status === 'allow' ? 'allowed' : 'disallowed'}`}
                                        onClick={() => handleStatusToggle(item.date, item.status)}
                                        disabled={isUpdatingStatus[item.date]}
                                        title={`${item.status === 'allow' ? 'Disable' : 'Enable'} predictions`}
                                    >
                                        {isUpdatingStatus[item.date] ? (
                                            <span className="loading-spinner"></span>
                                        ) : (
                                            item.status === 'allow' ? 'Disable' : 'Enable'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rasi List */}
                <div className="rasi-list-container">
                    {selectedDate && groupedByDate[selectedDate] && (
                        <div className="date-group">
                            <div className="date-header-container">
                                <div className="date-header-main">
                                    <h2 className="date-header">{formatDate(selectedDate)}</h2>
                                    <span className="total-rasi">
                                        {groupedByDate[selectedDate].data?.length || 0} Rasis
                                    </span>
                                </div>

                                <div className="date-actions">
                                    <span className={`global-status ${groupedByDate[selectedDate].status}`}>
                                        Status: {groupedByDate[selectedDate].status === 'allow' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="rasi-grid">
                                {groupedByDate[selectedDate].data?.map((rasi, index) => {
                                    const rasiInfo = rasiData[rasi.rasiId] || { name: rasi.name, color: '#666', emoji: '⭐' };

                                    return (
                                        <div
                                            key={`${selectedDate}-${index}`}
                                            className="rasi-card1"
                                            style={{ borderLeftColor: rasiInfo.color }}
                                        >
                                            <div className="card-header1">
                                                <div className="card-header-top">
                                                    <div className="rasi-title">
                                                        <div className="rasi-emoji">{rasiInfo.emoji}</div>
                                                        <div>
                                                            <h4>{rasi.name || rasiInfo.name}</h4>
                                                            <div className="rasi-id">Rasi ID: {rasi.rasiId}</div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(rasi, selectedDate)}
                                                        title="Edit Rasi"
                                                    >
                                                        <span className="edit-icon">✏️</span>
                                                        Edit
                                                    </button>
                                                </div>

                                                <div className="lucky-info-grid">
                                                    <div className="lucky-item">
                                                        <span className="lucky-icon">🎲</span>
                                                        <div>
                                                            <div className="lucky-label">அதிர்ஷ்ட எண்கள்</div>
                                                            <div className="lucky-value">{rasi.luckyNumbers}</div>
                                                        </div>
                                                    </div>

                                                    <div className="lucky-item">
                                                        <span className="lucky-icon">🧭</span>
                                                        <div>
                                                            <div className="lucky-label">நல்ல திசை</div>
                                                            <div className="lucky-value">{rasi.lucky_dr}</div>
                                                        </div>
                                                    </div>

                                                    <div className="lucky-item">
                                                        <span className="lucky-icon">🎨</span>
                                                        <div>
                                                            <div className="lucky-label">நல்ல நிறம்</div>
                                                            <div className="lucky-value">{rasi.lucky_color}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card-content">
                                                <div className="summary-section">
                                                    <h5>
                                                        <span className="summary-icon">📜</span>
                                                        ராசி பலன்
                                                    </h5>
                                                    <p className="summary-text">{rasi.summary}</p>
                                                </div>

                                                {rasi.imageUrl && (
                                                    <div className="image-section">
                                                        <div className="image-header">
                                                            <span className="image-icon">🖼️</span>
                                                            <span>ராசி படம்</span>
                                                        </div>
                                                        <img
                                                            src={rasi.imageUrl}
                                                            alt={rasi.name}
                                                            className="rasi-image"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Weekly Content
    const renderWeeklyContent = () => {
        if (!weeklyData.length) return <div className="no-data">No weekly data available</div>;

        return (
            <div className="weekly-container">
                <div className="period-info">
                    <h2>📅 Weekly Predictions</h2>
                    <p className="info-text">Weekly predictions are updated every Monday</p>
                </div>

                {weeklyData.map((week, index) => (
                    <div key={week.id || index} className="week-group">
                        <div className="period-header-container">
                            <h3 className="period-header">
                                <span className="period-icon">🗓️</span>
                                {week.date}
                            </h3>
                            {/* <span className="period-count">
                                {week.rasi?.length || 0} 
                            </span> */}
                        </div>

                        <div className="rasi-grid">
                            {week.rasi?.map((rasi, rasiIndex) => (
                                <div key={rasiIndex} className="rasi-card1 weekly-card">
                                    <div className="card-header">
                                        <div className="rasi-title">
                                            <div className="rasi-emoji">{rasiData[rasi.rasi]?.emoji || '⭐'}</div>
                                            <h4>{rasi.name || rasiData[rasi.rasi]?.name || `ராசி ${rasi.rasi}`}</h4>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <div className="info-section">
                                            <div className="info-item">
                                                <h5>
                                                    <span className="info-icon">🌟</span>
                                                    கிரகணம்
                                                </h5>
                                                <p>{rasi.kiraganam}</p>
                                            </div>

                                            <div className="info-item">
                                                <h5>
                                                    <span className="info-icon">📈</span>
                                                    வாராந்திர கிரகணம்
                                                </h5>
                                                <p>{rasi.weekly_kiraganam}</p>
                                            </div>

                                            <div className="info-item">
                                                <h5>
                                                    <span className="info-icon">👍</span>
                                                    நன்மைகள்
                                                </h5>
                                                <p>{rasi.advantages}</p>
                                            </div>

                                            <div className="info-item">
                                                <h5>
                                                    <span className="info-icon">🙏</span>
                                                    பிரார்த்தனைகள்
                                                </h5>
                                                <p>{rasi.prayers}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthlyContent = () => {
        if (!monthlyData.length) {
            return <div className="no-data">No monthly data available</div>;
        }

        return (
            <div className="monthly-container">
                <div className="period-info">
                    <h2>📅 Monthly Predictions</h2>
                    <p className="info-text">Monthly rasi palan grouped by month / year</p>
                </div>

                {monthlyData.map((month, index) => (
                    <div key={month.id || index} className="month-group">

                        {/* Month Header */}
                        <div className="period-header-container">
                            <h3 className="period-header">
                                <span className="period-icon">🗓️</span>
                                {month.date}
                            </h3>

                            <div className="period-meta">
                                <span className="lang-badge">
                                    {month.mon_lan === 'tamil' ? 'தமிழ்' : 'English'}
                                </span>
                                {/* <span className="period-count">
                                    {month.rasi?.length || 0} Rasis
                                </span> */}
                            </div>
                        </div>

                        {/* Rasi Cards */}
                        <div className="rasi-grid">
                            {month.rasi?.map((rasi, rasiIndex) => {
                                const rasiId = getMonthlyRasiId(rasi);
                                const rasiInfo = rasiData[rasiId] || {
                                    name: rasi.name || 'ராசி',
                                    emoji: '⭐',
                                    color: '#999'
                                };

                                return (
                                    <div
                                        key={rasiIndex}
                                        className="rasi-card1 monthly-card"
                                        style={{ borderLeftColor: rasiInfo.color }}
                                    >
                                        {/* Header */}
                                        <div className="card-header">
                                            <div className="rasi-title">
                                                <div className="rasi-emoji">{rasiInfo.emoji}</div>
                                                <div>
                                                    <h4>{rasi.name || rasiInfo.name}</h4>
                                                    {rasiId && (
                                                        <div className="rasi-id">Rasi ID: {rasiId}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="card-content">
                                            <div className="info-section">
                                                <div className="info-item">
                                                    <h5>🌟 கிரகணம்</h5>
                                                    <p>{rasi.kiraganam || '—'}</p>
                                                </div>

                                                <div className="info-item">
                                                    <h5>🙏 பிரார்த்தனைகள்</h5>
                                                    <p>{rasi.prayers || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Image */}
                                            {rasi.imageUrl && (
                                                <div className="image-section">
                                                    <img
                                                        src={rasi.imageUrl}
                                                        alt={rasi.name}
                                                        className="rasi-image"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderYearlyContent = () => {
        if (!yearlyData.length) {
            return <div className="no-data">No yearly data available</div>;
        }

        return (
            <div className="yearly-container">
                <div className="period-info">
                    <h2>📆 Yearly Predictions</h2>
                    <p className="info-text">Complete yearly rasi palan overview</p>
                </div>

                {yearlyData.map((yearItem, index) => (
                    <div key={yearItem.id || index} className="year-group">

                        {/* Year Header */}
                        <div className="period-header-container">
                            <h3 className="period-header">
                                <span className="period-icon">📅</span>
                                {yearItem.date}
                            </h3>

                            <div className="period-meta">
                                <span className={`status-badge ${yearItem.Status ? 'allow' : 'disallow'}`}>
                                    {yearItem.Status ? 'Active' : 'Inactive'}
                                </span>
                                <span className="lang-badge">
                                    {yearItem.mon_lan === 'tamil' ? 'தமிழ்' : 'English'}
                                </span>
                                {/* <span className="period-count">
                                    {yearItem.rasi?.length || 0} Rasis
                                </span> */}
                            </div>
                        </div>

                        {/* Rasi Cards */}
                        <div className="rasi-grid">
                            {yearItem.rasi?.map((rasi, rasiIndex) => {
                                const rasiId = getYearlyRasiId(rasi);
                                const rasiInfo = rasiData[rasiId] || {
                                    name: rasi.name || 'ராசி',
                                    emoji: '⭐',
                                    color: '#888'
                                };

                                return (
                                    <div
                                        key={rasiIndex}
                                        className="rasi-card1 yearly-card"
                                        style={{ borderLeftColor: rasiInfo.color }}
                                    >
                                        {/* Header */}
                                        <div className="card-header">
                                            <div className="rasi-title">
                                                <div className="rasi-emoji">{rasiInfo.emoji}</div>
                                                <div>
                                                    <h4>{rasi.name || rasiInfo.name}</h4>
                                                    <div className="rasi-id">Rasi ID: {rasiId}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="card-content">
                                            <div className="info-section">

                                                <div className="info-item">
                                                    <h5>🌟 கிரகணம்</h5>
                                                    {renderComplexValue(rasi.kiraganam)}
                                                </div>

                                                <div className="info-item">
                                                    <h5>👁️ கிரகணம் (Eye)</h5>
                                                    {renderComplexValue(rasi.kiraganam_eye)}
                                                </div>

                                                {rasi.rasi_des && (
                                                    <div className="info-item">
                                                        <h5>📜 ராசி விளக்கம்</h5>
                                                        <p>{rasi.rasi_des}</p>
                                                    </div>
                                                )}

                                                {[
                                                    'advantages',
                                                    'Officers',
                                                    'Traders',
                                                    'Pengal',
                                                    'politician',
                                                    'artist',
                                                    'students',
                                                    'Good',
                                                    'Attention'
                                                ].map(key => (
                                                    rasi[key] && (
                                                        <div className="info-item" key={key}>
                                                            <h5>{key}</h5>
                                                            <p>{rasi[key]}</p>
                                                        </div>
                                                    )
                                                ))}

                                                <div className="info-item">
                                                    <h5>🙏 பிரார்த்தனைகள்</h5>
                                                    <p>{rasi.prayers || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Image */}
                                            {rasi.imageUrl && (
                                                <div className="image-section">
                                                    <img
                                                        src={rasi.imageUrl}
                                                        alt={rasi.name}
                                                        className="rasi-image"
                                                        onError={(e) => (e.target.style.display = 'none')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    // Render Loading State
    const renderLoading = () => (
        <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Loading {activeTab} predictions...</p>
            <p className="loading-subtext">Please wait while we fetch the latest data</p>
        </div>
    );

    // Render Error State
    const renderError = () => (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchData}>
                🔄 Retry
            </button>
            <p className="error-help">
                If the problem persists, please check your internet connection
            </p>
        </div>
    );

    // Render Empty State
    const renderEmptyState = () => (
        <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Data Available</h3>
            <p>There are no {activeTab} predictions to display at the moment.</p>
            <p className="empty-subtext">Please check back later or try another tab.</p>
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        if (loading) {
            return renderLoading();
        }

        if (error) {
            return renderError();
        }

        switch (activeTab) {
            case 'daily':
                if (!dailyData.length) return renderEmptyState();
                return renderDailyContent();
            case 'weekly':
                if (!weeklyData.length) return renderEmptyState();
                return renderWeeklyContent();
            case 'monthly':
                if (!monthlyData.length) return renderEmptyState();
                return renderMonthlyContent();
            case 'yearly':
                if (!yearlyData.length) return renderEmptyState();
                return renderYearlyContent();
            default:
                return null;
        }
    };

    return (
        <div className="rasi-all-list-container">
            <div className="container">
                {/* Header */}
                <header className="main-header">
                    <h1 className="main-title">
                        <span className="title-icon">⭐</span>
                        ராசி பலன்
                    </h1>
                    <p className="subtitle">
                        Daily, Weekly & Monthly Rasi Predictions in Tamil
                    </p>
                </header>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('daily');
                                setSelectedDate(null);
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📅</span>
                            Daily
                        </button>
                        <button
                            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('weekly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📊</span>
                            Weekly
                        </button>
                        <button
                            className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('monthly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📈</span>
                            Monthly
                        </button>
                        <button
                            className={`tab ${activeTab === 'yearly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('yearly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📆</span>
                            Yearly
                        </button>

                    </div>
                </div>

                {/* Content */}
                <div className="content-container">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default RasiAllList;