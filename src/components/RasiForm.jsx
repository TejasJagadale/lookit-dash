import React, { useState, useEffect } from 'react';
import '../styles/RasiForm.css';

const RasiForm = () => {
  const API_URL = 'https://tnreaders.in/mobile/rasi-daily-store';
  const LIST_API_URL = 'https://tnreaders.in/mobile/rasi-daily-list';

  const [formData, setFormData] = useState({
    date: '',
    rasiId: '',
    name: '',
    summary: '',
    luckyNumbers: '',
    duration: '',
    image: '',
    lucky_dr: '',
    lucky_color: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  
  // Modal states
  const [showListModal, setShowListModal] = useState(false);
  const [rasiListData, setRasiListData] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDate, setExpandedDate] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.rasiId) newErrors.rasiId = 'Rasi ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.summary) newErrors.summary = 'Summary is required';
    if (!formData.luckyNumbers) newErrors.luckyNumbers = 'Lucky Numbers are required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.lucky_dr) newErrors.lucky_dr = 'Lucky Doctor is required';
    if (!formData.lucky_color) newErrors.lucky_color = 'Lucky Color is required';

    return newErrors;
  };

  const showStatusMessage = (type, message) => {
    setSubmissionStatus({ type, message });
    setTimeout(() => setSubmissionStatus(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showStatusMessage('error', 'Please fix all validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        showStatusMessage('success', 'Data submitted successfully!');
        
        setFormData({
          date: '',
          rasiId: '',
          name: '',
          summary: '',
          luckyNumbers: '',
          duration: '',
          image: '',
          lucky_dr: '',
          lucky_color: ''
        });
        setErrors({});
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      showStatusMessage('error', `Failed to submit data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      date: '',
      rasiId: '',
      name: '',
      summary: '',
      luckyNumbers: '',
      duration: '',
      image: '',
      lucky_dr: '',
      lucky_color: ''
    });
    setErrors({});
    setSubmissionStatus(null);
  };

  const handleViewList = async () => {
    setShowListModal(true);
    setListLoading(true);
    setListError(null);

    try {
      const response = await fetch(LIST_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRasiListData(data);
    } catch (error) {
      console.error('Error fetching rasi list:', error);
      setListError('Failed to load rasi data. Please try again later.');
    } finally {
      setListLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowListModal(false);
    setRasiListData([]);
    setSearchTerm('');
    setExpandedDate(null);
  };

  const toggleDateExpand = (id) => {
    setExpandedDate(expandedDate === id ? null : id);
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

  const filteredData = searchTerm.trim() ? 
    rasiListData.map(monthData => {
      const searchLower = searchTerm.toLowerCase();
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
    }).filter(Boolean) : rasiListData;

  return (
    <div className="rasi-form-container">
      <div className="form-header-actions">
        <h2>Upload New Rasi Data</h2>
        <button 
          onClick={handleViewList}
          className="view-list-btn"
        >
          📋 View All Rasi ({rasiListData.length > 0 ? 
            rasiListData.reduce((acc, month) => acc + month.data.length, 0) : '0'
          })
        </button>
      </div>

      {submissionStatus && (
        <div className={`submission-status ${submissionStatus.type}`}>
          <span className="status-icon">
            {submissionStatus.type === 'success' ? '✓' : '✗'}
          </span>
          {submissionStatus.message}
        </div>
      )}

      <form className="rasi-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rasiId">Rasi ID *</label>
            <input
              type="text"
              id="rasiId"
              name="rasiId"
              value={formData.rasiId}
              onChange={handleChange}
              placeholder="Enter Rasi ID"
              className={errors.rasiId ? 'error' : ''}
            />
            {errors.rasiId && <span className="error-message">{errors.rasiId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Rasi Name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="luckyNumbers">Lucky Numbers *</label>
            <input
              type="text"
              id="luckyNumbers"
              name="luckyNumbers"
              value={formData.luckyNumbers}
              onChange={handleChange}
              placeholder="e.g., 5, 12, 18, 23"
              className={errors.luckyNumbers ? 'error' : ''}
            />
            {errors.luckyNumbers && <span className="error-message">{errors.luckyNumbers}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 10:00 AM - 12:00 PM"
              className={errors.duration ? 'error' : ''}
            />
            {errors.duration && <span className="error-message">{errors.duration}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="image">Image URL (Optional)</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="summary">Summary *</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Enter detailed summary..."
              rows="4"
              className={errors.summary ? 'error' : ''}
            />
            {errors.summary && <span className="error-message">{errors.summary}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lucky_dr">Lucky Doctor *</label>
            <input
              type="text"
              id="lucky_dr"
              name="lucky_dr"
              value={formData.lucky_dr}
              onChange={handleChange}
              placeholder="Enter lucky doctor name"
              className={errors.lucky_dr ? 'error' : ''}
            />
            {errors.lucky_dr && <span className="error-message">{errors.lucky_dr}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lucky_color">Lucky Color *</label>
            <input
              type="text"
              id="lucky_color"
              name="lucky_color"
              value={formData.lucky_color}
              onChange={handleChange}
              placeholder="e.g., Blue, Red, Green"
              className={errors.lucky_color ? 'error' : ''}
            />
            {errors.lucky_color && <span className="error-message">{errors.lucky_color}</span>}
          </div>
        </div>

        <div className="form-info">
          <p><span className="required-mark">*</span> Required fields</p>
          <p className="form-help">Fill all required fields and click submit to upload data</p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Rasi Data'
            )}
          </button>
          
          <button
            type="button"
            className="reset-btn"
            onClick={handleReset}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📜 All Rasi Data</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {listLoading ? (
                <div className="modal-loading">
                  <div className="spinner-large"></div>
                  <p>Loading rasi data...</p>
                </div>
              ) : listError ? (
                <div className="modal-error">
                  <div className="error-icon">⚠️</div>
                  <h3>Error Loading Data</h3>
                  <p>{listError}</p>
                  <button onClick={handleViewList} className="retry-btn">
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="modal-search">
                    <input
                      type="text"
                      placeholder="Search by name, summary, lucky numbers, doctor, or color..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <div className="search-stats">
                      <span className="total-count">
                        Total: {rasiListData.length} months, {rasiListData.reduce((acc, month) => acc + month.data.length, 0)} rasis
                      </span>
                      {searchTerm && (
                        <span className="filter-count">
                          Showing: {filteredData.length} months
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="modal-list">
                    {filteredData.length === 0 ? (
                      <div className="no-results">
                        <p>No rasi data found{searchTerm && ' matching your search'}</p>
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
                      <div className="rasi-list-scroll">
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
                                        <span className="detail-value color-indicator">
                                          {rasi.lucky_color}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="rasi-summary">
                                      <h5>Summary:</h5>
                                      <p className="summary-text">
                                        {rasi.summary.length > 200 ? 
                                          `${rasi.summary.substring(0, 200)}...` : 
                                          rasi.summary
                                        }
                                      </p>
                                      {rasi.summary.length > 200 && (
                                        <button 
                                          className="read-more-btn"
                                          onClick={() => {
                                            // Toggle expanded state
                                            const rasiElement = document.querySelector(
                                              `.rasi-card:nth-child(${index + 1}) .summary-text`
                                            );
                                            if (rasiElement) {
                                              rasiElement.classList.toggle('expanded');
                                            }
                                          }}
                                        >
                                          Read More
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
                </>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="modal-close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RasiForm;