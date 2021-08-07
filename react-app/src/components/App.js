import React from "react";
import CreateGame from "./CreateGame";
import GameInfo from "./GameInfo";
const Web3 = require('web3');

export const web3Context = React.createContext();
export const Choice = {
  "rock": 0,
  "paper": 1,
  "scissors": 2
}

const w3 = new Web3(window.ethereum);

function App() {
  return (
    <web3Context.Provider value={w3}> 
      <div>
        <CreateGame />
        <GameInfo />
      </div>
    </web3Context.Provider>
  );
}

export default App;
