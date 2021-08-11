import React from 'react';
import Settle from './ChallengerMenuComponents/Settle';
import WithdrawAsChallenger from './ChallengerMenuComponents/WithdrawAsChallenger';

const ChallengerMenu = ({gameId, gameData, canSettle, canWithdraw}) => {
    const NoOption = () => {
        return (
            <div className="no-option user-option" key="empty-option">
                <div>
                    <p>
                        You cannot settle the game, nor withdraw<br/>
                        (The game has been settled, cancelled or you didn't settle in time and your opponent withdrawn)
                    </p>
                </div>
            </div>
        )
    }

    const render = () => {
        let options = [];
        if (canSettle) {
            options.push(<Settle gameId={gameId} gameData={gameData} key="settle"/>);
        }
        if (canWithdraw) {
            options.push(<WithdrawAsChallenger gameId={gameId} gameData={gameData} key="withdraw"/>);
        }
        if (!Array.isArray(options) || !options.length) {
            options.push(NoOption())
        }
        return options;
    }

    return (
        <div className="respondent-menu">
            <p>
                You're the challenger in this game
            </p>
            {render()}
        </div>
    );
}

export default ChallengerMenu;