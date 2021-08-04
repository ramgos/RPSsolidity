import React, {useContext} from 'react';
import { web3Context } from './App';
import { generateSalt, saltedHash} from '../saltedRPSHash';


const CreateGame = () => {
    const w3 = useContext(web3Context);

    const createGame = (choice, respondent, blockduration) => {
        let salt = generateSalt();
        let saltedChoice = saltedHash(choice, salt);
    }

    return (
        <div>
            Hello
        </div>
    );
}

export default CreateGame;