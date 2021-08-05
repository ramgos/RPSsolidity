import React from 'react';

const CreateGameField = ({displayText, value, onChange, type}) => {
    return (
        <div>
            <label>{displayText}</label><br />
            <input 
                type={type}
                value={value} 
                onChange={(event) => onChange(event.target.value)}/><br />
        </div>
    );
}

export default CreateGameField;