import React, { useState } from 'react';
import SmartField from './SmartField';

import { parsedGameData } from './App';

const GameInfo = () => {
    const [state, setState] = useState(()=>{
        return {
            gameId: "",
            gameData: {}
        }
    })

    // update state functions

    const onGameIdChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                gameId: newValue
            }
        })
    }

    // get parsed data and update state

    const parseGameData = async () => {
        try {
            const gameData = await parsedGameData(state.gameId)
            setState((prevState) => {
                return {
                    ...prevState,
                    gameData: gameData
                }
            })
        }
        catch (error) {
            console.log(error);
        }
    }

    const showGameData = () => {

        // check that gameId is valid and that game exists

        if (!state.gameData) {
            return (
                <p>
                    Invalid gameId
                </p>
            )
        }
        if (state.gameData && state.gameData.hasOwnProperty("_isGame") &&state.gameData._isGame === false) {
            return(
                <p>
                    This game doesn't exist
                </p>
            );
        }

        // generate formatted list

        let viewableGameData = [];
        for (const attr in state.gameData) {
            viewableGameData.push(
                <li key={attr}>
                    {`${attr}: ${state.gameData[attr]}`}
                </li>
            )
        }
        return viewableGameData;
    }

    return (
        <div className="bottom-item game-info">
            <div className="inside">
                <p>
                    enter a gameId to view data about that game
                </p>
                <SmartField 
                    type="text"
                    displayText="gameId"
                    value={state.gameId}
                    onChange={onGameIdChange}
                    />
                <input type="button" value="view data" onClick={parseGameData} />
                <ul>
                    {showGameData()}
                </ul>
            </div>
        </div>
    );
}

export default GameInfo;