import React, { useState } from 'react';
import BasicDateCalendar from './date';
import "../styles/durationstyle.css";
import rasiname from './json/rasipalan.json';
// import star from '../json/star.json';
import AntDatePicker from './antdatepicker';
import Preview from './preview';
import Errors from './errors';
import CircularIndeterminate from './loader';

const Duration = () => {
    const [values, setValue] = useState(null);
    const [dur, setdur] = useState("Daily");
    const [selectobj, setSelectedObj] = useState("");
    const [object, setobject] = useState("மேஷம்");
    const [predata, setpredata] = useState(null);
    const [databool, setdatabool] = useState(false);
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState(null);
    const [fileName,setfileName] = useState("No File Chosen")
    // const [nat, setnat] = useState();
    // const [det, setdet] = useState("");

    const handleChange = (e) => {
        const selectedName = e.target.value;
        const match = rasiname.find(item => item.name === selectedName);
        if (!match) {
            setSelectedObj(null);
            return;
        }
        setSelectedObj(match.rasiId);
        setobject(selectedName);
        console.log("selected rasiId:", selectobj);
        console.log("selected rasiname:", object);

    };

    // const compare = star.find(item => item.name === object);
    // const natcha = compare.natchathiram;
    // console.log(compare.natchathiram);

    // useEffect(() => {
    //     if (natcha) {
    //         setnat(
    //             natcha.map((item) => ({
    //                 ...item,
    //                 details: det,
    //             }))
    //         );
    //     }
    // }, [natcha, det]);

    const formdatas = (e) => {
        e.preventDefault();
        const data = {
            "duration": dur,
            "date": values,
            "rasi": e.target.rasi.value,
            "summary": e.target.summary.value,
            "luckyColor": e.target.lucky_color.value,
            "luckyNumber": e.target.luckyNumbers.value,
            "luckyDirection": e.target.lucky_dr.value,
            "imageFile": e.target.image.files[0],      // file
            "imageURL": e.target.image.files[0] ? URL.createObjectURL(e.target.image.files[0]) : null, // preview image
        };
        setpredata(data);
        setdatabool(true);

    }

    const xchange = async () => {
        setloading(true);
        const formdata = new FormData();
        formdata.append("date", values)
        formdata.append("rasiId", selectobj)
        formdata.append("name", predata.rasi)
        formdata.append("summary", predata.summary)
        formdata.append("luckyNumbers", predata.luckyNumber)
        formdata.append("lucky_dr", predata.luckyDirection)
        formdata.append("lucky_color", predata.luckyColor)
        formdata.append("duration", dur)
        formdata.append("image", predata.imageFile)
        // formdata.append("natchathiram",nat)

        console.log(formdata)

        await fetch("https://tnreaders.in/mobile/rasi-daily-store", {
            method: "POST",
            body: formdata
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    seterror(data.message)
                }
                seterror(data.message);
                // setTimeout(window.location.reload(),2000);
                setloading(false);
                console.log(data)
            });
    }


    return (
        <div className='main'>
            <form className='form' onSubmit={formdatas} encType="multipart/form-data">
                <h1>Upload-Form</h1>

                <label>கால அளவைத் தேர்வு செய்க:</label>
                <select className='design' onChange={(e) => { setdur(e.target.value); }} required>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </select>

                <label>தேதி:</label>
                {dur === "Daily" &&
                    <BasicDateCalendar onformat={"YYYY-MM-DD"} onDate={setValue} />}
                {dur === "Weekly" &&
                    <div className="custom-week-picker">
                        <AntDatePicker onDate={setValue} />
                    </div>}
                {dur === "Monthly" &&
                    <BasicDateCalendar onformat={"MMM-YYYY"} onDate={setValue} onview={["year", "month"]} onopen={"month"} />}
                {dur === "Yearly" &&
                    <BasicDateCalendar onformat={"YYYY"} onDate={setValue} onview={["year"]} onopen={"year"} />}

                <label>ராசி பெயர்:</label>
                <select className='design' name="rasi" onChange={handleChange} required>
                    <option></option>
                    {rasiname.map((item) => (
                        <option key={item.rasiId} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>

                {/* {
                    natcha.map((key, index) => {
                        return (
                            <>
                                <select className='design' key={index}>
                                    <option key={index}>{key.star}</option>
                                </select>
                                <input className='design' type='text' name='details' placeholder='விவரங்கள்/விபரங்கள்' onChange={(e) => setdet(e.target.value)} required />
                            </>);
                    })
                } */}

                <label>சுருக்கம்:</label>
                <textarea className='tadesign' type='text' name='summary' placeholder='சுருக்கம்' required />
                <label>அதிர்ஷ்ட எண்:</label>
                <input className='design' type='text' name='luckyNumbers' placeholder='அதிர்ஷ்ட எண்' required />
                <label>அதிர்ஷ்ட நிறம்:</label>
                <input className='design' type='text' name='lucky_color' placeholder='அதிர்ஷ்ட நிறம்' required />
                <label>அதிர்ஷ்ட திசை:</label>
                <input className='design' type='text' name='lucky_dr' placeholder='அதிர்ஷ்ட திசை' required />
                <label>Upload Image:</label>
                <input className='design' type='file' name='image' accept="image/*" placeholder='Upload Image only' onChange={(e) => { const file = e.target.files[0]; if (file) { setfileName(file.name); } }} required />
                <strong>{fileName}</strong>
                <button className='btn' disabled={loading}>{
                    loading ? <CircularIndeterminate /> : "Upload"
                }</button>
            </form>
            {
                databool === true && <Preview onbool={setdatabool} onupload={xchange} ondata={predata} />
            }
            {
                error && <Errors onbool={seterror} onerror={error} />
            }
        </div >
    )
}

export default Duration
