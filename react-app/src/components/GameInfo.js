import React, { useState } from 'react';

import SmartField from './SmartField';
import ErrorMessage from './ErrorMessage';
import Description from './Description';

import { parsedGameData } from './App';

const GameInfo = () => {
    const [state, setState] = useState(()=>{
        return {
            gameId: "",
            gameData: {},
            errorMessage: ""
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

    const onGameDataChange = (newValue) => {
        setState((prevState) => {
            return {
                ...prevState,
                gameData: newValue
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

    // get parsed data and update state

    const parseGameData = async () => {
        try {
            const gameData = await parsedGameData(state.gameId)
            if(gameData && gameData._isGame === true) {
                onErrorMessageChange("");
                onGameDataChange(gameData);
            }
            else if (gameData && gameData._isGame === false) {
                onErrorMessageChange("Game Doesn't Exist")
            }
            else {
                onErrorMessageChange("Invalid GameID")
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const showGameData = () => {

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
                <Description 
                    title="Game Info"
                    desc="View Information Of A Game (0=Rock, 1=Paper, 2=Scissors)"/>
                <ErrorMessage message={state.errorMessage}/>
                <SmartField 
                    type="text"
                    displayText="GameId"
                    value={state.gameId}
                    onChange={onGameIdChange}
                    />
                <input type="button" value="View Data" className="style-button" onClick={parseGameData} />
                <ul>
                    {showGameData()}
                </ul>
            </div>
        </div>
    );
}

export default GameInfo;