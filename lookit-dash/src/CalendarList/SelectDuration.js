import { useState, useEffect } from "react";
import "../styles/RasiStyles.css";

import img1 from "./Assets/mesham.jpg";
import img2 from "./Assets/rishabam.jpg";
import img3 from "./Assets/midhunam.jpg";
import img4 from "./Assets/kadagam.jpg";
import img5 from "./Assets/simmam.jpg";
import img6 from "./Assets/kanni.jpg";
import img7 from "./Assets/thulam.jpg";
import img8 from "./Assets/viruchigam.jpg";
import img9 from "./Assets/dhanusu.jpg";
import img10 from "./Assets/magaram.jpg";
import img11 from "./Assets/kumbam.jpg";
import img12 from "./Assets/meenam.jpg";

const rasiList = [
  { id: 1, name: "மேஷம்", image: img1, apiName: "Mesham" },
  { id: 2, name: "ரிஷபம்", image: img2, apiName: "Rishabam" },
  { id: 3, name: "மிதுனம்", image: img3, apiName: "Midhunam" },
  { id: 4, name: "கடகம்", image: img4, apiName: "Kadagam" },
  { id: 5, name: "சிம்மம்", image: img5, apiName: "Simmam" },
  { id: 6, name: "கன்னி", image: img6, apiName: "Kanni" },
  { id: 7, name: "துலாம்", image: img7, apiName: "Thulam" },
  { id: 8, name: "விருச்சிகம்", image: img8, apiName: "Viruchigam" },
  { id: 9, name: "தனுசு", image: img9, apiName: "Dhanusu" },
  { id: 10, name: "மகரம்", image: img10, apiName: "Magaram" },
  { id: 11, name: "கும்பம்", image: img11, apiName: "Kumbam" },
  { id: 12, name: "மீனம்", image: img12, apiName: "Meenam" }
];

const durationMap = {
  daily: "இன்றைய",
  weekly: "வார",
  monthly: "மாத",
  yearly: "வருட"
};

// Function to find matching rasi from API response
function findMatchingRasi(rasiArray, rasiName) {
  if (!rasiArray || !rasiName) return null;

  // Try exact match first
  let match = rasiArray.find(r => {
    const rName = r.name?.trim();
    const searchName = rasiName.trim();

    // Direct match
    if (rName === searchName) return true;

    // Match with Tamil name mapping
    const tamilToEnglish = {
      "மேஷம்": "Mesham",
      "ரிஷபம்": "Rishabam",
      "மிதுனம்": "Midhunam",
      "கடகம்": "Kadagam",
      "சிம்மம்": "Simmam",
      "கன்னி": "Kanni",
      "துலாம்": "Thulam",
      "விருச்சிகம்": "Viruchigam",
      "தனுசு": "Dhanusu",
      "மகரம்": "Magaram",
      "கும்பம்": "Kumbam",
      "மீனம்": "Meenam"
    };

    const englishToTamil = Object.fromEntries(
      Object.entries(tamilToEnglish).map(([t, e]) => [e, t])
    );

    // Check if searchName is Tamil and rName is English
    if (tamilToEnglish[searchName] === rName) return true;

    // Check if searchName is English and rName is Tamil
    if (englishToTamil[searchName] === rName) return true;

    // Check for partial matches
    if (rName && searchName) {
      if (rName.includes(searchName) || searchName.includes(rName)) return true;
    }

    return false;
  });

  return match;
}

// Function to parse date range for weekly
function parseWeeklyDate(dateStr) {
  if (!dateStr) return { start: "", end: "", formatted: "" };

  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const start = new Date(parts[0]);
    const end = new Date(parts[1]);

    // Format: DD/MM/YYYY - DD/MM/YYYY
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      start: parts[0],
      end: parts[1],
      formatted: `${formatDate(start)} - ${formatDate(end)}`
    };
  }

  return { start: dateStr, end: dateStr, formatted: dateStr };
}

// Function to parse monthly date
function parseMonthlyDate(dateStr) {
  if (!dateStr) return { month: "", year: "", formatted: "" };

  // Assuming format like "mar 2026"
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const month = parts[0];
    const year = parts[1];

    const monthNames = {
      'jan': 'ஜனவரி', 'feb': 'பிப்ரவரி', 'mar': 'மார்ச்',
      'apr': 'ஏப்ரல்', 'may': 'மே', 'jun': 'ஜூன்',
      'jul': 'ஜூலை', 'aug': 'ஆகஸ்ட்', 'sep': 'செப்டம்பர்',
      'oct': 'அக்டோபர்', 'nov': 'நவம்பர்', 'dec': 'டிசம்பர்'
    };

    const tamilMonth = monthNames[month.toLowerCase()] || month;

    return {
      month: month,
      year: year,
      formatted: `${tamilMonth} ${year}`
    };
  }

  return { month: "", year: "", formatted: dateStr };
}

