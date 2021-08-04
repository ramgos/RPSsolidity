import React from "react";
import CreateGame from "./CreateGame";
const Web3 = require('web3');

export const web3Context = React.createContext();
const w3 = new Web3(window.ethereum);

function App() {
  return (
    <web3Context.Provider value={w3}> 
      <div>
        <CreateGame />
        Hello
      </div>
    </web3Context.Provider>
  );
}

export default App;
