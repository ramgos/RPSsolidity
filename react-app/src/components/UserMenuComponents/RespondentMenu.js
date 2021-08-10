import React, {useState, useContext} from 'react';
import { parsedGameData, web3Context } from '../App';
import { getPremissions } from '../UserMenu';

import ChoiceSelection from '../CreateGameComponents/ChoiceSelection';
import ErrorMessage from '../ErrorMessage';

import rpsABI from '../../rpsABI.json';
import envData from '../../env.json';


const RespondentMenu = ({gameId, gameData, canAccept, canWithdraw}) => {
    const w3 = useContext(web3Context);
    // fetch game data at the beggining of each render

    const [state, setState] = useState(() => {
        return {
            choice: -1,
            gameAccepted: false,
            gameWithdrawn: false,
            errorMessage: ""
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

    const onRespondentWithdrawal = () => {
        setState((prevState) => {
            return {
                ...prevState,
                gameWithdrawn: true
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
                onErrorMessageChange("Your opponent cancelled the game, or you already accepted the game");
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
                onErrorMessageChange("Accounts where changed while the menu was open");
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

    const acceptOption = () => {
        return (
            <div>
                <ErrorMessage message={state.errorMessage}/>
                <div className="accept user-option" key="accept">
                    <label>
                        This Game's bet is: {gameData._stake / Math.pow(10, 9)} Gwei <br />
                        ({gameData._stake / Math.pow(10, 18)} Ether)
                    </label>
                    <ChoiceSelection onChoiceChange={onChoiceChange}/>
                    <input type="button" value="Accept Game" onClick={acceptGame} />
                </div>
            </div>
        );
    }

    const validateWithdrawInput = async () => {
        // check if gameData has changed while being rendered
        try {
            const blockNumber = await w3.eth.getBlockNumber();
            const reassuredGameData = await parsedGameData(gameId);
    
            const reassuredPremissions = getPremissions(reassuredGameData, blockNumber);
            if (reassuredPremissions.canWithdrawAsRespondent === false) {
                onErrorMessageChange("Your opponent cancelled the game, or he still has time to settle the game, or you've withdrawn already");
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
                onErrorMessageChange("Accounts where changed while the menu was open");
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

    const withdrawOption = () => {
        return (
            <div>
                <ErrorMessage message={state.errorMessage}/>
                <div className="withdraw user-option" key="withdraw">
                    <input type="button" value="Withdraw Game" onClick={withdrawGame} />
                </div>
            </div>
        );
    }

    const NoOption = () => {
        return (
            <div className="no-option user-option" key="empty-option">
                <div>
                    <p>
                        You cannot accept the game <br />
                        (your opponent cancelled or you've accepted already)
                    </p>
                    <p>
                        If you've accepted the game, you need to wait for your opponent<br />
                        to settle the game before you can withdraw
                    </p>
                </div>
            </div>
        )
    }

    // hacky wat to render using promises - a bit junky
    const render = () => {
        let options = [];
        if (canAccept) {
            options.push(acceptOption());
        }
        if (canWithdraw) {
            options.push(withdrawOption());
        }
        if (!Array.isArray(options) || !options.length) {
            options.push(NoOption())
        }
        return options;
    }

    return (
        <div className="respondent-menu">
            <p>
                You're the respondent in this game
            </p>
            {render()}
        </div>
    );
}

export default RespondentMenu;