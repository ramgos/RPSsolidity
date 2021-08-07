import React, {useState, useContext} from 'react';
import { web3Context } from './App';
import SmartField from './SmartField';

import envData from '../env.json';
import rpsABI from '../rpsABI.json';

const GameInfo = () => {
    const w3 = useContext(web3Context);

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

    // return game data as an object

    const parsedGameData = async () => {
        const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
        try {
            let response = {};

            const gameData1 = await rpsContract
                .methods
                .getGameData1(state.gameId)
                .call();

            const gameData2 = await rpsContract
                .methods
                .getGameData2(state.gameId)
                .call();

            for (const attr in gameData1) {
                if (isNaN(attr)) {
                    response[attr] = gameData1[attr];
                }
            }
            for (const attr in gameData2) {
                if (isNaN(attr)) {
                    response[attr] = gameData2[attr];
                }
            }

            return response;
        }
        catch (error) {
            console.log(error);
        }
    }

    // get parsed data and update state

    const parseGameData = async () => {
        try {
            const gameData = await parsedGameData()
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
        <div>
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
    );
}

export default GameInfo;