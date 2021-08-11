import React from 'react';

const NewGameInfo = ({salt, saltVisible, onVisibleChange, gameId, gameCreated}) => {
    if (!gameCreated) {
        return <div />;
    }
    if (saltVisible) {
        return (
            <div>
                <p>
                    Your Salt Should Remain Secret,
                    Otherwise Your Opponent Could Rig The Game
                </p>
                <label>Salt: {salt}</label><br />
                <label>GameId: {gameId}</label><br />
                <input type="button" value="Hide salt" className="style-button" onClick={onVisibleChange} />
            </div>
        );
    }
    else {
        return (
            <div>
                <p>
                    Your Salt Should Remain Secret,
                    Otherwise Your Opponent Could Rig The Game
                </p>
                <label>Salt: HIDDEN</label><br />
                <label>GameId: {gameId}</label><br />
                <input type="button" value="Reveal salt" className="style-button" onClick={onVisibleChange} />
            </div>
        );
    }
}

export default NewGameInfo;