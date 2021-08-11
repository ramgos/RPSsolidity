import React, {useContext, useState} from 'react';
import { handleError, web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';

import ChoiceSelection from './CreateGameComponents/ChoiceSelection';
import SmartField from './SmartField';
import NewGameInfo from './CreateGameComponents/NewGameInfo';
import ErrorMessage from './ErrorMessage';
import Description from './Description';

import envData from '../env.json';
import rpsABI from '../rpsABI.json';

const Web3 = require('web3');

const CreateGame = () => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            choice: -1,
            respondent: "",
            duration: 5,
            salt: "",
            gameID: "",
            value: 0,
            saltVisible: false,
            gameCreated: false,
            errorMessage: ""
        }
    });

    // update functions of state

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

    // handle creation of a game

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

    // check all user input is valid

    const validateInput = () => {
        if (!Web3.utils.isAddress(state.respondent)) {
            onErrorMessageChange("Respondent Isn't A Valid Address");
        }
        else if (!(state.duration >= 5)) {
            onErrorMessageChange("Duration Must Be Greater Than Or Equal To 5 Blocks (75 Seconds)");
        }
        else if (!(Number.parseFloat(state.duration) === Number.parseInt(state.duration))) {
            onErrorMessageChange("Duration Must Be An Integer");
        }
        else if (state.choice === -1) {
            onErrorMessageChange("Please Choose A Move");
        }
        else if (state.value < 1) {
            onErrorMessageChange("Value Should Be At Least 1 Gwei");
        }
        else if (!(Number.parseFloat(state.value) === Number.parseInt(state.value))) {
            onErrorMessageChange("Value Should Be An Integer");
        }
        else {
            return true;
        }
        return false;
    }

    // metamask pop up asking user if they want to create a game

    const createGame = async () => {
        const inputIsValid = validateInput();
        if (!inputIsValid) {
            return;
        }

        let userAccount;

        try {
            // ensure metamask is connected
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            if (state.respondent === userAccount || parseInt(state.respondent, 16) === 0) {
                onErrorMessageChange("Challenging Yourself Or The Burn Address Isn't Allowed");
                return;
            }
            else {
                onErrorMessageChange("");
            }

            // generate salt
            const salt = generateSalt();
            const saltedChoice = saltedHash(state.choice, salt);

            // contract interface
            const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
            const parsedValue = Number.parseInt(state.value) * Math.pow(10, 9).toString();

            // call create game function in contract
            const tx_data = await rpsContract
                .methods
                .challenge(saltedChoice, state.respondent, state.duration)
                .send({
                    from: userAccount,
                    value: parsedValue
                })
        
            // handle after game created
            console.log(tx_data);
            const gameId = tx_data.events.GameCreated.returnValues.gameId;
            
            // implement all logic of handling game creation in 'onCreateGame'
            onCreateGame({
                salt: salt,
                gameId: gameId
            });
        }
        catch (error) {
            handleError(error, onErrorMessageChange)
        }
    }
    
    return (
        <div className="bottom-item create-game">
            <div className="inside">
                <Description 
                    title="Create Game"
                    desc="Start a Rock Paper Scissors Match (REMEMBER TO SAVE SALT)"/>
                <ErrorMessage message={state.errorMessage}/>
                <form>
                    <ChoiceSelection onChoiceChange={onChoiceChange}/>
                    <SmartField 
                        type="text"
                        displayText="Respondent" 
                        value={state.respondent}
                        onChange={onRespondentInputValueChange}
                        args={{placeholder: "Respondent Address"}}/>
                    <SmartField 
                        type="number"
                        displayText="Duration (In Blocks)"
                        value={state.duration}
                        onChange={onDurationInputValueChange}/>
                    <SmartField 
                        type="number"
                        displayText="Bet (In Gwei)"
                        value={state.value}
                        onChange={onValueChange}/>
                    <input type="button" value="Create Game" className="style-button" onClick={() => createGame()} />
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
        </div>
    );
}

export default CreateGame;