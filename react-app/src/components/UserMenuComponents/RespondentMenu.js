import React from 'react';
import Accept from './RespondentMenuComponents/Accept';
import WithdrawAsRespondent from './RespondentMenuComponents/WithdrawAsRespondent';

const RespondentMenu = ({gameId, gameData, canAccept, canWithdraw}) => {
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

    const render = () => {
        let options = [];
        if (canAccept) {
            options.push(<Accept gameId={gameId} gameData={gameData}/>);
        }
        if (canWithdraw) {
            options.push(<WithdrawAsRespondent gameId={gameId} gameData={gameData}/>);
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