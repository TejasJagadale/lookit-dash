import React, { useState } from 'react';
import BasicDateCalendar from './date';
import "../styles/durationstyle.css";
import rasiname from './json/rasipalan.json';
import AntDatePicker from './antdatepicker';
import Preview from './preview';
import Errors from './errors';
import CircularIndeterminate from './loader';

const Duration = () => {

    const [values, setValue] = useState(null);
    const [dur, setdur] = useState("Daily");
    const [selectobj, setSelectedObj] = useState("");
    const [object, setobject] = useState("");
    const [predata, setpredata] = useState(null);
    const [databool, setdatabool] = useState(false);
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState(null);
    const [fileName, setfileName] = useState("No File Chosen");
    const [weekRange, setWeekRange] = useState("");

    const handleChange = (e) => {
        const selectedName = e.target.value;
        const match = rasiname.find(item => item.name === selectedName);
        if (!match) return;
        setSelectedObj(match.rasiId);
        setobject(selectedName);
    };

    // Function to get week range (Sunday to Saturday) for Weekly selection
    const getWeekRange = (date) => {
        const selectedDate = new Date(date);
        const day = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Calculate Sunday of the week
        const sunday = new Date(selectedDate);
        sunday.setDate(selectedDate.getDate() - day);
        
        // Calculate Saturday of the week
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        
        // Format dates
        const formatDate = (d) => {
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };
        
        const weekRangeString = `${formatDate(sunday)} to ${formatDate(saturday)}`;
        setWeekRange(weekRangeString);
        return weekRangeString;
    };

    // Handle date change for Weekly specifically
    const handleWeeklyDateChange = (date) => {
        setValue(date);
        getWeekRange(date);
    };

    /* ---------------- FORM SUBMIT (PREVIEW DATA) ---------------- */
    const formdatas = (e) => {
        e.preventDefault();

        let data = {};

        /* ---------- DAILY ---------- */
        if (dur === "Daily") {
            data = {
                date: values,
                duration: dur,
                rasiId: selectobj,
                name: e.target.name?.value,
                summary: e.target.summary?.value,
                luckyNumbers: e.target.luckyNumbers?.value,
                lucky_dr: e.target.lucky_dr?.value,
                lucky_color: e.target.lucky_color?.value,
                // imageFile: e.target.image.files[0],
                // imageURL: e.target.image.files[0]
                //     ? URL.createObjectURL(e.target.image.files[0])
                //     : null,
            };
        }
        /* ---------- WEEKLY ---------- */
        else if (dur === "Weekly") {
            data = {
                date: values,
                weekRange: weekRange, // Add week range to data
                rasi: e.target.rasi.value,
                name: e.target.name?.value,
                kiraganam: e.target.kiraganam?.value,
                weekly_kiraganam: e.target.weekly_kiraganam?.value,
                advantages: e.target.advantages?.value,
                prayers: e.target.prayers?.value,
                mon_lan: e.target.mon_lan?.value,
                // imageFile: e.target.image.files[0],
                // imageURL: e.target.image.files[0]
                //     ? URL.createObjectURL(e.target.image.files[0])
                //     : null,
            };
        }
        /* ---------- MONTHLY ---------- */
        else if (dur === "Monthly") {
            data = {
                mon_lan: e.target.mon_lan?.value,
                date: values,
                rasi: e.target.rasi.value,
                name: e.target.name?.value,
                kiraganam: e.target.kiraganam?.value,
                prayers: e.target.prayers?.value,
                imageFile: e.target.image.files[0],
                imageURL: e.target.image.files[0]
                    ? URL.createObjectURL(e.target.image.files[0])
                    : null,
            };
        }

        setpredata(data);
        setdatabool(true);
    };

    /* ---------------- API CALL ---------------- */
    const xchange = async () => {
        setloading(true);
        const formdata = new FormData();
        let API_URL = "";

        /* ---------- DAILY ---------- */
        if (dur === "Daily") {
            API_URL = "https://tnreaders.in/mobile/rasi-daily-store";

            formdata.append("date", predata.date);
            formdata.append("duration", predata.duration);
            formdata.append("rasiId", predata.rasiId);
            formdata.append("name", predata.name);
            formdata.append("summary", predata.summary);
            formdata.append("luckyNumbers", predata.luckyNumbers);
            formdata.append("lucky_dr", predata.lucky_dr);
            formdata.append("lucky_color", predata.lucky_color);
            if (predata.imageFile) {
                formdata.append("image", predata.imageFile);
            }
        }
        /* ---------- WEEKLY ---------- */
        else if (dur === "Weekly") {
            API_URL = "https://tnreaders.in/mobile/storeweekly";

            formdata.append("date", predata.date);
            formdata.append("week_range", predata.weekRange || getWeekRange(predata.date)); // Send week range
            formdata.append("rasi", predata.rasi);
            formdata.append("name", predata.name);
            formdata.append("kiraganam", predata.kiraganam);
            formdata.append("weekly_kiraganam", predata.weekly_kiraganam);
            formdata.append("advantages", predata.advantages);
            formdata.append("prayers", predata.prayers);
            if (predata.imageFile) {
                formdata.append("image", predata.imageFile);
            }
        }
        /* ---------- MONTHLY ---------- */
        else if (dur === "Monthly") {
            API_URL = "https://tnreaders.in/mobile/storemonthly";

            formdata.append("mon_lan", predata.mon_lan);
            formdata.append("date", predata.date);
            formdata.append("rasi", predata.rasi);
            formdata.append("name", predata.name);
            formdata.append("kiraganam", predata.kiraganam);
            formdata.append("prayers", predata.prayers);
            if (predata.imageFile) {
                formdata.append("image", predata.imageFile);
            }
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: formdata
            });
            const data = await res.json();
            seterror(data.message || "Uploaded successfully");
        } catch (err) {
            seterror("Upload failed");
        } finally {
            setloading(false);
        }
    };

    return (
        <div className='main'>
            <form className='form' onSubmit={formdatas} encType="multipart/form-data">

                <h1>Upload Form</h1>

                <label>கால அளவைத் தேர்வு செய்க:</label>
                <select className='design' onChange={(e) => {
                    setdur(e.target.value);
                    setWeekRange(""); // Clear week range when duration changes
                }} required>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </select>

                <label>தேதி:</label>
                {dur === "Daily" && (
                    <BasicDateCalendar
                        onformat={"YYYY-MM-DD"}
                        onDate={setValue}
                    />
                )}
                {dur === "Weekly" && (
                    <>
                        <BasicDateCalendar
                            onformat={"YYYY-MM-DD"}
                            onDate={handleWeeklyDateChange}
                            placeholder="Select any day of the week"
                        />
                        {weekRange && (
                            <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}>
                                <strong>Selected Week:</strong> {weekRange}
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    (Sunday to Saturday)
                                </div>
                            </div>
                        )}
                    </>
                )}
                {dur === "Monthly" &&
                    <BasicDateCalendar
                        onformat={"MMM YYYY"}
                        onDate={setValue}
                        onview={["year", "month"]}
                        onopen={"month"}
                    />
                }

                <label>ராசி பெயர்:</label>
                <select className='design' name="rasi" onChange={handleChange} required>
                    <option value="">Select Rasi</option>
                    {rasiname.map((item) => (
                        <option key={item.rasiId} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <label>Name:</label>
                <input className='design' type="text" name="name" required />

                {/* DAILY FIELDS */}
                {dur === "Daily" && (
                    <>
                        <label>Summary:</label>
                        <textarea className='tadesign' name="summary" required />

                        <label>Lucky Numbers:</label>
                        <input className='design' type="text" name="luckyNumbers" placeholder="e.g., 7, 14, 21" required />

                        <label>Lucky Direction:</label>
                        <input className='design' type="text" name="lucky_dr" placeholder="e.g., North, East" required />

                        <label>Lucky Color:</label>
                        <input className='design' type="text" name="lucky_color" placeholder="e.g., Red, Blue" required />
                    </>
                )}

                {/* WEEKLY FIELDS */}
                {dur === "Weekly" && (
                    <>
                        <label>Kiraganam:</label>
                        <textarea className='tadesign' name="kiraganam" required />

                        <label>Weekly Kiraganam:</label>
                        <textarea className='tadesign' name="weekly_kiraganam" required />

                        <label>Advantages:</label>
                        <textarea className='tadesign' name="advantages" required />

                        <label>Prayers:</label>
                        <textarea className='tadesign' name="prayers" required />
                    </>
                )}

                {/* MONTHLY FIELDS */}
                {dur === "Monthly" && (
                    <>
                        <label>Kiraganam:</label>
                        <textarea className='tadesign' name="kiraganam" required />

                        <label>Language:</label>
                        <select className='design' name="mon_lan" required>
                            <option value="tamil">Tamil</option>
                            <option value="english">English</option>
                        </select>

                        <label>Prayers:</label>
                        <textarea className='tadesign' name="prayers" required />
                    </>
                )}

                {/* PRAYERS FIELD FOR DAILY - Only show if not already shown above */}
                {dur === "Daily" && (
                    <>
                        <label>Prayers:</label>
                        <textarea className='tadesign' name="prayers" required />
                    </>
                )}

                <label>Upload Image:</label>
                <input
                    className='design'
                    type='file'
                    name='image'
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && setfileName(e.target.files[0].name)}
                    required
                />
                <strong>{fileName}</strong>

                <button className='btn' disabled={loading}>
                    {loading ? <CircularIndeterminate /> : "Upload"}
                </button>

            </form>

            {databool && <Preview onbool={setdatabool} onupload={xchange} ondata={predata} />}
            {error && <Errors onbool={seterror} onerror={error} />}

        </div>
    );
};

export default Duration;