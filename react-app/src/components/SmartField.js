import React from 'react';

const SmartField = ({displayText, value, onChange, type}) => {
    return (
        <div className="smart-field">
            <label>{displayText}</label><br />
            <input 
                type={type}
                value={value} 
                onChange={(event) => onChange(event.target.value)}/><br />
        </div>
    );
}

export default SmartField;