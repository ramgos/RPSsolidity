import React from "react";
import CreateGame from "./CreateGame";
import GameInfo from "./GameInfo";
import UserMenu from "./UserMenu";

import rpsABI from '../rpsABI.json';
import envData from '../env.json';

import './style.css'

const Web3 = require('web3');

/*
  # TODO LIST:
  #
  # 1.
  #   Refactor view data component to display errors above UI and not inside ✓    **DONE**
  # 2.
  #   Add titles and descriptions to components ✓    **DONE**
  # 3.
  #   Add styling inside components (flexbox and whatev)
  # 4.
  #   Move user menu above create game and view game data
  # 5. 
  #   Create Respondent Menu ✓    **DONE**
  # 6.
  #   Create Challenger Menu ✓    **DONE**
  #
*/


//provider
export const web3Context = React.createContext();

//enum
export const Choice = {
  "rock": 0,
  "paper": 1,
  "scissors": 2
}

export const ReverseChoice = ["rock", "paper", "scissors"];

//enum
export const UserType = {
  "none": 0,
  "challenger": 1,
  "respondent": 2,
}

// get game data parsed as one object
// returns nothing if user rejects
export const parsedGameData = async (gameId) => {
  const rpsContract = new w3.eth.Contract(rpsABI, envData.contractAddress);
  try {
      let response = {};

      const gameData1 = await rpsContract
          .methods
          .getGameData1(gameId)
          .call();

      const gameData2 = await rpsContract
          .methods
          .getGameData2(gameId)
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

// handle errors in async functions that require metamask
export const handleError = (error, onErrorMessageChange) => {
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
              "Something went wrong, please try again later"
          )
          break
  }
}

//provider
const w3 = new Web3(window.ethereum);

function App() {
  return (
    <web3Context.Provider value={w3}> 
      <div className="app">
        <div className="top">
          <div className="main-title">
            <h1>Rock Paper Scissors</h1>
          </div>
          <div className="main-description">
            <p>
              Rock Paper Scissors on the Ethereum blockchain
              using salted hashes. <br />  
            </p>
          </div>
        </div>
        <div className="bottom">
          <CreateGame />
          <GameInfo/>
          <UserMenu/>
        </div>
      </div>
    </web3Context.Provider>
  );
}

export default App;
