import React, {useState, useContext} from 'react';

import RespondentMenu from './UserMenuComponents/RespondentMenu';
import ChallengerMenu from './UserMenuComponents/ChallengerMenu';
import SmartField from './SmartField';
import ErrorMessage from './ErrorMessage';

import { handleError, web3Context } from './App';
import { parsedGameData } from './App';
import { UserType } from './App';
import Description from './Description';

// get premissions of all types of users based on gameData and blockNumber
export const getPremissions = (gameData, blockNumber) => {
    return {
        canAccept: !gameData._hasStarted && !gameData._isFinished,
        canWithdrawAsRespondent: gameData._hasStarted && (blockNumber - gameData._blocknumber >= gameData._blockduration) && !gameData._isFinished,
        canSettle: gameData._hasStarted && !gameData._isFinished,
        canWithdrawAsChallenger: !gameData._hasStarted && !gameData._isFinished,
    }
}

const UserMenu = () => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            gameId: "",
            gameData: {},
            blockNumber: -1, // determine only on reveal menu,

            canAccept: false,
            canWithdrawAsRespondent: false,
            canSettle: false,
            canWithdrawAsChallenger: false,

            userType: -1,  // in order to not show directly "you're not part of this game"
            errorMessage: ""
        }
    })

    const onGameIdChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                gameId: newValue
            }
        })
    }

    const onGameDataChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                gameData: newValue
            }
        })
    }

    // must be of UserType enum
    const onUserTypeChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                userType: newValue  
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

    // doesn't actually update per block
    const onBlockNumberChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                blockNumber: newValue
            }
        })
    }

    // update premission based on gameData
    const updatePremissions = () => {
        setState((prevState) => {
            return {
                ...prevState,
                ...getPremissions(prevState.gameData, prevState.blockNumber)
            }
        })
    }

    const appropriateMenu = () => {
        switch (state.userType) {
            case UserType.challenger:
                return (
                    <div>
                        <ChallengerMenu 
                            gameId={state.gameId} 
                            gameData={state.gameData}
                            canSettle={state.canSettle}
                            canWithdraw={state.canWithdrawAsChallenger}/>
                    </div>
                );
            case UserType.respondent:
                return (
                    <div>
                        <RespondentMenu 
                            gameId={state.gameId} 
                            gameData={state.gameData}
                            canAccept={state.canAccept}
                            canWithdraw={state.canWithdrawAsRespondent}/>
                    </div>
                );
            case UserType.none:
                return (
                    <div>
                        <p>
                            You're not part of this game
                        </p>
                    </div>
                );
            default:
                return (
                    <div>
                    </div>
                );
        }
    }

    const revealUserMenu = async () => {
        let userAccount;
        
        try {
            // request account
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            const gameData = await parsedGameData(state.gameId);
            if(gameData && gameData._isGame === true) {
                onErrorMessageChange("");
                onGameDataChange(gameData);
            }
            else if (gameData && gameData._isGame === false) {
                onErrorMessageChange("Game doesn't exist")
                return
            }
            else {
                onErrorMessageChange("Invalid GameID")
                return
            }
            
            const blockNumber = await w3.eth.getBlockNumber();
            onBlockNumberChange(blockNumber);

            // determine what each type of user can and can't do based on game data
            updatePremissions();

            // determine user type
            switch (userAccount) {
                case gameData._challenger:
                    onUserTypeChange(UserType.challenger);
                    break;
                case gameData._respondent:
                    onUserTypeChange(UserType.respondent);
                    break;
                default:
                    onUserTypeChange(UserType.none);
            }
            onErrorMessageChange("");
        }
        catch (error) {
            handleError(error, onErrorMessageChange)
        }
    }

    return (
        <div className="bottom-item user-menu">
            <div className="inside">
                <Description 
                    title="User Menu"
                    desc="User Menu Description"/>
                <ErrorMessage message={state.errorMessage}/>
                <div>
                    <SmartField 
                        type="text"
                        displayText="GameId"
                        value={state.gameId}
                        onChange={onGameIdChange}/>
                    <input type="button" value="Open User Menu" onClick={revealUserMenu} />
                </div>
                {appropriateMenu()}
            </div>
        </div>
    );
}

export default UserMenu;