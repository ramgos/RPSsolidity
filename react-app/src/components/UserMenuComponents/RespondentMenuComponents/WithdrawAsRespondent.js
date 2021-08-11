import React, {useState, useContext} from 'react';
import ErrorMessage from '../../ErrorMessage';

import { web3Context } from '../../App';
import { parsedGameData } from '../../App';
import { handleError } from '../../App';
import { getPremissions } from '../../UserMenu';

import rpsABI from '../../../rpsABI.json';
import envData from '../../../env.json';

const WithdrawAsRespondent = ({gameId, gameData}) => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            gameWithdrawn: false,
            errorMessage: ""
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

    const onRespondentWithdrawal = () => {
        setState((prevState) => {
            return {
                ...prevState,
                gameWithdrawn: true
            }
        })  
    }

    const validateWithdrawInput = async () => {
        // check if gameData has changed while being rendered
        try {
            const blockNumber = await w3.eth.getBlockNumber();
            const reassuredGameData = await parsedGameData(gameId);
    
            const reassuredPremissions = getPremissions(reassuredGameData, blockNumber);
            if (reassuredPremissions.canWithdrawAsRespondent === false) {
                onErrorMessageChange("Your Opponent Cancelled The Game, Or He Still Has Time To Settle The Game, Or You've Withdrawn Already");
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

    const withdrawGame = async () => {
        let userAccount;
        try {
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            if (userAccount !== gameData._respondent) {
                onErrorMessageChange("Accounts Were Changed While The Menu Was Open");
                return;
            }

            const inputIsValid = await validateWithdrawInput();
            if (!inputIsValid) {
                return;
            }

            const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
            const tx_data = await rpsContract
                .methods
                .withdrawAsRespondent(gameId)
                .send({
                    from: userAccount
                })
        
            console.log(tx_data);
            onRespondentWithdrawal();
        }
        catch (error) {
            handleError(error, onErrorMessageChange)
        }
    }

    return (
        <div className="withdraw user-option">
            <ErrorMessage message={state.errorMessage}/>
            <div>
                <p>
                    Your Opponent's Time Is Up. You May Claim Both Of Your Funds <br/>
                    Since He Didn't Settle The Game In The Agreed Time Frame
                </p>
                <input type="button" value="Withdraw Game" className="style-button" onClick={withdrawGame} />
            </div>
        </div>
    );
}

export default WithdrawAsRespondent;