export default function SelectDuration() {
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState("daily");
  const [selectedRasi, setSelectedRasi] = useState("");
  const [selectedRasiApiName, setSelectedRasiApiName] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [allWeeklyData, setAllWeeklyData] = useState([]);
  const [allMonthlyData, setAllMonthlyData] = useState([]);

  /* ---------- AUTO CALC WEEK END ---------- */
  useEffect(() => {
    if (!weekStart) return;
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setWeekEnd(end.toISOString().split("T")[0]);
  }, [weekStart]);

  function goToRasiList(type) {
    setDuration(type);
    setStep(2);
    setData([]);
    setFilteredData([]);
    setError("");
    if (type === "daily") setSelectedDate(today);
  }

  async function openRasi(rasi) {
    setSelectedRasi(rasi.name);
    setSelectedRasiApiName(rasi.apiName);
    setStep(3);
    setData([]);
    setFilteredData([]);
    setError("");

    if (duration === "daily") {
      await fetchRasi("daily");
    } else if (duration === "weekly") {
      await fetchAllWeeklyData(rasi.apiName);
    } else if (duration === "monthly") {
      await fetchAllMonthlyData(rasi.apiName);
    }
  }

  /* ================= FETCH ALL WEEKLY DATA ================= */
  async function fetchAllWeeklyData(rasiApiName) {
    if (!rasiApiName) return;

    setFetching(true);
    setError("");
    setAllWeeklyData([]);
    setData([]);
    setFilteredData([]);

    try {
      const response = await fetch("https://tnreaders.in/mobile/listWeekly");
      const json = await response.json();

      if (json.success && json.data) {
        const allData = [];

        json.data.forEach(item => {
          if (item.rasi && Array.isArray(item.rasi)) {
            const matchedRasi = findMatchingRasi(item.rasi, rasiApiName);
            if (matchedRasi) {
              const dateRange = parseWeeklyDate(item.date);
              allData.push({
                date: item.date,
                dateRange: dateRange,
                rasiData: matchedRasi,
                fullItem: item
              });
            }
          }
        });

        setAllWeeklyData(allData);
        setData(allData); // Display all data initially
        setFilteredData(allData);

        if (allData.length === 0) {
          setError("No weekly data found for this rasi.");
        }
      } else {
        setError("Failed to fetch weekly data.");
      }
    } catch (err) {
      console.error("Weekly fetch error:", err);
      setError("Something went wrong while fetching weekly data.");
    } finally {
      setFetching(false);
    }
  }

  /* ================= FETCH ALL MONTHLY DATA ================= */
  async function fetchAllMonthlyData(rasiApiName) {
    if (!rasiApiName) return;

    setFetching(true);
    setError("");
    setAllMonthlyData([]);
    setData([]);
    setFilteredData([]);

    try {
      const response = await fetch("https://tnreaders.in/mobile/listemonthly");
      const json = await response.json();

      if (json.success && json.data) {
        const allData = [];

        json.data.forEach(item => {
          if (item.rasi && Array.isArray(item.rasi)) {
            const matchedRasi = findMatchingRasi(item.rasi, rasiApiName);
            if (matchedRasi) {
              const monthInfo = parseMonthlyDate(item.date);
              allData.push({
                date: item.date,
                monthInfo: monthInfo,
                rasiData: matchedRasi,
                fullItem: item
              });
            }
          }
        });

        setAllMonthlyData(allData);
        setData(allData); // Display all data initially
        setFilteredData(allData);

        if (allData.length === 0) {
          setError("No monthly data found for this rasi.");
        }
      } else {
        setError("Failed to fetch monthly data.");
      }
    } catch (err) {
      console.error("Monthly fetch error:", err);
      setError("Something went wrong while fetching monthly data.");
    } finally {
      setFetching(false);
    }
  }

  /* ================= FETCH DAILY DATA ================= */
  async function fetchRasi(type, dateOverride = "") {
    const rasiName = selectedRasi;
    const apiName = selectedRasiApiName;

    if (!rasiName || !apiName) {
      setError("Please select a rasi first");
      return;
    }

    setLoading(true);
    setError("");
    setData([]);
    setFilteredData([]);

    try {
      let result = [];

      if (type === "daily") {
        const url = "https://tnreaders.in/mobile/rasi-daily-date";
        const response = await fetch(url);
        const json = await response.json();

        json.forEach(item => {
          if (item.data && Array.isArray(item.data)) {
            const matchedRasi = findMatchingRasi(item.data, apiName);
            if (matchedRasi) {
              result.push({
                date: item.date || "Today",
                rasiData: matchedRasi,
                type: "daily"
              });
            }
          }
        });

        setData(result);
        setFilteredData(result);
      }

      if (result.length === 0) {
        setError(`No ${type} data found for ${rasiName}`);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  }

  /* ================= FILTER WEEKLY DATA BY DATE ================= */
  function filterWeeklyData() {
    if (!weekStart) {
      setFilteredData(data); // Show all if no filter
      return;
    }

    const filtered = allWeeklyData.filter(item => {
      // Check if weekStart falls within the date range
      const dateRange = item.dateRange;
      if (!dateRange.start || !dateRange.end) return false;

      const filterDate = new Date(weekStart);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      return filterDate >= startDate && filterDate <= endDate;
    });

    setFilteredData(filtered);

    if (filtered.length === 0) {
      setError("No data found for the selected week.");
    } else {
      setError("");
    }
  }

  /* ================= FILTER MONTHLY DATA BY DATE ================= */
  function filterMonthlyData() {
    if (!selectedDate) {
      setFilteredData(data); // Show all if no filter
      return;
    }

    const [year, month] = selectedDate.split('-');
    const monthNumber = parseInt(month);

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const monthStr = monthNames[monthNumber - 1];
    const searchStr = `${monthStr} ${year}`.toLowerCase();
    const filtered = allMonthlyData.filter(item => {
      console.log(item.date);
      console.log(searchStr);
      return item.date.toLowerCase() === searchStr;
    });

    setFilteredData(filtered);

    if (filtered.length === 0) {
      setError("No data found for the selected month.");
    } else {
      setError("");
    }
  }

  /* ================= RESET FILTERS ================= */
  function resetFilters() {
    setFilteredData(data);
    setWeekStart("");
    setSelectedDate("");
    setError("");
  }

  /* ================= UI ================= */
  return (
    <div className="rasi-app">

      {/* STEP 1 */}
      {step === 1 && (
        <div className="panel in">
          <h1 className="title">ராசிபலன்</h1>
          <div className="duration-row">
            <div className="dursec">
              <img src="/assets/dailycal.png" alt="Daily" />
              <button onClick={() => goToRasiList("daily")}>Daily</button>
            </div>
            <div className="dursec">
              <img src="/assets/weeklycal.png" alt="Weekly" />
              <button onClick={() => goToRasiList("weekly")}>Weekly</button>
            </div>
            <div className="dursec">
              <img src="/assets/monthlycal.png" alt="Monthly" />
              <button onClick={() => goToRasiList("monthly")}>Monthly</button>
            </div>
            <div className="dursec">
              <img src="/assets/yearlycal.png" alt="Yearly" />
              <button onClick={() => goToRasiList("yearly")}>Yearly</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="panel in">
          <button className="panelbtn" onClick={() => setStep(1)}>←</button>
          <h2 className="paneltitle">{durationMap[duration]} ராசிபலன்</h2>

          <div className="grid cards">
            {rasiList.map(rasi => (
              <button key={rasi.id} className="card" onClick={() => openRasi(rasi)}>
                <img src={rasi.image} alt={rasi.name} />
                <div className="cardtitle">{rasi.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="panel in">
          <button className="panelbtn" onClick={() => setStep(2)}>← Back</button>
          <h3 className="paneltitle1">{selectedRasi} ராசி - {durationMap[duration]} பலன்</h3>

          {/* Date Selection Controls */}
          <div className="date-controls">
            {duration === "weekly" ? (
              <div className="date-input-group">
                <label>வாரம் தேர்ந்தெடு (வார தொடக்கம்):</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={e => setWeekStart(e.target.value)}
                  className="date-input"
                />
                <div className="button-group">
                  <button
                    onClick={filterWeeklyData}
                    className="fetch-btn"
                    disabled={fetching}
                  >
                    வாரத்திற்கு படி
                  </button>
                  <button
                    onClick={resetFilters}
                    className="reset-btn"
                  >
                    அனைத்தும்
                  </button>
                </div>
                {weekStart && (
                  <div className="date-info">
                    தேர்ந்தெடுத்த வாரம்: {weekStart} முதல் {weekEnd} வரை
                  </div>
                )}
              </div>
            ) : duration === "monthly" ? (
              <div className="date-input-group">
                <label>மாதம் தேர்ந்தெடு:</label>
                <input
                  type="month"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="date-input"
                />
                <div className="button-group">
                  <button
                    onClick={filterMonthlyData}
                    className="fetch-btn"
                    disabled={fetching}
                  >
                    மாதத்திற்கு படி
                  </button>
                  <button
                    onClick={resetFilters}
                    className="reset-btn"
                  >
                    அனைத்தும்
                  </button>
                </div>
              </div>
            ) : (
              <div className="date-input-group">
                <label>தேதி தேர்ந்தெடு:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="date-input"
                />
                <button
                  onClick={() => fetchRasi("daily")}
                  className="fetch-btn"
                  disabled={loading}
                >
                  இன்றைய பலன் பெறுக
                </button>
              </div>
            )}
          </div>

          {fetching && <div className="loading">வார/மாத தகவல்களை பெறுகிறது...</div>}
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error-message">{error}</div>}

          {/* Display Results Count */}
          {filteredData.length > 0 && (
            <div className="results-count">
              {duration === "weekly" ? "வார" : duration === "monthly" ? "மாத" : "நாள்"} பலன்கள்: {filteredData.length}
            </div>
          )}

          {/* Display Results */}
          <div className="results-container">
            {filteredData.map((item, idx) => (
              <div key={idx} className="rasi-card">
                <div className="rasi-header">
                  <div className="rasi-date">
                    <strong>
                      {duration === "weekly"
                        ? item.dateRange?.formatted || item.date
                        : duration === "monthly"
                          ? item.monthInfo?.formatted || item.date
                          : item.date}
                    </strong>
                    <span className="duration-badge">
                      {duration === "weekly" ? "வாரம்" :
                        duration === "monthly" ? "மாதம்" :
                          "நாள்"}
                    </span>
                  </div>
                  {item.fullItem?.created_at && (
                    <div className="created-at">
                      பதிவு செய்யப்பட்டது: {new Date(item.fullItem.created_at).toLocaleDateString('ta-IN')}
                    </div>
                  )}
                </div>

                <h3 className="rasi-greeting">{selectedRasi} ராசி அன்பர்களே..!</h3>

                {item.rasiData.imageUrl && (
                  <img
                    className="rasiimg"
                    src={item.rasiData.imageUrl}
                    alt={`${selectedRasi} ${duration} prediction`}
                  />
                )}

                <div className="rasi-content">
                  {/* For Daily */}
                  {duration === "daily" && item.rasiData.summary && (
                    <p className="rasi-summary">{item.rasiData.summary}</p>
                  )}

                  {/* For Weekly */}
                  {duration === "weekly" && (
                    <>
                      {item.rasiData.kiraganam && (
                        <div className="section">
                          <h4>கிரகணம்:</h4>
                          <p>{item.rasiData.kiraganam}</p>
                        </div>
                      )}
                      {item.rasiData.weekly_kiraganam && (
                        <div className="section">
                          <h4>வார கிரகணம்:</h4>
                          <p>{item.rasiData.weekly_kiraganam}</p>
                        </div>
                      )}
                      {item.rasiData.advantages && (
                        <div className="section">
                          <h4>நன்மைகள்:</h4>
                          <p>{item.rasiData.advantages}</p>
                        </div>
                      )}
                      {item.rasiData.prayers && (
                        <div className="section">
                          <h4>பிரார்த்தனைகள்:</h4>
                          <p>{item.rasiData.prayers}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* For Monthly */}
                  {duration === "monthly" && (
                    <>
                      {item.rasiData.kiraganam && (
                        <div className="section">
                          <h4>கிரகணம்:</h4>
                          <p>{item.rasiData.kiraganam}</p>
                        </div>
                      )}
                      {item.rasiData.prayers && (
                        <div className="section">
                          <h4>பிரார்த்தனைகள்:</h4>
                          <p>{item.rasiData.prayers}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && !fetching && !loading && !error && (
            <div className="no-data">
              <p>தகவல்கள் இல்லை. தயவு செய்து வார/மாத தேர்வை மாற்றவும்.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}