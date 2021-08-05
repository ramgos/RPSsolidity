import React, {useContext, useState} from 'react';
import { web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';

import ChoiceSelection from './CreateGameComponents/ChoiceSelection';
import CreateGameField from './CreateGameComponents/CreateGameField';
import NewGameInfo from './CreateGameComponents/NewGameInfo';

import envData from '../env.json';
import rpsABI from '../rpsABI.json';
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
            duration: 5,
            salt: "",
            gameID: "",
            value: 0,
            saltVisible: false,
            gameCreated: false,
            errorMessage: ""
        }
    });

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

    const onValueChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                value: newValue
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
        }
        else if (!(state.duration >= 5)) {
            onErrorMessageChange("duration must be greater than or equal to 5 blocks (75 seconds)");
        }
        else if (!(Number.parseFloat(state.duration) === Number.parseInt(state.duration))) {
            onErrorMessageChange("duration must be an integer");
        }
        else if (state.choice === -1) {
            onErrorMessageChange("please choose a move");
        }
        else if (state.value < 1) {
            onErrorMessageChange("value should be at least 1 gwei");
        }
        else if (!(Number.parseFloat(state.value) === Number.parseInt(state.value))) {
            onErrorMessageChange("value should be an integer");
        }
        else {
            onErrorMessageChange("");
            return true;
        }
        return false;
    }

    const createGame = () => {
        const inputIsValid = validateInput();
        if (!inputIsValid) {
            return;
        }

        // ensure metamask is connected
        let userAccount;
        w3.eth.requestAccounts()
            .then((userAddresses) => {
                // generate salt
                let salt = generateSalt();
                let saltedChoice = saltedHash(state.choice, salt);

                userAccount = userAddresses[0];

                // create contract interface
                const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
                const parsedValue = Number.parseInt(state.value) * Math.pow(10, 9).toString();  //gwei is trillion wei

                // call create game function in contract
                rpsContract.methods
                    .challenge(saltedChoice, state.respondent, state.duration)
                    .send({
                        from: userAccount,
                        value: parsedValue
                    })
                    .then((tx_data) => {
                        // handle after game created
                        console.log(tx_data);
                        const gameId = tx_data.events.GameCreated.returnValues.gameId;

                        // implement all logic of handling game creation in 'onCreateGame'
                        onCreateGame({
                            salt: salt,
                            gameId: gameId
                        });
                    });
            });
    }
    
    return (
        <div>
            <p>
                {state.errorMessage}
            </p>
            <form>
                <ChoiceSelection onChoiceChange={onChoiceChange}/>
                <CreateGameField 
                    type="text"
                    displayText="respondent:" 
                    value={state.respondent}
                    onChange={onRespondentInputValueChange}/>
                <CreateGameField 
                    type="number"
                    displayText="duration (in blocks)"
                    value={state.duration}
                    onChange={onDurationInputValueChange}/>
                <CreateGameField 
                    type="number"
                    displayText="value (in gwei)"
                    value={state.value}
                    onChange={onValueChange}/>
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