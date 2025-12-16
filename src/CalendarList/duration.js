import React, { useState } from 'react';
import BasicDateCalendar from './date';
import "../styles/durationstyle.css";
import rasiname from './json/rasipalan.json';
import Preview from './preview';
import Errors from './errors';
import CircularIndeterminate from './loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Duration = () => {

    const [values, setValue] = useState(null);
    const [dur, setdur] = useState("Daily");
    const [selectobj, setSelectedObj] = useState("");
    const [object, setobject] = useState("");
    const [predata, setpredata] = useState(null);
    const [databool, setdatabool] = useState(false);
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState(null);
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

    // Validate form data before submission
    const validateForm = (formData) => {
        const errors = [];

        // Date validation
        if (!values) {
            errors.push("Please select a date");
        } else if (dur === "Daily") {
            // Additional validation for Daily date if needed
            const selectedDate = new Date(values);
            if (isNaN(selectedDate.getTime())) {
                errors.push("Please select a valid date");
            }
        }

        if (!selectobj) {
            errors.push("Please select a Rasi");
        }

        if (dur === "Daily") {
            if (!formData.summary?.trim()) {
                errors.push("Summary is required for Daily prediction");
            }
            if (!formData.luckyNumbers?.trim()) {
                errors.push("Lucky Numbers are required");
            }
            if (!formData.lucky_dr?.trim()) {
                errors.push("Lucky Direction is required");
            }
            if (!formData.lucky_color?.trim()) {
                errors.push("Lucky Color is required");
            }
        }

        if (dur === "Weekly") {
            if (!formData.kiraganam?.trim()) {
                errors.push("Kiraganam is required for Weekly prediction");
            }
            if (!formData.weekly_kiraganam?.trim()) {
                errors.push("Weekly Kiraganam is required");
            }
            if (!formData.advantages?.trim()) {
                errors.push("Advantages are required");
            }
        }

        if (dur === "Monthly") {
            if (!formData.kiraganam?.trim()) {
                errors.push("Kiraganam is required for Monthly prediction");
            }
            if (!formData.mon_lan) {
                errors.push("Please select a language for Monthly prediction");
            }
        }

        if (!formData.name?.trim()) {
            errors.push("Name is required");
        }

        return errors;
    };

    /* ---------------- FORM SUBMIT (PREVIEW DATA) ---------------- */
    const formdatas = (e) => {
        e.preventDefault();

        const formElements = e.target.elements;
        let formData = {};

        /* ---------- DAILY ---------- */
        if (dur === "Daily") {
            formData = {
                date: values,
                duration: dur,
                rasiId: selectobj,
                name: formElements.name?.value,
                summary: formElements.summary?.value,
                luckyNumbers: formElements.luckyNumbers?.value,
                lucky_dr: formElements.lucky_dr?.value,
                lucky_color: formElements.lucky_color?.value,
            };
        }
        /* ---------- WEEKLY ---------- */
        else if (dur === "Weekly") {
            formData = {
                date: values,
                weekRange: weekRange,
                rasi: object,
                name: formElements.name?.value,
                kiraganam: formElements.kiraganam?.value,
                weekly_kiraganam: formElements.weekly_kiraganam?.value,
                advantages: formElements.advantages?.value,
                prayers: formElements.prayers?.value,
                mon_lan: formElements.mon_lan?.value,
            };
        }
        /* ---------- MONTHLY ---------- */
        else if (dur === "Monthly") {
            formData = {
                mon_lan: formElements.mon_lan?.value,
                date: values,
                rasi: object,
                name: formElements.name?.value,
                kiraganam: formElements.kiraganam?.value,
                prayers: formElements.prayers?.value,
            };
        }

        // Validate form data
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
            seterror(validationErrors.join(". "));
            toast.error("Please fill all required fields correctly");
            return;
        }

        setpredata(formData);
        setdatabool(true);
        toast.success("Form data validated successfully!");
    };

    /* ---------------- API CALL ---------------- */
    const xchange = async () => {
        setloading(true);
        seterror(null);
        
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
        }
        /* ---------- WEEKLY ---------- */
        else if (dur === "Weekly") {
            API_URL = "https://tnreaders.in/mobile/storeweekly";

            formdata.append("date", predata.date);
            formdata.append("week_range", predata.weekRange || getWeekRange(predata.date));
            formdata.append("rasi", predata.rasi);
            formdata.append("name", predata.name);
            formdata.append("kiraganam", predata.kiraganam);
            formdata.append("weekly_kiraganam", predata.weekly_kiraganam);
            formdata.append("advantages", predata.advantages);
            if (predata.prayers) {
                formdata.append("prayers", predata.prayers);
            }
            if (predata.mon_lan) {
                formdata.append("mon_lan", predata.mon_lan);
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
            if (predata.prayers) {
                formdata.append("prayers", predata.prayers);
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const res = await fetch(API_URL, {
                method: "POST",
                body: formdata,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            if (data.success || data.message) {
                const successMsg = data.message || "Data uploaded successfully!";
                seterror(successMsg);
                toast.success(successMsg);
                setdatabool(false); // Close preview after successful upload
                // Reset form
                clearForm();
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (err) {
            let errorMsg = "Upload failed";
            
            if (err.name === 'AbortError') {
                errorMsg = "Request timeout. Please try again.";
            } else if (err.message.includes('NetworkError')) {
                errorMsg = "Network error. Please check your internet connection.";
            } else if (err.message.includes('HTTP error')) {
                errorMsg = `Server error: ${err.message}`;
            }
            
            seterror(errorMsg);
            toast.error(errorMsg);
            console.error("Upload error:", err);
        } finally {
            setloading(false);
        }
    };

    // Clear all form data
    const clearForm = () => {
        setValue(null);
        setSelectedObj("");
        setobject("");
        setWeekRange("");
        setpredata(null);
        setdatabool(false);
        seterror(null);
        
        // Reset form fields if form exists in DOM
        const form = document.querySelector('.form');
        if (form) {
            form.reset();
        }
    };

    return (
        <div className='main'>
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <form className='form' onSubmit={formdatas}>

                <h1>Upload Form</h1>

                <div className="form-header">
                    <button 
                        type="button" 
                        className="btn-clear"
                        onClick={clearForm}
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        Clear Form
                    </button>
                </div>

                <label>கால அளவைத் தேர்வு செய்க:</label>
                <select 
                    className='design' 
                    onChange={(e) => {
                        setdur(e.target.value);
                        setWeekRange(""); // Clear week range when duration changes
                        setValue(null); // Clear date when duration changes
                    }} 
                    required
                    value={dur}
                >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </select>

                <label>தேதி:</label>
                
                {/* Daily Date Selection */}
                {dur === "Daily" && (
                    <input 
                        type='date' 
                        className='design'
                        value={values || ''}
                        onChange={(e) => setValue(e.target.value)}
                        required
                    />
                )}
                
                {/* Weekly Date Selection */}
                {dur === "Weekly" && (
                    <>
                        <BasicDateCalendar
                            onformat={"YYYY-MM-DD"}
                            onDate={handleWeeklyDateChange}
                            placeholder="Select any day of the week"
                            value={values}
                        />
                        {weekRange && (
                            <div className="week-range-display">
                                <strong>Selected Week:</strong> {weekRange}
                                <div className="week-range-note">
                                    (Sunday to Saturday)
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {/* Monthly Date Selection */}
                {dur === "Monthly" && (
                    <BasicDateCalendar
                        onformat={"MMM YYYY"}
                        onDate={setValue}
                        onview={["year", "month"]}
                        onopen={"month"}
                        value={values}
                    />
                )}

                <label>ராசி பெயர்:</label>
                <select 
                    className='design' 
                    name="rasi" 
                    onChange={handleChange} 
                    required
                    value={object}
                >
                    <option value="">Select Rasi</option>
                    {rasiname.map((item) => (
                        <option key={item.rasiId} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <label>Name:</label>
                <input 
                    className='design' 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="Enter name"
                />

                {/* DAILY FIELDS */}
                {dur === "Daily" && (
                    <>
                        <label>Summary:</label>
                        <textarea 
                            className='tadesign' 
                            name="summary" 
                            required 
                            placeholder="Enter daily summary"
                            rows="4"
                        />

                        <label>Lucky Numbers:</label>
                        <input 
                            className='design' 
                            type="text" 
                            name="luckyNumbers" 
                            placeholder="e.g., 7, 14, 21" 
                            required 
                        />

                        <label>Lucky Direction:</label>
                        <input 
                            className='design' 
                            type="text" 
                            name="lucky_dr" 
                            placeholder="e.g., North, East" 
                            required 
                        />

                        <label>Lucky Color:</label>
                        <input 
                            className='design' 
                            type="text" 
                            name="lucky_color" 
                            placeholder="e.g., Red, Blue" 
                            required 
                        />
                    </>
                )}

                {/* WEEKLY FIELDS */}
                {dur === "Weekly" && (
                    <>
                        <label>Kiraganam:</label>
                        <textarea 
                            className='tadesign' 
                            name="kiraganam" 
                            required 
                            placeholder="Enter kiraganam"
                            rows="4"
                        />

                        <label>Weekly Kiraganam:</label>
                        <textarea 
                            className='tadesign' 
                            name="weekly_kiraganam" 
                            required 
                            placeholder="Enter weekly kiraganam"
                            rows="4"
                        />

                        <label>Advantages:</label>
                        <textarea 
                            className='tadesign' 
                            name="advantages" 
                            required 
                            placeholder="Enter advantages"
                            rows="4"
                        />

                        <label>Prayers (Optional):</label>
                        <textarea 
                            className='tadesign' 
                            name="prayers" 
                            placeholder="Enter prayers (optional)"
                            rows="4"
                        />

                        <label>Language (Optional):</label>
                        <select className='design' name="mon_lan">
                            <option value="">Select Language (Optional)</option>
                            <option value="tamil">Tamil</option>
                            <option value="english">English</option>
                        </select>
                    </>
                )}

                {/* MONTHLY FIELDS */}
                {dur === "Monthly" && (
                    <>
                        <label>Kiraganam:</label>
                        <textarea 
                            className='tadesign' 
                            name="kiraganam" 
                            required 
                            placeholder="Enter kiraganam"
                            rows="4"
                        />

                        <label>Language:</label>
                        <select className='design' name="mon_lan" required>
                            <option value="">Select Language</option>
                            <option value="tamil">Tamil</option>
                            <option value="english">English</option>
                        </select>

                        <label>Prayers (Optional):</label>
                        <textarea 
                            className='tadesign' 
                            name="prayers" 
                            placeholder="Enter prayers (optional)"
                            rows="4"
                        />
                    </>
                )}

                <div className="form-buttons">
                    <button 
                        className='btn' 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <CircularIndeterminate /> : "Preview & Submit"}
                    </button>
                </div>

            </form>

            {databool && (
                <Preview 
                    onbool={setdatabool} 
                    onupload={xchange} 
                    ondata={predata}
                    oncancel={() => {
                        setdatabool(false);
                        toast.info("Upload cancelled");
                    }}
                />
            )}
            
            {error && (
                <Errors 
                    onbool={seterror} 
                    onerror={error}
                    onclear={() => {
                        seterror(null);
                        toast.dismiss();
                    }}
                />
            )}

        </div>
    );
};

export default Duration;