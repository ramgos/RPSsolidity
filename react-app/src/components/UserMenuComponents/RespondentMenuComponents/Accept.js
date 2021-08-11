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
            gameAccepted: false
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
                onErrorMessageChange("Your Opponent Cancelled The Game, Or You've Already Accepted The Game");
            } 
            else if (state.choice === -1) {
                onErrorMessageChange("Please Choose A Move");
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
                onErrorMessageChange("Accounts Were Changed While The Menu Was Open");
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
            handleError(error, onErrorMessageChange);
        }
    }

    return (
        <div className="accept user-option">
            <ErrorMessage message={state.errorMessage}/>
            <div>
                <label>
                    This Game's Bet Is: {gameData._stake / Math.pow(10, 9)} Gwei <br />
                    ({gameData._stake / Math.pow(10, 18)} Ether) <br/>
                    Game Duration: {gameData._blockduration} Blocks
                </label>
                <ChoiceSelection onChoiceChange={onChoiceChange}/>
                <input type="button" value="Accept Game" className="style-button" onClick={acceptGame} />
            </div>
        </div>
    );
}

export default Accept;