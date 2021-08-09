import React from 'react';

const SmartField = ({displayText, value, onChange, type, args}) => {
    return (
        <div className="smart-field">
            <label>{displayText}</label><br />
            <input 
                type={type}
                value={value} 
                onChange={(event) => onChange(event.target.value)}
                {...args}/><br />
        </div>
    );
}

export default SmartField;