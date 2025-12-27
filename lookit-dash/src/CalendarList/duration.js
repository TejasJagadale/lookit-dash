import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Save, CloudUpload } from '@mui/icons-material';
import "./simple.css"

const rasiOptions = [
  { name: "மேஷம்", rasiId: "1" },
  { name: "ரிஷபம்", rasiId: "2" },
  { name: "மிதுனம்", rasiId: "3" },
  { name: "கடகம்", rasiId: "4" },
  { name: "சிம்மம்", rasiId: "5" },
  { name: "கன்னி", rasiId: "6" },
  { name: "துலாம்", rasiId: "7" },
  { name: "விருச்சிகம்", rasiId: "8" },
  { name: "தனுசு", rasiId: "9" },
  { name: "மகரம்", rasiId: "10" },
  { name: "கும்பம்", rasiId: "11" },
  { name: "மீனம்", rasiId: "12" }
];

const englishMonths = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
];

const tamilMonths = [
  "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
  "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"
];

const RasiUpdateForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [yearlyLanguage, setYearlyLanguage] = useState('english');
  const [monthlyLanguage, setMonthlyLanguage] = useState('english');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Base form state
  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    rasiId: '',
    name: '',
    summary: '',
    luckyNumbers: '',
    lucky_dr: '',
    lucky_color: '',
    kiraganam: '',
    weekly_kiraganam: '',
    advantages: '',
    prayers: '',
    image: '',
    mon_lan: '',
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

  // Additional state for Monthly and Yearly date inputs
  const [monthlyDate, setMonthlyDate] = useState({ month: '', year: '' });
  const [yearlyDate, setYearlyDate] = useState({ year: '' });

  // Dynamic tables for yearly
  const [kiraganamRows, setKiraganamRows] = useState([{}]);
  const [kiraganamEyeRows, setKiraganamEyeRows] = useState([{}]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    resetFormForTab(newValue);
  };

  const resetFormForTab = (tabIndex) => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Get current month based on language
    let currentMonth = '';
    if (tabIndex === 2) {
      if (monthlyLanguage === 'english') {
        currentMonth = englishMonths[today.getMonth()];
      } else {
        // For Tamil, default to the first month (சித்திரை)
        currentMonth = tamilMonths[0];
      }
    }

    const resetData = {
      date: '',
      duration: '',
      rasiId: '',
      name: '',
      summary: '',
      luckyNumbers: '',
      lucky_dr: '',
      lucky_color: '',
      kiraganam: '',
      weekly_kiraganam: '',
      advantages: '',
      prayers: '',
      image: '',
      mon_lan: '',
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

    if (tabIndex === 0) {
      resetData.date = today.toISOString().split('T')[0];
    } else if (tabIndex === 1) {
      const startDate = new Date(today.setDate(today.getDate() - today.getDay()));
      const endDate = new Date(today.setDate(today.getDate() + 6));
      resetData.date = `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`;
    } else if (tabIndex === 2) {
      // Set default for monthly: current month-year
      setMonthlyDate({ month: currentMonth, year: currentYear.toString() });
      resetData.date = `${currentMonth}-${currentYear}`;
      resetData.mon_lan = monthlyLanguage;

      // Add Tamil month name if language is Tamil
      if (monthlyLanguage === 'tamil') {
        resetData.tamil_month_name = currentMonth;
      }
    } else if (tabIndex === 3) {
      // Set default for yearly
      if (yearlyLanguage === 'english') {
        setYearlyDate({ year: currentYear.toString(), year_name: '' });
        resetData.date = currentYear.toString();
      } else {
        // For Tamil, default to the first option
        setYearlyDate({ year: currentYear.toString(), year_name: 'பரபாவ' });
        resetData.date = currentYear.toString();
        resetData.year_name = 'பரபாவ';
      }
      resetData.mon_lan = yearlyLanguage;
    }

    setFormData(resetData);
    setKiraganamRows([{}]);
    setKiraganamEyeRows([{}]);
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for date field based on active tab
    if (name === 'date') {
      if (activeTab === 0) {
        // Daily: YYYY-MM-DD format
        setFormData(prev => ({ ...prev, date: value }));
      } else if (activeTab === 1) {
        // Weekly: YYYY-MM-DD/YYYY-MM-DD format
        setFormData(prev => ({ ...prev, date: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setNotification({
        open: true,
        message: 'Please select a valid image file (JPEG, PNG, GIF, WebP)',
        severity: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'Image size should be less than 5MB',
        severity: 'error'
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    await uploadImageToServer(file);
  };

  const uploadImageToServer = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    // Generate a unique filename based on rasiId, date, and timestamp
    const rasiId = formData.rasiId || 'unknown';
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const filename = `${rasiId}_${date}_${timestamp}_${file.name}`;
    formData.append('filename', filename);

    try {
      // You need to create an endpoint for image upload on your server
      // For example: 'https://tnreaders.in/mobile/upload-image'
      const uploadResponse = await axios.post('https://tnreaders.in/mobile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        // Update formData with the uploaded image URL
        setFormData(prev => ({
          ...prev,
          image: uploadResponse.data.imageUrl
        }));
        
        setNotification({
          open: true,
          message: 'Image uploaded successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(uploadResponse.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        open: true,
        message: `Failed to upload image: ${error.message}`,
        severity: 'error'
      });
      setSelectedImage(null);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Also update the handleMonthlyDateChange function to ensure proper formatting:
  const handleMonthlyDateChange = (field, value) => {
    const newMonthlyDate = { ...monthlyDate, [field]: value };
    setMonthlyDate(newMonthlyDate);

    // Update formData date in "month-year" format
    if (newMonthlyDate.month && newMonthlyDate.year) {
      const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
      setFormData(prev => ({ ...prev, date: formattedDate }));

      // Also store the Tamil month separately in formData if language is Tamil
      if (monthlyLanguage === 'tamil' && newMonthlyDate.month && newMonthlyDate.year) {
        console.log("iam in");

        const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
        console.log(formattedDate);

        setFormData(prev => ({ ...prev, tamil_month_name: formattedDate }));
      }
    }
  };

  const handleYearlyDateChange = (field, value) => {
    const newYearlyDate = { ...yearlyDate, [field]: value };
    setYearlyDate(newYearlyDate);

    // Update formData based on language
    if (yearlyLanguage === 'english') {
      // For English: date = year value
      if (newYearlyDate.year) {
        const updatedFormData = { date: newYearlyDate.year };
        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    } else {
      // For Tamil: date = year value, year_name = பரபாவ or other Tamil year names
      if (newYearlyDate.year && newYearlyDate.year_name) {
        const updatedFormData = {
          date: newYearlyDate.year,
          year_name: newYearlyDate.year_name
        };
        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    }
  };

  const handleRasiChange = (e) => {
    const selectedId = e.target.value;
    const selectedRasi = rasiOptions.find(r => r.rasiId === selectedId);
    setFormData(prev => ({
      ...prev,
      rasiId: selectedId,
      name: selectedRasi?.name || ''
    }));
  };

  // Get current months based on selected language for monthly tab
  const getCurrentMonths = () => {
    return monthlyLanguage === 'english' ? englishMonths : tamilMonths;
  };

  // Render year input based on language for yearly tab
  const renderYearInput = () => {
    return (
      <Grid container spacing={2}>
        {/* Year input - always shown */}
        <Grid item xs={yearlyLanguage === 'tamil' ? 6 : 12}>
          <TextField
            fullWidth
            label="Year"
            value={yearlyDate.year}
            onChange={(e) => handleYearlyDateChange('year', e.target.value)}
            type="number"
            InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            placeholder="2026"
          />
        </Grid>

        {/* Year name dropdown - only for Tamil language */}
        {yearlyLanguage === 'tamil' && (
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Year Name</InputLabel>
              <Select
                value={yearlyDate.year_name}
                onChange={(e) => handleYearlyDateChange('year_name', e.target.value)}
                label="Year Name"
              >
                <MenuItem value="விசுவாசுவ">விசுவாசுவ</MenuItem>
                <MenuItem value="பரபாவ">பரபாவ</MenuItem>
                {/* You can add more Tamil year names here if needed */}
                <MenuItem value="பிலவங்க">பிலவங்க</MenuItem>
                <MenuItem value="கீலக">கீலக</MenuItem>
                <MenuItem value="சௌமிய">சௌமிய</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    );
  };

  // Dynamic table handlers
  const handleKiraganamChange = (index, field, value) => {
    const newRows = [...kiraganamRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKiraganamRows(newRows);
  };

  const handleKiraganamEyeChange = (index, field, value) => {
    const newRows = [...kiraganamEyeRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKiraganamEyeRows(newRows);
  };

  const addKiraganamRow = () => {
    setKiraganamRows([...kiraganamRows, {}]);
  };

  const addKiraganamEyeRow = () => {
    setKiraganamEyeRows([...kiraganamEyeRows, {}]);
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

  const getKiraganamHeaders = () => {
    if (kiraganamRows.length === 0) return [];
    const firstRow = kiraganamRows[0];
    return Object.keys(firstRow);
  };

  const getKiraganamEyeHeaders = () => {
    if (kiraganamEyeRows.length === 0) return [];
    const firstRow = kiraganamEyeRows[0];
    return Object.keys(firstRow);
  };

  const validateForm = () => {
    if (!formData.rasiId) {
      setNotification({
        open: true,
        message: 'Please select a Rasi',
        severity: 'error'
      });
      return false;
    }

    if (activeTab === 0) {
      if (!formData.date || !formData.summary) {
        setNotification({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 1) {
      if (!formData.date || !formData.kiraganam) {
        setNotification({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 2) {
      if (!formData.date || !formData.mon_lan) {
        setNotification({
          open: true,
          message: 'Please fill month, year and language',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 3) {
      if (!formData.date || !formData.mon_lan) {
        setNotification({
          open: true,
          message: 'Please fill year and language',
          severity: 'error'
        });
        return false;
      }
    }
    
    // Check if image is uploaded for all tabs
    if (!formData.image) {
      setNotification({
        open: true,
        message: 'Please upload an image',
        severity: 'error'
      });
      return false;
    }
    
    return true;
  };

  // In the handleSubmit function, modify the payload preparation for monthly tab:
  const handleSubmit = async () => {
    if (!validateForm()) return;

    let payload = { ...formData };
    const endpoint = getEndpoint();

    console.log('Payload being sent:', payload);

    // Create a new Date object for the current date and time
    const currentDate = new Date();

    // Get the full year (e.g., 2024) from the date object
    const currentYear = currentDate.getFullYear();

    // Display the result
    console.log(currentYear);

    // Prepare payload based on tab
    if (activeTab === 3) {
      // Yearly - include dynamic tables
      payload.kiraganam = kiraganamRows.filter(row => Object.keys(row).length > 0);
      payload.kiraganam_eye = kiraganamEyeRows.filter(row => Object.keys(row).length > 0);

      // Year name is already in formData, but ensure it's in payload
      if (yearlyLanguage === 'tamil' && yearlyDate.year_name) {
        payload.year_name = yearlyDate.year_name;
      }
    } else if (activeTab === 2) {
      // Monthly - include tamil_month_name if language is Tamil
      if (monthlyLanguage === 'tamil') {
        payload.tamil_month_name = `${monthlyDate.month}-${currentYear}`;
        console.log(payload.tamil_month_name);
        // Add the Tamil month name
      }
    }

    try {
      const response = await axios.post(endpoint, payload);
      console.log('Response:', response);

      setNotification({
        open: true,
        message: `${getTabName()} updated successfully!`,
        severity: 'success'
      });

      if (response.data.success === false) {
        setNotification({
          open: true,
          message: `This rasiId already stored for this date.`,
          severity: 'error'
        });
      }

      resetFormForTab(activeTab);
    } catch (error) {
      setNotification({
        open: true,
        message: `Error updating ${getTabName()}: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const getEndpoint = () => {
    const endpoints = [
      'https://tnreaders.in/mobile/rasi-daily-store',
      'https://tnreaders.in/mobile/storeweekly',
      'https://tnreaders.in/mobile/storemonthly',
      'https://tnreaders.in/mobile/storeyearly'
    ];
    return endpoints[activeTab];
  };

  const getTabName = () => {
    const names = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
    return names[activeTab];
  };

  // Update formData when language changes
  useEffect(() => {
    if (activeTab === 2) {
      setFormData(prev => ({
        ...prev,
        mon_lan: monthlyLanguage
      }));

      // Reset month selection when language changes
      const currentMonths = getCurrentMonths();
      const newMonth = monthlyDate.month && currentMonths.includes(monthlyDate.month)
        ? monthlyDate.month
        : currentMonths[0];

      setMonthlyDate(prev => ({ ...prev, month: newMonth }));

      if (newMonth && monthlyDate.year) {
        const updatedFormData = {
          date: `${newMonth}-${monthlyDate.year}`,
          mon_lan: monthlyLanguage
        };

        // Add Tamil month name if language is Tamil
        if (monthlyLanguage === 'tamil' && newMonth && monthlyDate.year) {
          updatedFormData.tamil_month_name = `${newMonth}-${monthlyDate.year}`;
          console.log(updatedFormData);
        }

        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    } else if (activeTab === 3) {
      setFormData(prev => ({
        ...prev,
        mon_lan: yearlyLanguage
      }));

      // Reset year selection when language changes
      let newYear = yearlyDate.year || new Date().getFullYear().toString();
      let newYearName = yearlyDate.year_name;

      if (yearlyLanguage === 'tamil') {
        // For Tamil, set default year name if not already set
        if (!newYearName) {
          newYearName = 'பரபாவ';
        }
      } else {
        // For English, clear year name
        newYearName = '';
      }

      setYearlyDate({ year: newYear, year_name: newYearName });

      // Update form data
      const updatedFormData = {
        date: newYear,
        mon_lan: yearlyLanguage
      };

      if (yearlyLanguage === 'tamil') {
        updatedFormData.year_name = newYearName;
      }

      setFormData(prev => ({ ...prev, ...updatedFormData }));
    }
  }, [monthlyLanguage, yearlyLanguage, activeTab]);

  useEffect(() => {
    resetFormForTab(activeTab);
  }, [monthlyLanguage, yearlyLanguage]);

  // Render appropriate date input based on active tab
  const renderDateInput = () => {
    if (activeTab === 0) {
      return (
        <TextField
          fullWidth
          label="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      );
    } else if (activeTab === 1) {
      return (
        <TextField
          fullWidth
          label="Date Range (YYYY-MM-DD/YYYY-MM-DD)"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          type="text"
          InputLabelProps={{ shrink: true }}
          placeholder="2025-12-01/2025-12-07"
        />
      );
    } else if (activeTab === 2) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={monthlyDate.month}
                onChange={(e) => handleMonthlyDateChange('month', e.target.value)}
                label="Month"
              >
                {getCurrentMonths().map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Year"
              value={monthlyDate.year}
              onChange={(e) => handleMonthlyDateChange('year', e.target.value)}
              type="number"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              placeholder="2026"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              Will be sent as: {formData.date || 'Select month and year'}
            </Typography>
          </Grid>
        </Grid>
      );
    } else if (activeTab === 3) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderYearInput()}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              Will be sent as: {formData.date || 'Enter year'}
            </Typography>
          </Grid>
        </Grid>
      );
    }
  };

  // Render image upload section
  const renderImageUpload = () => {
    return (
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Image *
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Select Image'}
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </Typography>
            </Box>

            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CircularProgress size={24} />
                <Typography>Uploading image...</Typography>
              </Box>
            )}

            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={removeImage}
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            {formData.image && !imagePreview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Image URL:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.image}
                  disabled
                  helperText="Image already uploaded"
                />
                <Button
                  size="small"
                  onClick={removeImage}
                  color="error"
                  startIcon={<Delete />}
                  sx={{ mt: 1 }}
                >
                  Remove Image
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Rasi Updates Management
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="Yearly" />
        </Tabs>

        {/* Language selector for Monthly tab */}
        {activeTab === 2 && (
          <FormControl sx={{ mb: 3, minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={monthlyLanguage}
              onChange={(e) => setMonthlyLanguage(e.target.value)}
              label="Language"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="tamil">Tamil</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Language selector for Yearly tab */}
        {activeTab === 3 && (
          <FormControl sx={{ mb: 3, minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={yearlyLanguage}
              onChange={(e) => setYearlyLanguage(e.target.value)}
              label="Language"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="tamil">Tamil</MenuItem>
            </Select>
          </FormControl>
        )}

        <Grid container spacing={3}>
          {/* Rasi Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Rasi *</InputLabel>
              <Select
                value={formData.rasiId}
                onChange={handleRasiChange}
                label="Rasi *"
              >
                {rasiOptions.map((rasi) => (
                  <MenuItem key={rasi.rasiId} value={rasi.rasiId}>
                    {rasi.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Field - Dynamic based on tab */}
          <Grid item xs={12} md={6}>
            {renderDateInput()}
          </Grid>

          {/* Common Fields */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              disabled
              helperText="Auto-filled based on Rasi selection"
            />
          </Grid>

          {/* Tab-specific Fields */}
          {activeTab === 0 && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Numbers"
                  name="luckyNumbers"
                  value={formData.luckyNumbers}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Direction"
                  name="lucky_dr"
                  value={formData.lucky_dr}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Color"
                  name="lucky_color"
                  value={formData.lucky_color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Summary *"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kiraganam *"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Weekly Kiraganam"
                  name="weekly_kiraganam"
                  value={formData.weekly_kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Advantages"
                  name="advantages"
                  value={formData.advantages}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </>
          )}

          {(activeTab === 2 || activeTab === 3) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mon Lan"
                name="mon_lan"
                value={formData.mon_lan}
                disabled
                helperText={
                  activeTab === 2
                    ? `Auto-filled based on language selection (${monthlyLanguage})`
                    : `Auto-filled based on language selection (${yearlyLanguage})`
                }
              />
            </Grid>
          )}

          {activeTab === 2 && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kiraganam"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prayers"
                  name="prayers"
                  value={formData.prayers}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </>
          )}

          {activeTab === 3 && (
            <>
              {/* Dynamic Kiraganam Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Kiraganam Data</Typography>
                      <Button
                        startIcon={<Add />}
                        onClick={addKiraganamRow}
                        variant="outlined"
                        size="small"
                      >
                        Add Row
                      </Button>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          const newHeaders = [...getKiraganamHeaders(), `field_${Date.now()}`];
                          const newRows = kiraganamRows.map(row => ({
                            ...row,
                            [newHeaders[newHeaders.length - 1]]: ''
                          }));
                          setKiraganamRows(newRows);
                        }}
                      >
                        Add Column
                      </Button>
                      {getKiraganamHeaders().length > 0 && (
                        <Button
                          size="small"
                          color="error"
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
                          Remove Last Column
                        </Button>
                      )}
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            {getKiraganamHeaders().map((header, idx) => (
                              <TableCell key={idx}>
                                <TextField
                                  size="small"
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
                              </TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kiraganamRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell>{rowIndex + 1}</TableCell>
                              {getKiraganamHeaders().map((header, colIndex) => (
                                <TableCell key={colIndex}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Enter value"
                                    value={row[header] || ''}
                                    onChange={(e) => handleKiraganamChange(rowIndex, header, e.target.value)}
                                  />
                                </TableCell>
                              ))}
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => removeKiraganamRow(rowIndex)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Dynamic Kiraganam Eye Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Kiraganam Eye Data</Typography>
                      <Button
                        startIcon={<Add />}
                        onClick={addKiraganamEyeRow}
                        variant="outlined"
                        size="small"
                      >
                        Add Row
                      </Button>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            {getKiraganamEyeHeaders().map((header, idx) => (
                              <TableCell key={idx}>
                                <TextField
                                  size="small"
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
                              </TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kiraganamEyeRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell>{rowIndex + 1}</TableCell>
                              {getKiraganamEyeHeaders().map((header, colIndex) => (
                                <TableCell key={colIndex}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Enter value"
                                    value={row[header] || ''}
                                    onChange={(e) => handleKiraganamEyeChange(rowIndex, header, e.target.value)}
                                  />
                                </TableCell>
                              ))}
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => removeKiraganamEyeRow(rowIndex)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          const newHeaders = [...getKiraganamEyeHeaders(), `field_${Date.now()}`];
                          const newRows = kiraganamEyeRows.map(row => ({
                            ...row,
                            [newHeaders[newHeaders.length - 1]]: ''
                          }));
                          setKiraganamEyeRows(newRows);
                        }}
                      >
                        Add Column
                      </Button>
                      {getKiraganamEyeHeaders().length > 0 && (
                        <Button
                          size="small"
                          color="error"
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
                          Remove Last Column
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Yearly-specific fields */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rasi Description"
                  name="rasi_des"
                  value={formData.rasi_des}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Advantages"
                  name="advantages"
                  value={formData.advantages}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prayers"
                  name="prayers"
                  value={formData.prayers}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Category fields - conditionally render based on language */}
              {yearlyLanguage === 'english' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Officers"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Traders"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pengal"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Politician"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Artist"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Students"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Good"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Attention"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}

              {yearlyLanguage === 'tamil' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Traders (தொழிலதிபர்கள்)"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Officers (அலுவலகத்தினர்)"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Police (காவல்துறையினர்)"
                      name="Police"
                      value={formData.Police}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Politician (அரசியல்வாதிகள்)"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pengal (மகளிர்)"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Students (மாணவர்கள்)"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Good (நன்மை)"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Attention (கவனம்)"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Note (குறிப்பு)"
                      name="Note"
                      value={formData.Note}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
            </>
          )}

          {/* Image Upload Section - for all tabs */}
          {renderImageUpload()}

          {/* Prayers field for Weekly and Monthly */}
          {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prayers"
                name="prayers"
                value={formData.prayers}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          )}

          {/* Advantages for Weekly */}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Advantages"
                name="advantages"
                value={formData.advantages}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSubmit}
            size="large"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Save ${getTabName()} Update`}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RasiUpdateForm;