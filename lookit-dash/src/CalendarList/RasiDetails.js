import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/RasiStyles.css";


export default function ViewRasiForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  console.log("rasidetails location value:", location);
  console.log("params", params);

  const selectedRasi = params.get("rasiName") || "";
  const initialDuration = params.get("duration") || "daily";


  const today = new Date().toISOString().split("T")[0];
  console.log("Today:", today);

  const [duration, setDuration] = useState(initialDuration);


  const [selectedDate, setSelectedDate] = useState(
    initialDuration === "daily" ? today : ""
  );  // AUTO-SET today for daily


  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialDuration === "daily") {
      fetchRasi("daily", today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function fetchRasi(type, dateValue) {
    if (!dateValue) return;

    setLoading(true);
    setError("");
    setData([]);

    const url = new URL("https://tnreaders.in/mobile/rasi-daily-date");
    const params = new URLSearchParams();
    console.log("api params:", params);

    if (type === "daily") {
      params.append("duration", "daily");
      params.append("date", dateValue);
    }

    else if (type === "weekly") {
      if (!weekStart || !weekEnd) {
        setError("Please select start and end date.");
        setLoading(false);
        return;
      }
      params.append("duration", "weekly");
      params.append("date", `${weekStart}/${weekEnd}`);
    }

    else if (type === "monthly") {
      const [year, month] = dateValue.split("-");
      const months = [
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec"
      ];
      const monthName = months[Number(month) - 1];
      params.append("duration", "monthly");
      params.append("date", `${monthName}-${year}`);
    }

    else if (type === "yearly") {
      const year = dateValue.split("-")[0];
      params.append("duration", "yearly");
      params.append("date", year);
    }

    url.search = params.toString();

    try {
      const res = await fetch(url.toString());
      const json = await res.json();

      const filteredData = json
        .map((item) => ({
          ...item,
          data: item.data.filter(
            (rasi) => rasi.name.trim() === selectedRasi.trim()
          ),
        }))
        .filter((item) => item.data.length > 0);

      if (filteredData.length === 0) {
        setData([]); // CLEAR DISPLAY
        setError("No data found for " + selectedRasi);
      } else {
        setError("");  // ensure previous errors disappear
        setData(filteredData);
      }

    } catch (err) {
      setError("Something went wrong while fetching.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  function handleDateChange(e) {
    const raw = e.target.value;
    let normalized = raw;

    if (duration === "monthly") normalized = raw;
    if (duration === "yearly") normalized = raw + "-01-01";

    setSelectedDate(raw);
    fetchRasi(duration, normalized);
  }

  function handleDurationChange(e) {
    setDuration(e.target.value);
    setSelectedDate("");
    setWeekStart("");
    setWeekEnd("");
    setData([]);
    setError("");
  }

  return (
    <div className="rasi-containers">
      <div className="star-bg"></div>
      <div className="wrap-container">
        <h3 className="h3">{selectedRasi} ராசி</h3>

        <select value={duration} onChange={handleDurationChange}>
          {["daily", "weekly", "monthly", "yearly"].map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>


        {duration === "weekly" ? (
          <div className="block">


            <input
              type="date"
              value={weekStart}
              onChange={(e) => {
                setWeekStart(e.target.value);
                setWeekEnd("");   // reset end date when start changes
              }}
              className="input-date"
            />


            <input
              type="date"
              value={weekEnd}
              min={weekStart || undefined}
              max={
                weekStart
                  ? new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6))
                    .toISOString()
                    .split("T")[0]
                  : undefined
              }
              disabled={!weekStart}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="input-date"
            />

            <button
              className="input-date"
              onClick={() => fetchRasi("weekly", weekStart + "/" + weekEnd)}
            >
              Get Weekly Data
            </button>

          </div>
        ) : (
          <input
            id="input"
            type={
              duration === "monthly"
                ? "month"
                : duration === "yearly"
                  ? "number"
                  : "date"
            }
            value={selectedDate}
            onChange={handleDateChange}
            className="input-date"
            min={duration === "yearly" ? "2000" : undefined}
            max={duration === "yearly" ? "2100" : undefined}
            placeholder={duration === "yearly" ? "YYYY" : undefined}
          />
        )}

      </div>

      {loading && <p>Loading...</p>}
      {!loading && error && (
        <p style={{ color: "red" }}>{error}</p>
      )}


      {data.map((item, idx) => (
        <div key={idx} className="rasi-card">
          {item.data.map((rasi, i) => (
            <div key={i} className="rasi-inner">
              <h3>{selectedRasi} ராசி அன்பர்களே..!</h3>

              {rasi.imageUrl && (
                <img src={rasi.imageUrl} alt={rasi.name} className="rasi-img" />
              )}

              <div className="width">
                <p className="para">{rasi.summary}</p>
              </div>

              <table>
                <tbody>
                  <tr style={{ background: "#0b1157ff" }}>
                    <th
                      colSpan="3"
                      style={{
                        color: "white",
                        padding: "12px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        borderBottom: "1px solid #ddd"
                      }}
                    >
                      மேலும் தகவல்கள்
                    </th>
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
                    <th >அதிர்ஷ்ட திசை</th>
                  </tr>

                  <tr>
                    <td>{rasi.lucky_dr}</td>
                  </tr>
                </tbody>
              </table>

            </div>
          ))}
        </div>
      ))}

    </div>
  );
}
