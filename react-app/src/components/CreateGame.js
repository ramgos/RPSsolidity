import React, {useContext, useState} from 'react';
import { web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';

import ChoiceSelection from './CreateGameComponents/ChoiceSelection';
import CreateGameField from './CreateGameComponents/CreateGameField';
import NewGameInfo from './CreateGameComponents/NewGameInfo';

const Web3 = require('web3');

// enum
export const Choice = {
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
            duration: "enter block duration",
            salt: "",
            gameID: "",
            saltVisible: false,
            gameCreated: false,
            errorMessage: ""
        }
    })

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

    const onErrorMessageChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                errorMessage: newValue
            }
        })
    }

    const onCreateGame = ({salt, gameId}) => {
        setState((prevState) => {
            return {
                ...prevState,
                salt: salt,
                gameId: gameId,
                gameCreated: true
            }
        })
    }

    const validateInput = () => {
        if (!Web3.utils.isAddress(state.respondent)) {
            onErrorMessageChange("respondent isn't a valid address");
            return false;
        }
        else if (!(parseInt(state.duration) >= 5)) {
            onErrorMessageChange("duration must be greater than or equal to 5 blocks (75 seconds)")
            return false;
        }
        else if (state.choice === -1) {
            onErrorMessageChange("Please choose a move")
            return false;
        }
        else {
            onErrorMessageChange("")
            return true;
        }
    }

    const createGame = () => {
        const inputIsValid = validateInput();
        if (!inputIsValid) {
            return;
        }

        let salt = generateSalt();
        let saltedChoice = saltedHash(state.choice, salt);

        // all interaction with contract must be done before calling 'onCreateGame'
        // ---place holder interaction

        onCreateGame({
            salt: salt,
            gameId: "None"
        });

        /*
        console.log(
            `
                New Game Created:
                    - salt: ${salt}
                    - saltedChoice: ${saltedChoice}
                    - choice: ${state.choice}
                    - respondent: ${state.respondent}
                    - duration: ${state.duration}
            `
        )
        */
    }
    return (
        <div>
            <p>
                {state.errorMessage}
            </p>
            <form>
                <ChoiceSelection onChoiceChange={onChoiceChange}/>
                <CreateGameField 
                    displayText="respondent:" 
                    value={state.respondent}
                    onChange={onRespondentInputValueChange}/>
                <CreateGameField 
                    displayText="duration (in blocks)"
                    value={state.duration}
                    onChange={onDurationInputValueChange}/>
                <input type="button" value="create game" onClick={() => createGame()} />
            </form>
            <NewGameInfo 
                salt={state.salt}
                saltVisible={state.saltVisible}
                onVisibleChange={() => {
                    setState((prevState) => {
                        return {
                            ...prevState,
                            saltVisible: !prevState.saltVisible
                        }
                    });
                }}
                gameId={state.gameId}
                gameCreated={state.gameCreated}/>
        </div>
    );
}

export default CreateGame;