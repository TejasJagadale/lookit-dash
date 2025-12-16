import React, { useState, useEffect } from 'react';
import "../styles/RasiAllList.css"

const RasiAllList = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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
    monthly: 'https://tnreaders.in/mobile/listemonthly'
  };

  // Rasi names in Tamil
  const rasiNames = {
    "1": "மேஷம்",
    "2": "ரிஷபம்",
    "3": "மிதுனம்",
    "4": "கடகம்",
    "5": "சிம்மம்",
    "6": "கன்னி",
    "7": "துலாம்",
    "8": "விருச்சிகம்",
    "9": "தனுசு",
    "10": "மகரம்",
    "11": "கும்பம்",
    "12": "மீனம்"
  };

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS[activeTab]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);


      if (activeTab === 'daily') {
        setDailyData(data || []);
      } else if (activeTab === 'weekly') {
        setWeeklyData(data?.data || []);
      } else if (activeTab === 'monthly') {
        setMonthlyData(data?.data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
      // prayers: rasi.prayers || '',
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

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission for update
  // Handle form submission for update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare form data as URL encoded (since your other endpoints use GET)
      const params = new URLSearchParams();

      // Add all required parameters matching your API expectations
      params.append('date', editForm.date);
      params.append('rasi_id', editForm.rasiId); // Note: Check if backend expects "rasi_id" or "rasiId"
      params.append('name', editForm.name);
      params.append('summary', editForm.summary);
      params.append('lucky_numbers', editForm.luckyNumbers); // Note: Check parameter name
      params.append('lucky_dr', editForm.lucky_dr);
      params.append('lucky_color', editForm.lucky_color);

      // Add prayers if you have it
      // if (editForm.prayers) {
      //   params.append('prayers', editForm.prayers);
      // }

      console.log('Update Params:', params.toString());

      // FIRST: Check if the correct endpoint exists by trying a simpler approach
      // Since your status update uses GET, let's try GET for update too

      // OPTION 1: Using GET request (if that's what your API expects)
      // const response = await fetch(
      //   `https://tnreaders.in/mobile/rasi-daily-update?${params.toString()}`,
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     }
      //   }
      // );

      // OPTION 2: If GET doesn't work, try POST with FormData
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key === 'image' && editForm[key]) {
          formData.append('image', editForm[key]);
        } else if (editForm[key] !== null && editForm[key] !== undefined) {
          // Map frontend field names to backend field names
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
        fetchData(); // Refresh data
      } else {
        alert(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(`Failed to update Rasi: ${error.message}`);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (date, currentStatus) => {
    if (!date) return;

    const newStatus = currentStatus === 'allow' ? 'disallow' : 'allow';
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

    // Set loading state for this date
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
        {
          method: 'GET'
        }
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
      }
    } catch (error) {
      console.error('Status toggle error:', error);

      // Revert on error
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
      // prayers: '',
      image: null
    });
    setImagePreview('');
  };

  // Render Daily Content
  const renderDailyContent = () => {
    if (!dailyData.length) return <div className="no-data">No daily data available</div>;

    // Group by date for easier navigation
    const groupedByDate = dailyData.reduce((acc, item) => {
      acc[item.date] = item;
      return acc;
    }, {});

    const dates = Object.keys(groupedByDate).sort((a, b) => {
      // Sort dates with proper date parsing
      return new Date(b) - new Date(a);
    });

    return (
      <div className="daily-container">
        {/* Edit Form Modal */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Rasi Prediction</h3>
                <button className="close-btn" onClick={handleCancelEdit}>×</button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="edit-form">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="text"
                    name="date"
                    value={editForm.date}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Rasi ID:</label>
                  <input
                    type="text"
                    name="rasiId"
                    value={editForm.rasiId}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rasi Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="form-input"
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
                    rows="5"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Lucky Numbers:</label>
                    <input
                      type="text"
                      name="luckyNumbers"
                      value={editForm.luckyNumbers}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group half">
                    <label>Lucky Color:</label>
                    <input
                      type="text"
                      name="lucky_color"
                      value={editForm.lucky_color}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Lucky Direction:</label>
                    <input
                      type="text"
                      name="lucky_dr"
                      value={editForm.lucky_dr}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* <div className="form-group half">
                    <label>Prayers:</label>
                    <input
                      type="text"
                      name="prayers"
                      value={editForm.prayers}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div> */}
                </div>

                <div className="form-group">
                  {/* <label>Image:</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload"
                    />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <p>Current Image</p>
                      </div>
                    )} */}
                  {/* </div> */}
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

        {/* Date Selector */}
        <div className="date-selector">
          {dates.map(date => (
            <div key={date} className="date-item">
              <button
                className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                onClick={() => setSelectedDate(date === selectedDate ? null : date)}
              >
                {date}
              </button>

              {/* Status Toggle Button */}
              <div className="status-control">
                <span className="status-label">
                  Status: {groupedByDate[date].status}
                </span>
                <button
                  className={`status-toggle ${groupedByDate[date].status === 'allow' ? 'allowed' : 'disallowed'}`}
                  onClick={() => handleStatusToggle(date, groupedByDate[date].status)}
                  disabled={isUpdatingStatus[date]}
                >
                  {isUpdatingStatus[date] ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    groupedByDate[date].status === 'allow' ? 'Disable' : 'Enable'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rasi List */}
        <div className="rasi-list-container">
          {(selectedDate ? [selectedDate] : dates).map(date => (
            <div key={date} className="date-group">
              {!selectedDate && (
                <div className="date-header-container">
                  <h3 className="date-header">{date}</h3>
                  <span className={`status-badge ${groupedByDate[date].status}`}>
                    {groupedByDate[date].status}
                  </span>
                </div>
              )}

              <div className="rasi-cards">
                {groupedByDate[date].data?.map((rasi, index) => (
                  <div key={`${date}-${index}`} className="rasi-card">
                    <div className="card-header">
                      <div className="card-header-top">
                        <div className="rasi-title">
                          <h4>{rasi.name || rasiNames[rasi.rasiId] || `ராசி ${rasi.rasiId}`}</h4>
                        </div>

                        {/* Edit Button */}
                        <button
                          className="edit-btn"
                          onClick={() => handleEditClick(rasi, date)}
                          title="Edit Rasi"
                        >
                          ✏️ Edit
                        </button>
                      </div>

                      <div className="lucky-info">
                        <span className="lucky-label">அதிர்ஷ்ட எண்கள்: {rasi.luckyNumbers}</span>
                        <span className="lucky-label">நல்ல திசை: {rasi.lucky_dr}</span>
                        <span className="lucky-label">நல்ல நிறம்: {rasi.lucky_color}</span>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="summary-section">
                        <h5>ராசி பலன்</h5>
                        <p className="summary-text">{rasi.summary}</p>
                      </div>

                      {rasi.imageUrl && (
                        <div className="image-section">
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Weekly Content
  const renderWeeklyContent = () => {
    if (!weeklyData.length) return <div className="no-data">No weekly data available</div>;

    return (
      <div className="weekly-container">
        {weeklyData.map((week, index) => (
          <div key={week.id || index} className="week-group">
            <h3 className="period-header">{week.date}</h3>
            <div className="rasi-cards">
              {week.rasi?.map((rasi, rasiIndex) => (
                <div key={rasiIndex} className="rasi-card weekly-card">
                  <div className="card-header">
                    <div className="rasi-title">
                      <h4>{rasi.name || rasiNames[rasi.rasi] || `ராசி ${rasi.rasi}`}</h4>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="section">
                      <h5>கிரகணம்</h5>
                      <p>{rasi.kiraganam}</p>
                    </div>

                    <div className="section">
                      <h5>வாராந்திர கிரகணம்</h5>
                      <p>{rasi.weekly_kiraganam}</p>
                    </div>

                    <div className="section">
                      <h5>நன்மைகள்</h5>
                      <p>{rasi.advantages}</p>
                    </div>

                    <div className="section">
                      <h5>பிரார்த்தனைகள்</h5>
                      <p>{rasi.prayers}</p>
                    </div>

                    {rasi.imageUrl && (
                      <div className="image-section">
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
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Monthly Content
  const renderMonthlyContent = () => {
    if (!monthlyData.length) return <div className="no-data">No monthly data available</div>;

    return (
      <div className="monthly-container">
        {monthlyData.map((month, index) => (
          <div key={month.id || index} className="month-group">
            <h3 className="period-header">{month.date}</h3>
            <div className="rasi-cards">
              {month.rasi?.map((rasi, rasiIndex) => (
                <div key={rasiIndex} className="rasi-card monthly-card">
                  <div className="card-header">
                    <div className="rasi-title">
                      <h4>{rasi.name || rasiNames[rasi.rasi] || `ராசி ${rasi.rasi}`}</h4>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="section">
                      <h5>கிரகணம்</h5>
                      <p>{rasi.kiraganam}</p>
                    </div>

                    <div className="section">
                      <h5>பிரார்த்தனைகள்</h5>
                      <p>{rasi.prayers}</p>
                    </div>

                    {rasi.imageUrl && (
                      <div className="image-section">
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
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading {activeTab} data...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    switch (activeTab) {
      case 'daily':
        return renderDailyContent();
      case 'weekly':
        return renderWeeklyContent();
      case 'monthly':
        return renderMonthlyContent();
      default:
        return null;
    }
  };

  return (
    <div className="rasi-all-list-container">
      <div className="container">
        <h1 className="main-title">ராசி பலன்</h1>
        <p className="subtitle">தினசரி, வாராந்திர மற்றும் மாதாந்திர ராசி பலன்கள்</p>

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
              தினசரி
            </button>
            <button
              className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('weekly');
                setIsEditing(false);
              }}
            >
              வாராந்திர
            </button>
            <button
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('monthly');
                setIsEditing(false);
              }}
            >
              மாதாந்திர
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content-container">
          {renderContent()}
        </div>

        {/* Info Footer */}
        <div className="info-footer">
          <p>மூலம்: TN Readers</p>
          <p className="note">* தினசரி பலன்கள் தினமும் புதுப்பிக்கப்படுகின்றன</p>
        </div>
      </div>
    </div>
  );
};

export default RasiAllList;