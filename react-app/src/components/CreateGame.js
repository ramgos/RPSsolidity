import React, {useContext, useState} from 'react';
import { web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';

// enum
const Choice = {
    "rock": 0,
    "paper": 1,
    "scissors": 2
}

const CreateGame = () => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            choice: -1,
            respondent: "enter respondent address",
            duration: "enter block duration"
        }
    })

    const createGame = () => {
        let salt = generateSalt();
        let saltedChoice = saltedHash(state.choice, salt);

        console.log(
            `
                New Game Created:
                    - salt: ${salt}
                    - saltedChoice: ${saltedChoice}
                    - choice: ${state.choice}
                    - respondent: ${state.respondent}
                    - blockduration: ${state.duration}
            `
        )
    }

    const onRespondentInputValueChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                respondent: newValue,
            }
        })
    }

    const onDurationInputValueChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                duration: newValue
            }
        })
    }

    const onChoiceChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                choice: newValue
            }
        })
    }

    // TODO: refactor to smaller components
    return (
        <div>
            <form>
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
                        paper: <input 
                            type="radio"
                            value={Choice.scissors}
                            name="choice"/><br />
                    </div>
                </div>
                <label>respondent:</label><br />
                <input 
                    type="text" 
                    value={state.respondent} 
                    onChange={(event) => onRespondentInputValueChange(event.target.value)}/><br />
                
                <label>duration (in blocks):</label><br />
                <input 
                    type="text" 
                    value={state.duration}
                    onChange={(event) => onDurationInputValueChange(event.target.value)} /><br />
                
                <input type="button" value="create game" onClick={() => createGame()}>
                </input>
            </form>
        </div>
    );
}

export default CreateGame;