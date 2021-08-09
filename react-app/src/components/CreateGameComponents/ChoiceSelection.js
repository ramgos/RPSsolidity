import React from 'react';
import { Choice } from '../App';

const ChoiceSelection = ({onChoiceChange}) => {
    return (
        <div className="rps-choice">
            <div className="rps-choice-title">
                <label><h4>Choice:</h4></label>
            </div>
            <div onChange={(event) => onChoiceChange(event.target.value)} className="rps-choice-radio">
                Rock: <input 
                    type="radio"
                    value={Choice.rock}
                    name="choice"/><br />
                Paper: <input 
                    type="radio"
                    value={Choice.paper}
                    name="choice"/><br />
                Scissors: <input 
                    type="radio"
                    value={Choice.scissors}
                    name="choice"/><br />
            </div>
        </div>
    );
}

export default ChoiceSelection;