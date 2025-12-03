import React from 'react'
import '../styles/durationstyle.css';

function Preview({ onbool, onupload, ondata }) {
    return (
        <div className='error1'>
            <div className='error2'>

                <h2>Preview Details</h2>

                <p>Duration: <span>{ondata.duration}</span></p>
                <p>Date: <span>{ondata.date}</span></p>
                <p>Rasi Name: <span>{ondata.rasi}</span></p>
                <p>Summary: <span>{ondata.summary}</span></p>
                <p>Lucky Color: <span>{ondata.luckyColor}</span></p>
                <p>Lucky Number: <span>{ondata.luckyNumber}</span></p>
                <p>Lucky Direction: <span>{ondata.luckyDirection}</span></p>
                {ondata.imageURL && (
                    <img
                        src={ondata.imageURL}
                        alt="Preview"
                        style={{ width: "100%", marginTop: "10px", borderRadius: "6px" }}
                    />
                )}
                <button className='btn' onClick={() => { onupload(); onbool(false) }}> Upload</button>
                <button className='btn' onClick={() => onbool(false)}>Edit</button>

            </div>
        </div>
    )
}

export default Preview
