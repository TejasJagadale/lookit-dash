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
  { id: 1, name: "மேஷம்", image: img1 },
  { id: 2, name: "ரிஷபம்", image: img2 },
  { id: 3, name: "மிதுனம்", image: img3 },
  { id: 4, name: "கடகம்", image: img4 },
  { id: 5, name: "சிம்மம்", image: img5 },
  { id: 6, name: "கன்னி", image: img6 },
  { id: 7, name: "துலாம்", image: img7 },
  { id: 8, name: "விருச்சிகம்", image: img8 },
  { id: 9, name: "தனுசு", image: img9 },
  { id: 10, name: "மகரம்", image: img10 },
  { id: 11, name: "கும்பம்", image: img11 },
  { id: 12, name: "மீனம்", image: img12 }
];

const durationMap = {
  daily: "இன்றைய",
  weekly: "வார",
  monthly: "மாத",
  yearly: "வருட"
};

export default function SelectDuration() {
  // STEP: 1 = duration, 2 = rasi grid, 3 = details
  const [step, setStep] = useState(1);

  const [duration, setDuration] = useState("daily");
  const [selectedRasi, setSelectedRasi] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // compute week end automatically when start chosen
  useEffect(() => {
    if (!weekStart) {
      setWeekEnd("");
      return;
    }
    const start = new Date(weekStart);
    // end is 6 days after start (one-week inclusive)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const y = end.getFullYear();
    const m = String(end.getMonth() + 1).padStart(2, "0");
    const d = String(end.getDate()).padStart(2, "0");
    setWeekEnd(`${y}-${m}-${d}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  function goToRasiList(type) {
    setDuration(type);
    setStep(2);
    setData([]);
    setError("");
    // if daily, preset selectedDate to today to auto-fetch on view
    if (type === "daily") setSelectedDate(today);
  }

  function openRasi(rasi) {
    setSelectedRasi(rasi.name);
    setStep(3);
    // auto-fetch for daily with today's date
    if (duration === "daily") fetchRasi("daily", today, rasi.name);
  }

  // fetchRasi: normalized dateValue depends on duration
  async function fetchRasi(type, rawDateValue = "", rasiNameOverride = null) {
    const selectedName = rasiNameOverride ?? selectedRasi;
    if (!selectedName) {
      setError("Please select a ராசி first.");
      return;
    }

    let dateValue = rawDateValue;
    if (!dateValue) {
      if (type === "daily") dateValue = today;
      else if (type === "monthly") dateValue = selectedDate; // month input value (YYYY-MM)
      else if (type === "yearly") dateValue = selectedDate || String(new Date().getFullYear());
      else if (type === "weekly") dateValue = weekStart ? `${weekStart}/${weekEnd}` : "";
    }

    if (!dateValue) {
      setError("Please choose a date or range.");
      return;
    }

    setLoading(true);
    setError("");
    setData([]);

    try {
      const url = new URL("https://tnreaders.in/mobile/rasi-daily-date");
      const params = new URLSearchParams();

      if (type === "daily") {
        params.append("duration", "daily");
        params.append("date", dateValue);
      } else if (type === "weekly") {
        params.append("duration", "weekly");
        params.append("date", dateValue); // format start/end already
      } else if (type === "monthly") {
        const [year, month] = dateValue.split("-");
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthName = months[Number(month) - 1];
        params.append("duration", "monthly");
        params.append("date", `${monthName}-${year}`);
      } else if (type === "yearly") {
        const yearOnly = dateValue.split("-")[0] || dateValue;
        params.append("duration", "yearly");
        params.append("date", yearOnly);
      }

      url.search = params.toString();
      const res = await fetch(url.toString());
      const json = await res.json();

      // filter for selected rasi name
      const filteredData = json
        .map((item) => ({
          ...item,
          data: item.data.filter((rasi) => rasi.name.trim() === selectedName.trim())
        }))
        .filter((item) => item.data.length > 0);

      if (filteredData.length === 0) {
        setError("No data found for " + selectedName);
        setData([]);
      } else {
        setError("");
        setData(filteredData);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching.");
    } finally {
      setLoading(false);
    }
  }

  // small helper for human friendly week range display
  function formatRange(start, end) {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()}/${s.getMonth() + 1}/${s.getFullYear()} – ${e.getDate()}/${e.getMonth() + 1}/${e.getFullYear()}`;
  }

  // Optimized step components (render inline)
  return (
    <div className="rasi-app">
      <div className={`panel ${step === 1 ? "in" : "out-left"}`} style={{ display: step === 1 ? "block" : "none" }}>
        <div className="hero">
          <h1 className="title">ராசிபலன்</h1>

          <div className="duration-row">
            <button className="btn primary" onClick={() => goToRasiList("daily")}>Daily</button>
            <button className="btn" onClick={() => goToRasiList("weekly")}>Weekly</button>
            <button className="btn" onClick={() => goToRasiList("monthly")}>Monthly</button>
            <button className="btn" onClick={() => goToRasiList("yearly")}>Yearly</button>
          </div>
        </div>
      </div>

      <div className={`panel ${step === 2 ? "in" : step === 1 ? "out-right" : "out-left"}`} style={{ display: step === 2 ? "block" : "none" }}>
        <header className="list-header">
          <button className="back small" onClick={() => setStep(1)}>←</button>
          <h2>{durationMap[duration]} ராசிபலன்</h2>
          <div className="pill">{rasiList.length} ராசிகள்</div>
        </header>

        <div className="grid cards">
          {rasiList.map((rasi) => (
            <button
              key={rasi.id}
              className="card"
              onClick={() => openRasi(rasi)}
              aria-label={rasi.name}
            >
              <div className="card-media">
                <img src={rasi.image} alt={rasi.name} />
              </div>
              <div className="card-body">
                <div className="rasi-name">{rasi.name}</div>
                <div className="rasi-meta">Click to view</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`panel ${step === 3 ? "in" : "out-right"}`} style={{ display: step === 3 ? "block" : "none" }}>
        <div className="detail-header">
          <button className="back" onClick={() => setStep(2)}>← Back</button>
          <h3 className="detail-title">{selectedRasi} ராசி</h3>
        </div>

        <div className="controls">
          <label className="control-label">Duration:</label>
          <select
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setData([]);
            }}
            className="select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {duration === "weekly" ? (
            <div className="week-picker">
              <div className="week-inputs">
                <div>
                  <label>Start</label>
                  <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
                </div>
                <div>
                  <label>End</label>
                  <input type="date" value={weekEnd} readOnly />
                </div>
              </div>

              <div className="week-actions">
                <div className="week-range">{formatRange(weekStart, weekEnd)}</div>
                <button className="btn primary" onClick={() => fetchRasi("weekly")}>Get Weekly Data</button>
              </div>
            </div>
          ) : (
            <div className="single-date">
              <input
                type={duration === "monthly" ? "month" : duration === "yearly" ? "number" : "date"}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // For yearly we want year only; keep value as provided by user
                }}
                onBlur={() => {
                  // auto fetch on blur to avoid fetch on each type for number input
                  fetchRasi(duration);
                }}
                min={duration === "yearly" ? "1900" : undefined}
                max={duration === "yearly" ? "2100" : undefined}
                placeholder={duration === "yearly" ? "YYYY" : undefined}
                className="date-input"
              />
              <button className="btn" onClick={() => fetchRasi(duration)}>Search</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-media" />
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line long" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : data.length === 0 ? (
          <div className="empty">No result yet — choose a date and search</div>
        ) : (
          data.map((item, idx) => (
            <div className="rasi-card" key={idx}>
              {item.data.map((rasi, i) => (
                <div className="rasi-inner" key={i}>
                  <h3 className="greeting">{selectedRasi} ராசி அன்பர்களே..!</h3>

                  {rasi.imageUrl && <img src={rasi.imageUrl} alt={rasi.name} className="rasi-img" />}

                  <div className="width">
                    <p className="para">{rasi.summary}</p>
                  </div>

                  <table className="info-table">
                    <tbody>
                      <tr className="table-head">
                        <th colSpan="3">மேலும் தகவல்கள்</th>
                      </tr>

                      <tr>
                        <th>அதிர்ஷ்ட எண்</th>
                      </tr>
                      <tr>
                        <td>{rasi.luckyNumbers}</td>
                      </tr>

                      <tr>
                        <th>அதிர்ஷ்ட நிறம்</th>
                      </tr>
                      <tr>
                        <td>{rasi.lucky_color}</td>
                      </tr>

                      <tr>
                        <th>அதிர்ஷ்ட திசை</th>
                      </tr>
                      <tr>
                        <td>{rasi.lucky_dr}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
