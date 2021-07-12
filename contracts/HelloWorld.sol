pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;

    constructor(string memory _newMessage) {
        message = _newMessage;
    }

    function getMessage() public view returns(string memory) {
        return message;
    }

    function setMessage(string memory _newMessage) public {
        message = _newMessage;
    }
}