import React from "react";
import CreateGame from "./CreateGame";
import GameInfo from "./GameInfo";
import UserMenu from "./UserMenu";

import rpsABI from '../rpsABI.json';
import envData from '../env.json';

import './style.css'
import tutsvg from '../tutsvg.svg';

const Web3 = require('web3');

//provider
export const web3Context = React.createContext();

//enum
export const Choice = {
  "rock": 0,
  "paper": 1,
  "scissors": 2
}

export const ReverseChoice = ["Rock", "Paper", "Scissors"];

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
          onErrorMessageChange("Please Confirm Metamask To Use This Dapp");
          break;
      case -32603:
          onErrorMessageChange(
              "An RPC Error Occured"
          )
          break;
      default:
          onErrorMessageChange(
              "Something Went Wrong, Please Try Again Later"
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
              Rock Paper Scissors On The Rinkeby Network
              Using Salted Hashes <br /> 
              Contract Address: {envData.contractAddress}
            </p>
          </div>
          <div className="tutorial">
            <img src={tutsvg} alt="tutorial"/>
          </div>
        </div>
        <div className="main">
          <div className="middle">
            <UserMenu/>
          </div>
          <div className="bottom">
            <CreateGame />
            <GameInfo />
          </div>
        </div>
      </div>
    </web3Context.Provider>
  );
}

export default App;
