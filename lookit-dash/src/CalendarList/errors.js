import React from 'react'
import '../styles/durationstyle.css';
function Errors({ onbool, onerror }) {
    return (
        <div className='error1'>
            <div className='error2'>
                <h3>{onerror}</h3>
                <button className='btn' onClick={() => onbool()}>OK</button>
            </div>
        </div>
    )
}

export default Errors
