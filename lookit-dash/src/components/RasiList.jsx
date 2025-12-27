import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RasiList.css';

const RasiList = () => {
  const API_URL = 'https://tnreaders.in/mobile/rasi-daily-list';
  const navigate = useNavigate();

  const [rasiData, setRasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchRasiData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, rasiData]);

  const fetchRasiData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRasiData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching rasi data:', error);
      setError('Failed to load rasi data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredData(rasiData);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = rasiData.map(monthData => {
      const filteredRasis = monthData.data.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.summary.toLowerCase().includes(searchLower) ||
        r.lucky_dr.toLowerCase().includes(searchLower) ||
        r.lucky_color.toLowerCase().includes(searchLower) ||
        r.luckyNumbers.includes(searchTerm)
      );

      if (filteredRasis.length > 0) {
        return {
          ...monthData,
          data: filteredRasis
        };
      }
      return null;
    }).filter(Boolean);

    setFilteredData(filtered);
  };

  const toggleDateExpand = (id) => {
    setExpandedDate(expandedDate === id ? null : id);
  };

  const handleBackToForm = () => {
    navigate('/');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'allow':
        return <span className="status-badge status-allow">Active</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'blocked':
        return <span className="status-badge status-blocked">Blocked</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading rasi data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchRasiData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rasi-list-container">
      <div className="list-header">
        <div className="header-left">
          <h2>📜 All Rasi Data</h2>
          <p className="total-count">
            Total: {rasiData.length} months, {rasiData.reduce((acc, month) => acc + month.data.length, 0)} rasis
          </p>
        </div>
        <button 
          onClick={handleBackToForm}
          className="back-to-form-btn"
        >
          ← Back to Upload
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, summary, lucky numbers, doctor, or color..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="search-info">
          {searchTerm && (
            <p>
              Found {filteredData.length} months with matching rasis
            </p>
          )}
        </div>
      </div>

      <div className="refresh-section">
        <button 
          onClick={fetchRasiData}
          className="refresh-btn"
          disabled={loading}
        >
          🔄 Refresh Data
        </button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {filteredData.length === 0 ? (
        <div className="no-results">
          <p>No rasi data found{match.searchTerm && ' matching your search'}</p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search-btn"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="rasi-list">
          {filteredData.map((monthData) => (
            <div key={monthData.id} className="month-card">
              <div 
                className="month-header"
                onClick={() => toggleDateExpand(monthData.id)}
              >
                <div className="month-info">
                  <h3 className="month-title">
                    {monthData.date}
                    <span className="rasi-count">
                      ({monthData.data.length} rasis)
                    </span>
                  </h3>
                  <div className="month-meta">
                    {getStatusBadge(monthData.status)}
                    <span className="month-id">ID: {monthData.id}</span>
                  </div>
                </div>
                <span className="expand-icon">
                  {expandedDate === monthData.id ? '▼' : '▶'}
                </span>
              </div>

              {expandedDate === monthData.id && (
                <div className="rasi-cards">
                  {monthData.data.map((rasi, index) => (
                    <div key={`${monthData.id}-${index}`} className="rasi-card">
                      <div className="rasi-card-header">
                        <div className="rasi-title">
                          <h4>{rasi.name}</h4>
                          <span className="rasi-id">Rasi ID: {rasi.rasiId}</span>
                        </div>
                        <div className="rasi-badges">
                          <span className="lucky-numbers">
                            🍀 {rasi.luckyNumbers}
                          </span>
                        </div>
                      </div>

                      {rasi.imageUrl && (
                        <div className="rasi-image-container">
                          <img 
                            src={rasi.imageUrl} 
                            alt={rasi.name}
                            className="rasi-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div className="image-fallback" style={{display: 'none'}}>
                            No Image Available
                          </div>
                        </div>
                      )}

                      <div className="rasi-details">
                        <div className="detail-row">
                          <span className="detail-label">Lucky Doctor:</span>
                          <span className="detail-value">{rasi.lucky_dr}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Lucky Color:</span>
                          <span className="detail-value color-indicator" style={{backgroundColor: rasi.lucky_color}}>
                            {rasi.lucky_color}
                          </span>
                        </div>
                      </div>

                      <div className="rasi-summary">
                        <h5>Summary:</h5>
                        <p className="summary-text">
                          {rasi.summary.length > 300 && !rasi.expanded ? 
                            `${rasi.summary.substring(0, 300)}...` : 
                            rasi.summary
                          }
                        </p>
                        {rasi.summary.length > 300 && (
                          <button 
                            className="read-more-btn"
                            onClick={() => {
                              const newData = [...rasiData];
                              const monthIndex = newData.findIndex(m => m.id === monthData.id);
                              newData[monthIndex].data[index].expanded = 
                                !newData[monthIndex].data[index].expanded;
                              setRasiData(newData);
                            }}
                          >
                            {rasi.expanded ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RasiList;