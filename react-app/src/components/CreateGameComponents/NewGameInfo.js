import React from 'react';

const NewGameInfo = ({salt, saltVisible, onVisibleChange, gameId, gameCreated}) => {
    if (!gameCreated) {
        return <div />;
    }
    if (saltVisible) {
        return (
            <div>
                <p>
                    Your salt should remain secret,
                    otherwise your opponent could rig the game
                </p>
                <label>Salt: {salt}</label><br />
                <label>GameId: {gameId}</label><br />
                <input type="button" value="hide salt" onClick={onVisibleChange} />
            </div>
        );
    }
    else {
        return (
            <div>
                <p>
                    Your salt should remain secret,
                    otherwise your opponent could rig the game
                </p>
                <label>Salt: HIDDEN</label><br />
                <label>GameId: {gameId}</label><br />
                <input type="button" value="reveal salt" onClick={onVisibleChange} />
            </div>
        );
    }
}

export default NewGameInfo;