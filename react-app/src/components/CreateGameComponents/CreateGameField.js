import React from 'react';

const CreateGameField = ({displayText, value, onChange}) => {
    return (
        <div>
            <label>{displayText}</label><br />
            <input 
                type="text" 
                value={value} 
                onChange={(event) => onChange(event.target.value)}/><br />
        </div>
    );
}

export default CreateGameField;