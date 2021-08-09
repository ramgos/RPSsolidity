import React, {useContext, useState} from 'react';
import { web3Context } from './App';
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
            onErrorMessageChange("Respondent isn't a valid address");
        }
        else if (!(state.duration >= 5)) {
            onErrorMessageChange("Duration must be greater than or equal to 5 blocks (75 seconds)");
        }
        else if (!(Number.parseFloat(state.duration) === Number.parseInt(state.duration))) {
            onErrorMessageChange("Duration must be an integer");
        }
        else if (state.choice === -1) {
            onErrorMessageChange("Please choose a move");
        }
        else if (state.value < 1) {
            onErrorMessageChange("Value should be at least 1 gwei");
        }
        else if (!(Number.parseFloat(state.value) === Number.parseInt(state.value))) {
            onErrorMessageChange("Value should be an integer");
        }
        else {
            onErrorMessageChange("");
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
                onErrorMessageChange("Challenging yourself or the burn address isn't allowed");
                return;
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
            console.log(error);
            switch (error.code) {
                case 4001:
                    onErrorMessageChange("Please confirm metamask to use this dapp");
                    break;
                case -32603:
                    onErrorMessageChange(
                        "An RPC error occured. did you try to challenge yourself or the burn address?"
                    )
                    break;
                default:
                    onErrorMessageChange(
                        "Something went wrong, please try again later." + 
                        "None of your funds have been lost, but you may have lost gas money"
                    )
                    break
            }
        }
    }
    
    return (
        <div className="bottom-item create-game">
            <div className="inside">
                <Description 
                    title="Create Game"
                    desc="Create Game Description"/>
                <ErrorMessage message={state.errorMessage}/>
                <form>
                    <ChoiceSelection onChoiceChange={onChoiceChange}/>
                    <SmartField 
                        type="text"
                        displayText="Respondent:" 
                        value={state.respondent}
                        onChange={onRespondentInputValueChange}
                        args={{placeholder: "enter respondent address"}}/>
                    <SmartField 
                        type="number"
                        displayText="Duration (in blocks)"
                        value={state.duration}
                        onChange={onDurationInputValueChange}/>
                    <SmartField 
                        type="number"
                        displayText="Bet (in gwei)"
                        value={state.value}
                        onChange={onValueChange}/>
                    <input type="button" value="Create Game" onClick={() => createGame()} />
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