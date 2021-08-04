const Web3 = require('web3');

export const generateSalt = () => {
    return Web3.utils.randomHex(32);
}

export const saltedHash = (choice, salt) => {
    return Web3.utils.soliditySha3(choice, salt);
}

/*

// test functionallity against contract

let salt = generateSalt()
console.log(`salt: ${salt}`);
console.log(`salted hash: ${saltedHash(0, salt)}`);
*/