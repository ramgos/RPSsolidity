import React, {useContext, useState} from 'react';
import { Utils } from 'web3-utils';
import { web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';

import ChoiceSelection from './CreateGameComponents/ChoiceSelection';
import CreateGameField from './CreateGameComponents/CreateGameField';
import NewGameInfo from './CreateGameComponents/NewGameInfo';

// enum
export const Choice = {
    "rock": 0,
    "paper": 1,
    "scissors": 2
}

const CreateGame = () => {
    console.log("rendered");
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
                    - duration: ${state.duration}
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
                        console.log(`saltVisible: ${state.saltVisible}`)
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