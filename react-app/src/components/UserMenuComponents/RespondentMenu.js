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

    const validateInput = async () => {
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
            
            const inputIsValid = await validateInput();
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
        }

    }

    const acceptOption = () => {
        return (
            <div>
                <ErrorMessage message={state.errorMessage}/>
                <div className="accept user-option" key="accept">
                    <p>
                        This is the respondent menu
                    </p>
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

    const withdrawOption = () => {
        return (
            <div>
                <ErrorMessage message={state.errorMessage}/>
                <div className="withdraw user-option" key="withdraw">
                    <p>
                        This is withdraw option
                    </p>
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
            {render()}
        </div>
    );
}

export default RespondentMenu;