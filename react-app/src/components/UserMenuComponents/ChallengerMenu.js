import React from 'react';
import Settle from './ChallengerMenuComponents/Settle';
import WithdrawAsChallenger from './ChallengerMenuComponents/WithdrawAsChallenger';

const ChallengerMenu = ({gameId, gameData, canSettle, canWithdraw}) => {
    const NoOption = () => {
        return (
            <div className="no-option user-option" key="empty-option">
                <div>
                    <p>
                        You Cannot Settle The Game, Nor Withdraw<br/>
                        (The Game Has Been Settled, Cancelled Or You Didn't Settle In Time And Your Opponent Withdrawn)
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
                You're The Challenger In This Game
            </p>
            {render()}
        </div>
    );
}

export default ChallengerMenu;