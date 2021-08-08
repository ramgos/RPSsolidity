import React, {useState, useContext} from 'react';
import RespondentMenu from './UserMenuComponents/RespondentMenu';
import ChallengerMenu from './UserMenuComponents/ChallengerMenu';
import SmartField from './SmartField';

import { web3Context } from './App';
import { parsedGameData } from './App';
import { UserType } from './App';

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
                    onErrorMessageChange("please confirm metamask to use this dapp");
                    break;
                case -32603:
                    onErrorMessageChange(
                        "an RPC error occured"
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
        <div>
            <p>
                {state.errorMessage}
            </p>
            <div>
                <SmartField 
                    type="text"
                    displayText="gameId"
                    value={state.gameId}
                    onChange={onGameIdChange}/>
                <input type="button" value="reveal user menu" onClick={revealUserMenu} />
            </div>
            {appropriateMenu()}
        </div>
    );
}

export default UserMenu;