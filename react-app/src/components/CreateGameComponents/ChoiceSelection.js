import React from 'react';
import { Choice } from '../App';

const ChoiceSelection = ({onChoiceChange}) => {
    return (
        <div>
            <label>choice:</label><br />
            <div onChange={(event) => onChoiceChange(event.target.value)}>
                rock: <input 
                    type="radio"
                    value={Choice.rock}
                    name="choice"/><br />
                paper: <input 
                    type="radio"
                    value={Choice.paper}
                    name="choice"/><br />
                scissors: <input 
                    type="radio"
                    value={Choice.scissors}
                    name="choice"/><br />
            </div>
        </div>
    );
}

export default ChoiceSelection;