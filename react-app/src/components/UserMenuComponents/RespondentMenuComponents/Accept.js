import React, {useState, useContext} from 'react';
import ErrorMessage from '../../ErrorMessage';
import ChoiceSelection from '../../CreateGameComponents/ChoiceSelection';

import { web3Context } from '../../App';
import { parsedGameData } from '../../App';
import { handleError } from '../../App';
import { getPremissions } from '../../UserMenu';

import rpsABI from '../../../rpsABI.json';
import envData from '../../../env.json';

const Accept = ({gameId, gameData}) => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            choice: -1,
            errorMessage: "",
            gameAccepted: true
        }
    })

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

    const onGameAccepted = () => {
        setState((prevState) => {
            return {
                ...prevState,
                gameAccepted: true
            }
        })
    }

    const validateAcceptInput = async () => {
        // check if gameData has changed while being rendered
        try {
            const blockNumber = await w3.eth.getBlockNumber();
            const reassuredGameData = await parsedGameData(gameId);
    
            const reassuredPremissions = getPremissions(reassuredGameData, blockNumber);
            if (reassuredPremissions.canAccept === false) {
                onErrorMessageChange("Your opponent cancelled the game, or you've already accepted the game");
            } 
            else if (state.choice === -1) {
                onErrorMessageChange("Please choose a move");
            }
            else {
                onErrorMessageChange("");
                return true;
            }
            return false;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const acceptGame = async () => {
        let userAccount;
        try {
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            if (userAccount !== gameData._respondent) {
                onErrorMessageChange("Accounts were changed while the menu was open");
                return;
            }
            
            const inputIsValid = await validateAcceptInput();
            if (!inputIsValid) {
                return;
            }

            const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
            const gameValue = gameData._stake;

            const tx_data = await rpsContract
                .methods
                .accept(gameId, state.choice)
                .send({
                    from: userAccount,
                    value: gameValue
                })
            
             console.log(tx_data);
             onGameAccepted();
        }
        catch (error) {
            console.log(error);
            handleError(error, onErrorMessageChange)
        }
    }

    return (
        <div>
            <ErrorMessage message={state.errorMessage}/>
            <div className="accept user-option" key="accept">
                <label>
                    This Game's bet is: {gameData._stake / Math.pow(10, 9)} Gwei <br />
                    ({gameData._stake / Math.pow(10, 18)} Ether) <br/>
                    Game duration: {gameData._blockduration} blocks
                </label>
                <ChoiceSelection onChoiceChange={onChoiceChange}/>
                <input type="button" value="Accept Game" onClick={acceptGame} />
            </div>
        </div>
    );
}

export default Accept;