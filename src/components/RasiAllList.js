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

  // API endpoints
  const API_ENDPOINTS = {
    daily: 'https://tnreaders.in/mobile/rasi-daily-list',
    weekly: 'https://tnreaders.in/mobile/listWeekly',
    monthly: 'https://tnreaders.in/mobile/listemonthly'
  };

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_ENDPOINTS[activeTab]);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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

    fetchData();
  }, [activeTab]);

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

  // Render Daily Content
  const renderDailyContent = () => {
    if (!dailyData.length) return <div className="no-data">No daily data available</div>;

    // Group by date for easier navigation
    const groupedByDate = dailyData.reduce((acc, item) => {
      acc[item.date] = item.data;
      return acc;
    }, {});

    const dates = Object.keys(groupedByDate).sort((a, b) => {
      // Sort dates with proper date parsing
      return new Date(b) - new Date(a);
    });

    return (
      <div className="daily-container">
        {/* Date Selector */}
        <div className="date-selector">
          {dates.map(date => (
            <button
              key={date}
              className={`date-btn ${selectedDate === date ? 'active' : ''}`}
              onClick={() => setSelectedDate(date === selectedDate ? null : date)}
            >
              {date}
            </button>
          ))}
        </div>

        {/* Rasi List */}
        <div className="rasi-list-container">
          {(selectedDate ? [selectedDate] : dates).map(date => (
            <div key={date} className="date-group">
              {!selectedDate && <h3 className="date-header">{date}</h3>}
              <div className="rasi-cards">
                {groupedByDate[date]?.map((rasi, index) => (
                  <div key={`${date}-${index}`} className="rasi-card">
                    <div className="card-header">
                      <div className="rasi-title">
                        <h4>{rasi.name || rasiNames[rasi.rasiId] || `ராசி ${rasi.rasiId}`}</h4>
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
        <p className="subtitle">Daily, Weekly & Monthly ராசி பலன்கள்</p>
        
        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('daily');
                setSelectedDate(null);
              }}
            >
              Daily
            </button>
            <button 
              className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
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