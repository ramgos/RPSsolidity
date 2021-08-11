import React, {useState, useContext} from 'react';
import ErrorMessage from '../../ErrorMessage';
import SmartField from '../../SmartField';

import { web3Context } from '../../App';
import { parsedGameData } from '../../App';
import { handleError } from '../../App';
import { getPremissions } from '../../UserMenu';

import { ReverseChoice } from '../../App';
import rpsABI from '../../../rpsABI.json';
import envData from '../../../env.json';

const Settle = ({gameId, gameData}) => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            salt: "",
            errorMessage: "",
            gameSettled: false,
            challengerChoice: -1,
            gameResult: ""
        }
    })

    const onErrorMessageChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                errorMessage: newValue
            }
        })
    }

    const onSaltChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                salt: newValue
            }
        })
    }

    const onChallengerSettle = (tx_data, challengerChoice) => {
        setState((prevState) => {
            return {
                ...prevState,
                gameSettled: true,
                challengerChoice: challengerChoice,
                gameResult: tx_data.events.GameEnded.returnValues.result 
            }
        })  
    }

    const validateSettleInput = async () => {
        // check if gameData has changed while being rendered
        try {
            const blockNumber = await w3.eth.getBlockNumber();
            const reassuredGameData = await parsedGameData(gameId);
    
            const reassuredPremissions = getPremissions(reassuredGameData, blockNumber);
            if (reassuredPremissions.canSettle === false) {
                onErrorMessageChange("Your opponent withdrawn the game, or you've settled already");
            }
            else if (!state.salt) {
                onErrorMessageChange("You must provide salt to settle the game");
            }
            else {
                return true;
            }
            return false;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const settleGame = async () => {
        let userAccount;
        try {
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            if (userAccount !== gameData._challenger) {
                onErrorMessageChange("Accounts where changed while the menu was open");
                return;
            }

            const inputIsValid = await validateSettleInput();
            if (!inputIsValid) {
                return;
            }

            // decode challenger choice using salt, determine if salt is valid and user choice
            const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
            const decodeHash = await rpsContract // get challenger choice and salt status
                .methods
                .decodeHash(gameData._saltedHash, state.salt)
                .call()

            const challengerChoice = parseInt(decodeHash[0]); // rpc response is always string
            console.log(decodeHash);

            if (decodeHash[1] === false) {
                onErrorMessageChange("Salt isn't valid");
            }
            else {
                onErrorMessageChange("");
            }

            const tx_data = await rpsContract
                .methods
                .settleGame(gameId, state.salt)
                .send({
                    from: userAccount
                })
    
            console.log(tx_data);
            onChallengerSettle(tx_data, challengerChoice);
        }
        catch (error) {
            handleError(error, onErrorMessageChange);
        }
    }

    const renderConclusion = () => {
        const readableChallengerChoice = ReverseChoice[state.challengerChoice];  // get choice as readable human choice
        const readableOpponentChoice = ReverseChoice[gameData._respondentChoice]; 

        return (
            <div>
                <p>
                    Game finished! <br />
                    {state.gameResult}, <br />
                    Your choice: {readableChallengerChoice} <br />
                    Opponent's choice: {readableOpponentChoice}
                </p>
            </div>
        );
    }

    return (
        <div className="settle user-option">
            <ErrorMessage message={state.errorMessage} />
            <div>
                <p>
                    Your opponent accepted the game. You have limited time to provide the salt, <br />
                    or your opponent will be able to withdraw and win
                </p>
                <SmartField 
                    type="text"
                    displayText="Salt"
                    value={state.salt}
                    onChange={onSaltChange}/>
                <input type="button" value="Settle Game" onClick={settleGame} />
                <div>
                    {state.gameSettled ? renderConclusion() : <div />}
                </div>
            </div>
        </div>
    );
}

export default Settle;