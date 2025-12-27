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
    const [kiraganamRows, setKiraganamRows] = useState([{}]);
    const [kiraganamEyeRows, setKiraganamEyeRows] = useState([{}]);

    // Edit state
    const [editingRasi, setEditingRasi] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState('daily');
    const [editForm, setEditForm] = useState({
        id: '',
        date: '',
        duration: '',
        rasiId: '',
        rasiId: '',
        rasi: '',
        name: '',
        summary: '',
        luckyNumbers: '',
        lucky_dr: '',
        lucky_color: '',
        kiraganam: '',
        kiraganam_eye: '',
        weekly_kiraganam: '',
        advantages: '',
        prayers: '',
        image: null,
        mon_lan: 'tamil',
        rasi_des: '',
        Officers: '',
        Traders: '',
        Pengal: '',
        politician: '',
        artist: '',
        students: '',
        Good: '',
        Attention: '',
        Police: '',
        Note: ''
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

    // Update APIs
    const UPDATE_API_ENDPOINTS = {
        daily: 'https://tnreaders.in/mobile/rasi-daily-update',
        weekly: 'https://tnreaders.in/mobile/weekly/update',
        monthly: 'https://tnreaders.in/mobile/update/monthly',
        yearly: 'https://tnreaders.in/mobile/yearly/update'
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

    // Format date for display (DD-MM-YYYY)
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

    // Helper functions for dynamic tables
    const getKiraganamHeaders = () => {
        if (kiraganamRows.length === 0) return [];
        return Object.keys(kiraganamRows[0]);
    };

    const getKiraganamEyeHeaders = () => {
        if (kiraganamEyeRows.length === 0) return [];
        return Object.keys(kiraganamEyeRows[0]);
    };

    const addKiraganamRow = () => {
        const newRow = {};
        getKiraganamHeaders().forEach(header => {
            newRow[header] = '';
        });
        setKiraganamRows([...kiraganamRows, newRow]);
    };

    const addKiraganamEyeRow = () => {
        const newRow = {};
        getKiraganamEyeHeaders().forEach(header => {
            newRow[header] = '';
        });
        setKiraganamEyeRows([...kiraganamEyeRows, newRow]);
    };

    const removeKiraganamRow = (index) => {
        const newRows = [...kiraganamRows];
        newRows.splice(index, 1);
        setKiraganamRows(newRows);
    };

    const removeKiraganamEyeRow = (index) => {
        const newRows = [...kiraganamEyeRows];
        newRows.splice(index, 1);
        setKiraganamEyeRows(newRows);
    };

    const handleKiraganamChange = (rowIndex, header, value) => {
        const newRows = [...kiraganamRows];
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            [header]: value
        };
        setKiraganamRows(newRows);
    };

    const handleKiraganamEyeChange = (rowIndex, header, value) => {
        const newRows = [...kiraganamEyeRows];
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            [header]: value
        };
        setKiraganamEyeRows(newRows);
    };

    // Update the handleEditClick function to ensure we're getting the right ID
    const handleEditClick = (rasi, mode, parentData = null, id = null) => {
        setEditMode(mode);
        setEditingRasi(rasi);
        setIsEditing(true);

        // Get the ID - for all modes, we use the passed ID or rasi.id
        let recordId = id;

        // Try to get ID from different sources based on mode
        if (!recordId) {
            switch (mode) {
                case 'daily':
                    // For daily, it's the parent ID (date group ID)
                    recordId = parentData?.id || rasi.id;
                    break;
                case 'weekly':
                    // For weekly, try rasi.id first, then parent id
                    recordId = rasi.id || parentData?.id;
                    break;
                case 'monthly':
                    // For monthly, it's the parent ID (month group ID)
                    recordId = parentData?.id || rasi.id;
                    break;
                case 'yearly':
                    // For yearly, try rasi.id first, then parent id
                    recordId = rasi.id || parentData?.id;
                    break;
            }
        }

        let formData = {
            id: recordId || '',
            date: '',
            duration: '',
            rasiId: '',
            name: '',
            summary: '',
            luckyNumbers: '',
            lucky_dr: '',
            lucky_color: '',
            kiraganam: '',
            kiraganam_eye: '',
            weekly_kiraganam: '',
            advantages: '',
            prayers: '',
            image: null,
            mon_lan: 'tamil',
            rasi_des: '',
            Officers: '',
            Traders: '',
            Pengal: '',
            politician: '',
            artist: '',
            students: '',
            Good: '',
            Attention: '',
            Police: '',
            Note: ''
        };

        // Set rasi and rasiId based on data
        const rasiValue = rasi.rasiId || rasi.rasi || '';
        formData.rasi = rasiValue;
        formData.rasiId = rasiValue;

        // Set name
        formData.name = rasi.name || '';

        // Set image preview if exists
        if (rasi.imageUrl) {
            setImagePreview(rasi.imageUrl);
        } else {
            setImagePreview('');
        }

        // Tab-specific field mapping based on your payload requirements
        switch (mode) {
            case 'daily':
                formData.date = parentData?.date || parentData || '';
                formData.duration = 'Daily';
                formData.summary = rasi.summary || '';
                formData.luckyNumbers = rasi.luckyNumbers || '';
                formData.lucky_dr = rasi.lucky_dr || '';
                formData.lucky_color = rasi.lucky_color || '';
                formData.prayers = rasi.prayers || '';
                break;

            case 'weekly':
                formData.date = parentData?.date || '';
                formData.kiraganam = rasi.kiraganam || '';
                formData.weekly_kiraganam = rasi.weekly_kiraganam || '';
                formData.advantages = rasi.advantages || '';
                formData.prayers = rasi.prayers || '';
                break;

            case 'monthly':
                formData.date = parentData?.date || '';
                formData.mon_lan = parentData?.mon_lan || 'tamil';
                formData.kiraganam = rasi.kiraganam || '';
                formData.prayers = rasi.prayers || '';
                break;

            case 'yearly':
                formData.date = parentData?.date || '';
                formData.mon_lan = parentData?.mon_lan || 'tamil';
                formData.kiraganam = rasi.kiraganam || '';
                formData.kiraganam_eye = rasi.kiraganam_eye || '';
                formData.rasi_des = rasi.rasi_des || '';
                formData.advantages = rasi.advantages || '';
                formData.Officers = rasi.Officers || '';
                formData.Traders = rasi.Traders || '';
                formData.Pengal = rasi.Pengal || '';
                formData.politician = rasi.politician || '';
                formData.artist = rasi.artist || '';
                formData.students = rasi.students || '';
                formData.Good = rasi.Good || '';
                formData.Attention = rasi.Attention || '';
                formData.Police = rasi.Police || '';
                formData.Note = rasi.Note || '';
                formData.prayers = rasi.prayers || '';

                // Initialize kiraganam rows if data exists
                if (rasi.kiraganam && typeof rasi.kiraganam === 'object') {
                    try {
                        const kiraganamData = Array.isArray(rasi.kiraganam) ? rasi.kiraganam : [rasi.kiraganam];
                        setKiraganamRows(kiraganamData);
                    } catch (error) {
                        console.error('Error parsing kiraganam data:', error);
                        setKiraganamRows([{}]);
                    }
                } else {
                    setKiraganamRows([{}]);
                }

                // Initialize kiraganam_eye rows if data exists
                if (rasi.kiraganam_eye && typeof rasi.kiraganam_eye === 'object') {
                    try {
                        const eyeData = Array.isArray(rasi.kiraganam_eye) ? rasi.kiraganam_eye : [rasi.kiraganam_eye];
                        setKiraganamEyeRows(eyeData);
                    } catch (error) {
                        console.error('Error parsing kiraganam_eye data:', error);
                        setKiraganamEyeRows([{}]);
                    }
                } else {
                    setKiraganamEyeRows([{}]);
                }
                break;
        }

        setEditForm(formData);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            setEditForm(prev => ({
                ...prev,
                image: file
            }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Update the handleUpdateSubmit function to send ID in payload for all modes
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            console.log('=== EDITING RASi ===');
            console.log('Mode:', editMode);
            console.log('Edit Form:', editForm);


            // Add fields based on edit mode (using your exact payload requirements)
            switch (editMode) {
                case 'daily':
                    // Daily payload
                    formData.append('date', editForm.date);
                    formData.append('duration', 'Daily');
                    formData.append('rasiId', editForm.rasiId || editForm.rasi);
                    formData.append('name', editForm.name);
                    formData.append('summary', editForm.summary);
                    formData.append('luckyNumbers', editForm.luckyNumbers);
                    formData.append('lucky_dr', editForm.lucky_dr);
                    formData.append('lucky_color', editForm.lucky_color);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;

                case 'weekly':
                    // Weekly payload - include ID in payload
                    formData.append('date', editForm.date); // Format: 2025-12-01/2025-12-07
                    formData.append('rasiId', editForm.rasiId || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', editForm.kiraganam);
                    formData.append('weekly_kiraganam', editForm.weekly_kiraganam);
                    formData.append('advantages', editForm.advantages);
                    formData.append('prayers', editForm.prayers);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;

                case 'monthly':
                    // Monthly payload
                    formData.append('date', editForm.date);
                    formData.append('rasiId', editForm.rasi || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', editForm.kiraganam);
                    formData.append('prayers', editForm.prayers);
                    formData.append('mon_lan', editForm.mon_lan);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;

                case 'yearly':
                    // Yearly payload - check language
                    formData.append('date', editForm.date);
                    formData.append('rasiId', editForm.rasi || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', JSON.stringify(kiraganamRows));
                    formData.append('kiraganam_eye', JSON.stringify(kiraganamEyeRows));
                    formData.append('prayers', editForm.prayers);
                    formData.append('mon_lan', editForm.mon_lan);
                    if (editForm.id) formData.append('id', editForm.id);

                    if (editForm.mon_lan === 'tamil') {
                        // Tamil yearly payload
                        formData.append('advantages', editForm.advantages);
                        formData.append('Traders', editForm.Traders);
                        formData.append('Officers', editForm.Officers);
                        formData.append('Police', editForm.Police);
                        formData.append('politician', editForm.politician);
                        formData.append('Pengal', editForm.Pengal);
                        formData.append('students', editForm.students);
                        formData.append('Good', editForm.Good);
                        formData.append('Attention', editForm.Attention);
                        formData.append('Note', editForm.Note);
                    } else {
                        // English yearly payload
                        formData.append('rasi_des', editForm.rasi_des);
                        formData.append('advantages', editForm.advantages);
                        formData.append('Officers', editForm.Officers);
                        formData.append('Traders', editForm.Traders);
                        formData.append('Pengal', editForm.Pengal);
                        formData.append('politician', editForm.politician);
                        formData.append('artist', editForm.artist);
                        formData.append('students', editForm.students);
                        formData.append('Good', editForm.Good);
                        formData.append('Attention', editForm.Attention);
                    }
                    break;
            }

            // Add image if exists
            if (editForm.image) {
                formData.append('image', editForm.image);
            }

            // Log the payload
            console.log('=== PAYLOAD for', editMode, '===');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const apiUrl = UPDATE_API_ENDPOINTS[editMode];
            const method = 'POST'; // All updates use POST with ID in payload

            console.log('Calling API:', apiUrl, 'Method:', method);

            const response = await fetch(apiUrl, {
                method: method,
                body: formData
            });

            const result = await response.json();
            console.log('=== RESPONSE ===', result);

            if (result.success) {
                alert(result.message || 'Rasi updated successfully!');
                setIsEditing(false);
                setEditingRasi(null);
                fetchData(); // Refresh data to show updated content
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
            id: '',
            date: '',
            duration: '',
            rasiId: '',
            name: '',
            summary: '',
            luckyNumbers: '',
            lucky_dr: '',
            lucky_color: '',
            kiraganam: '',
            kiraganam_eye: '',
            weekly_kiraganam: '',
            advantages: '',
            prayers: '',
            image: null,
            mon_lan: 'tamil',
            rasi_des: '',
            Officers: '',
            Traders: '',
            Pengal: '',
            politician: '',
            artist: '',
            students: '',
            Good: '',
            Attention: '',
            Police: '',
            Note: ''
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

    // Render Edit Form Modal
    const renderEditModal = () => {
        const getModalTitle = () => {
            switch (editMode) {
                case 'daily': return '✏️ Edit Daily Rasi Prediction';
                case 'weekly': return '✏️ Edit Weekly Rasi Prediction';
                case 'monthly': return '✏️ Edit Monthly Rasi Prediction';
                case 'yearly': return '✏️ Edit Yearly Rasi Prediction';
                default: return '✏️ Edit Rasi Prediction';
            }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>{getModalTitle()}</h3>
                        <button className="close-btn" onClick={handleCancelEdit}>×</button>
                    </div>

                    <form onSubmit={handleUpdateSubmit} className="edit-form">
                        {/* Common Fields */}
                        <div className="form-group">
                            <label>Select Rasi:</label>
                            <select
                                name="rasiId"
                                value={editForm.rasiId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEditForm(prev => ({
                                        ...prev,
                                        rasiId: value,
                                        rasiId: value
                                    }));
                                }}
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
                                placeholder="Enter Rasi name"
                                required
                            />
                        </div>

                        {/* Daily Specific Fields */}
                        {editMode === 'daily' && (
                            <>
                                <div className="form-group">
                                    <label>Summary:</label>
                                    <textarea
                                        name="summary"
                                        value={editForm.summary}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Enter prediction summary"
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

                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}

                        {/* Weekly Specific Fields */}
                        {editMode === 'weekly' && (
                            <>
                                <div className="form-group">
                                    <label>🌟 கிரகணம்:</label>
                                    <textarea
                                        name="kiraganam"
                                        value={editForm.kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter கிரகணம்"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>📈 வாராந்திர கிரகணம்:</label>
                                    <textarea
                                        name="weekly_kiraganam"
                                        value={editForm.weekly_kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter வாராந்திர கிரகணம்"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>👍 நன்மைகள்:</label>
                                    <textarea
                                        name="advantages"
                                        value={editForm.advantages}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter நன்மைகள்"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}

                        {/* Monthly Specific Fields */}
                        {editMode === 'monthly' && (
                            <>
                                <div className="form-group">
                                    <label>🌟 கிரகணம்:</label>
                                    <textarea
                                        name="kiraganam"
                                        value={editForm.kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Enter கிரகணம்"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Language:</label>
                                    <select
                                        name="mon_lan"
                                        value={editForm.mon_lan}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="tamil">தமிழ்</option>
                                        <option value="english">English</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}

                        {/* Yearly Specific Fields */}
// In renderEditModal function, replace the yearly section with:
                        {editMode === 'yearly' && (
                            <>
                                <div className="form-group">
                                    <label>Language:</label>
                                    <select
                                        name="mon_lan"
                                        value={editForm.mon_lan}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="tamil">தமிழ்</option>
                                        <option value="english">English</option>
                                    </select>
                                </div>

                                {/* Dynamic Kiraganam Table */}
                                <div className="form-group">
                                    <label>🌟 Kiraganam Data:</label>
                                    <div className="dynamic-table-container">
                                        <div className="table-header">
                                            <h4>Kiraganam Table</h4>
                                            <button
                                                type="button"
                                                className="btn-add-row"
                                                onClick={addKiraganamRow}
                                            >
                                                + Add Row
                                            </button>
                                        </div>

                                        <div className="table-wrapper">
                                            <table className="dynamic-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        {getKiraganamHeaders().map((header, idx) => (
                                                            <th key={idx}>
                                                                <input
                                                                    type="text"
                                                                    className="table-header-input"
                                                                    placeholder="Column name"
                                                                    value={header}
                                                                    onChange={(e) => {
                                                                        const newRows = [...kiraganamRows];
                                                                        const oldHeader = header;
                                                                        newRows.forEach(row => {
                                                                            if (row[oldHeader] !== undefined) {
                                                                                row[e.target.value] = row[oldHeader];
                                                                                delete row[oldHeader];
                                                                            }
                                                                        });
                                                                        setKiraganamRows(newRows);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kiraganamRows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <td>{rowIndex + 1}</td>
                                                            {getKiraganamHeaders().map((header, colIndex) => (
                                                                <td key={colIndex}>
                                                                    <input
                                                                        type="text"
                                                                        className="table-cell-input"
                                                                        placeholder="Enter value"
                                                                        value={row[header] || ''}
                                                                        onChange={(e) => handleKiraganamChange(rowIndex, header, e.target.value)}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn-remove-row"
                                                                    onClick={() => removeKiraganamRow(rowIndex)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="table-controls">
                                            <button
                                                type="button"
                                                className="btn-add-column"
                                                onClick={() => {
                                                    const newHeaders = [...getKiraganamHeaders(), `field_${Date.now()}`];
                                                    const newRows = kiraganamRows.map(row => ({
                                                        ...row,
                                                        [newHeaders[newHeaders.length - 1]]: ''
                                                    }));
                                                    setKiraganamRows(newRows);
                                                }}
                                            >
                                                + Add Column
                                            </button>
                                            {getKiraganamHeaders().length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-column"
                                                    onClick={() => {
                                                        const headers = getKiraganamHeaders();
                                                        if (headers.length > 0) {
                                                            const lastHeader = headers[headers.length - 1];
                                                            const newRows = kiraganamRows.map(row => {
                                                                const newRow = { ...row };
                                                                delete newRow[lastHeader];
                                                                return newRow;
                                                            });
                                                            setKiraganamRows(newRows);
                                                        }
                                                    }}
                                                >
                                                    - Remove Last Column
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Kiraganam Eye Table */}
                                <div className="form-group">
                                    <label>👁️ Kiraganam Eye Data:</label>
                                    <div className="dynamic-table-container">
                                        <div className="table-header">
                                            <h4>Kiraganam Eye Table</h4>
                                            <button
                                                type="button"
                                                className="btn-add-row"
                                                onClick={addKiraganamEyeRow}
                                            >
                                                + Add Row
                                            </button>
                                        </div>

                                        <div className="table-wrapper">
                                            <table className="dynamic-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        {getKiraganamEyeHeaders().map((header, idx) => (
                                                            <th key={idx}>
                                                                <input
                                                                    type="text"
                                                                    className="table-header-input"
                                                                    placeholder="Column name"
                                                                    value={header}
                                                                    onChange={(e) => {
                                                                        const newRows = [...kiraganamEyeRows];
                                                                        const oldHeader = header;
                                                                        newRows.forEach(row => {
                                                                            if (row[oldHeader] !== undefined) {
                                                                                row[e.target.value] = row[oldHeader];
                                                                                delete row[oldHeader];
                                                                            }
                                                                        });
                                                                        setKiraganamEyeRows(newRows);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kiraganamEyeRows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <td>{rowIndex + 1}</td>
                                                            {getKiraganamEyeHeaders().map((header, colIndex) => (
                                                                <td key={colIndex}>
                                                                    <input
                                                                        type="text"
                                                                        className="table-cell-input"
                                                                        placeholder="Enter value"
                                                                        value={row[header] || ''}
                                                                        onChange={(e) => handleKiraganamEyeChange(rowIndex, header, e.target.value)}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn-remove-row"
                                                                    onClick={() => removeKiraganamEyeRow(rowIndex)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="table-controls">
                                            <button
                                                type="button"
                                                className="btn-add-column"
                                                onClick={() => {
                                                    const newHeaders = [...getKiraganamEyeHeaders(), `field_${Date.now()}`];
                                                    const newRows = kiraganamEyeRows.map(row => ({
                                                        ...row,
                                                        [newHeaders[newHeaders.length - 1]]: ''
                                                    }));
                                                    setKiraganamEyeRows(newRows);
                                                }}
                                            >
                                                + Add Column
                                            </button>
                                            {getKiraganamEyeHeaders().length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-column"
                                                    onClick={() => {
                                                        const headers = getKiraganamEyeHeaders();
                                                        if (headers.length > 0) {
                                                            const lastHeader = headers[headers.length - 1];
                                                            const newRows = kiraganamEyeRows.map(row => {
                                                                const newRow = { ...row };
                                                                delete newRow[lastHeader];
                                                                return newRow;
                                                            });
                                                            setKiraganamEyeRows(newRows);
                                                        }
                                                    }}
                                                >
                                                    - Remove Last Column
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rest of the yearly fields based on language */}
                                {editForm.mon_lan === 'tamil' ? (
                                    <>
                                        <div className="form-group">
                                            <label>👍 நன்மைகள்:</label>
                                            <textarea
                                                name="advantages"
                                                value={editForm.advantages}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter நன்மைகள்"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>🏪 வியாபாரிகள்:</label>
                                                <textarea
                                                    name="Traders"
                                                    value={editForm.Traders}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter வியாபாரிகள்"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>👮 அதிகாரிகள்:</label>
                                                <textarea
                                                    name="Officers"
                                                    value={editForm.Officers}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter அதிகாரிகள்"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👮‍♀️ காவல்துறை:</label>
                                                <textarea
                                                    name="Police"
                                                    value={editForm.Police}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter காவல்துறை"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>🏛️ அரசியல்வாதிகள்:</label>
                                                <textarea
                                                    name="politician"
                                                    value={editForm.politician}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter அரசியல்வாதிகள்"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👩 பெண்கள்:</label>
                                                <textarea
                                                    name="Pengal"
                                                    value={editForm.Pengal}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter பெண்கள்"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>🎓 மாணவர்கள்:</label>
                                                <textarea
                                                    name="students"
                                                    value={editForm.students}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter மாணவர்கள்"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👍 நல்லது:</label>
                                                <textarea
                                                    name="Good"
                                                    value={editForm.Good}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter நல்லது"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>⚠️ கவனம்:</label>
                                                <textarea
                                                    name="Attention"
                                                    value={editForm.Attention}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter கவனம்"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>📝 குறிப்பு:</label>
                                            <textarea
                                                name="Note"
                                                value={editForm.Note}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter குறிப்பு"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>📜 Rasi Description:</label>
                                            <textarea
                                                name="rasi_des"
                                                value={editForm.rasi_des}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="3"
                                                placeholder="Enter Rasi Description"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>👍 Advantages:</label>
                                            <textarea
                                                name="advantages"
                                                value={editForm.advantages}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter Advantages"
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👮 Officers:</label>
                                                <textarea
                                                    name="Officers"
                                                    value={editForm.Officers}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Officers"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>🏪 Traders:</label>
                                                <textarea
                                                    name="Traders"
                                                    value={editForm.Traders}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Traders"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👩 Pengal:</label>
                                                <textarea
                                                    name="Pengal"
                                                    value={editForm.Pengal}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Pengal"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>🏛️ Politician:</label>
                                                <textarea
                                                    name="politician"
                                                    value={editForm.politician}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Politician"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>🎨 Artist:</label>
                                                <textarea
                                                    name="artist"
                                                    value={editForm.artist}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Artist"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>🎓 Students:</label>
                                                <textarea
                                                    name="students"
                                                    value={editForm.students}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Students"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👍 Good:</label>
                                                <textarea
                                                    name="Good"
                                                    value={editForm.Good}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter Good"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>⚠️ Attention:</label>
                                                <textarea
                                                    name="Attention"
                                                    value={editForm.Attention}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter Attention"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>🙏 Prayers:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter Prayers"
                                    />
                                </div>
                            </>
                        )}

                        {/* Image Upload for all */}
                        <div className="form-group">
                            <label>🖼️ Image:</label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleInputChange}
                                className="form-input"
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                                </div>
                            )}
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
        );
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
                {/* Edit Form Modal will be rendered by renderEditModal() */}

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
                                    // Get the parent ID for daily
                                    const parentId = groupedByDate[selectedDate].id;

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
                                                        onClick={() => handleEditClick(rasi, 'daily', selectedDate, parentId)}
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
                        </div>

                        <div className="rasi-grid">
                            {week.rasi?.map((rasi, rasiIndex) => (
                                <div key={rasiIndex} className="rasi-card1 weekly-card">
                                    <div className="card-header">
                                        <div className="rasi-title">
                                            <div className="rasi-emoji">{rasiData[rasi.rasi]?.emoji || '⭐'}</div>
                                            <h4>{rasi.name || rasiData[rasi.rasi]?.name || `ராசி ${rasi.rasi}`}</h4>
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditClick(rasi, 'weekly', week, week.id)}
                                                title="Edit Weekly Rasi"
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                <span className="edit-icon">✏️</span>
                                                Edit
                                            </button>
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
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(rasi, 'monthly', month, month.id)}
                                                    title="Edit Monthly Rasi"
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    <span className="edit-icon">✏️</span>
                                                    Edit
                                                </button>
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
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(rasi, 'yearly', yearItem, rasi.id)}
                                                    title="Edit Yearly Rasi"
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    <span className="edit-icon">✏️</span>
                                                    Edit
                                                </button>
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

            {/* Edit Modal (rendered outside main content) */}
            {isEditing && renderEditModal()}
        </div>
    );
};

export default RasiAllList;