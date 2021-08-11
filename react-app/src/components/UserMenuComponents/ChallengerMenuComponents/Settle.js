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
                onErrorMessageChange("Your Opponent Withdrawn The Game, Or You've Settled Already");
            }
            else if (!state.salt) {
                onErrorMessageChange("You Must Provide Salt To Settle The Game");
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
                onErrorMessageChange("Accounts Were Changed While The Menu Was Open");
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
                onErrorMessageChange("Salt Isn't Valid");
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
                    Game Finished! <br />
                    {state.gameResult}, <br />
                    Your Choice: {readableChallengerChoice} <br />
                    Opponent's Choice: {readableOpponentChoice}
                </p>
            </div>
        );
    }

    return (
        <div className="settle user-option">
            <ErrorMessage message={state.errorMessage} />
            <div>
                <p>
                    Your Opponent Accepted The Game. You Have Limited Time To Provide The Salt, <br />
                    Or Your Opponent Will Be Able To Withdraw And Win
                </p>
                <SmartField 
                    type="text"
                    displayText="Salt"
                    value={state.salt}
                    onChange={onSaltChange}/>
                <input type="button" value="Settle Game" className="style-button" onClick={settleGame} />
                <div>
                    {state.gameSettled ? renderConclusion() : <div />}
                </div>
            </div>
        </div>
    );
}

export default Settle;