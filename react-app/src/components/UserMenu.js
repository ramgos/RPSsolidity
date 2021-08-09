import React, {useState, useContext} from 'react';

import RespondentMenu from './UserMenuComponents/RespondentMenu';
import ChallengerMenu from './UserMenuComponents/ChallengerMenu';
import SmartField from './SmartField';
import ErrorMessage from './ErrorMessage';

import { web3Context } from './App';
import { parsedGameData } from './App';
import { UserType } from './App';
import Description from './Description';

const UserMenu = () => {
    const w3 = useContext(web3Context);

    const [state, setState] = useState(() => {
        return {
            gameId: "",
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

    const appropriateMenu = () => {
        switch (state.userType) {
            case UserType.challenger:
                return (
                    <div>
                        <ChallengerMenu />
                    </div>
                );
            case UserType.respondent:
                return (
                    <div>
                        <RespondentMenu />
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
            const userAddresses = await w3.eth.requestAccounts();
            userAccount = userAddresses[0];

            const gameData = await parsedGameData(state.gameId);
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
            console.log(error);
            switch (error.code) {
                case 4001:
                    onErrorMessageChange("Please confirm metamask to use this dapp");
                    break;
                case -32603:
                    onErrorMessageChange(
                        "An RPC error occured"
                    )
                    break;
                default:
                    onErrorMessageChange(
                        "Something went wrong, did you paste the code correctly?"
                    )
                    break
            }
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