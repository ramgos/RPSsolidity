pragma solidity ^0.8.0;


contract RockPaperScissors {
    
    struct Game {
        bytes32 saltedHash;
        address challenger;
        address respondent;
        uint256 stake;
        uint256 blocknumber;  // block the game started
        uint256 blockduration;  // number of blocks challanger has the time to prove
        uint8 respondentChoice;
        bool hasStarted;  // has respondent accepted
        bool isFinished;  // has result been determined/ game cancelled
        bool isGame;  // is created by contract
    }
    
    uint8 public rock = 0;
    uint8 public paper = 1;
    uint8 public scissors = 2;
    
    mapping(bytes32 => Game) private games;
    
    event GameCreated(bytes32 gameId, address indexed challenger, address indexed respondent);
    event GameAccepted(bytes32 gameId);
    event GameCancelled(bytes32 gameId);
    event GameEnded(bytes32 gameId, string result);
    

    modifier realGame(bytes32 _gameId) {
        require(games[_gameId].isGame == true, "Not a real game");
        _;
    }
    
    
    modifier isRespondent(bytes32 _gameId) {
        require(games[_gameId].respondent == msg.sender, "Game doesn't exist or this game isn't meant for you");
        _;
    }
    
    
    modifier isChallenger(bytes32 _gameId) {
        require(games[_gameId].challenger == msg.sender, "You are not the challanger of this game");
        _;
    }
    
    
    modifier gameStatus(bytes32 _gameId, bool _desiredStatus) {
        require(games[_gameId].isFinished == _desiredStatus, "Invalid game status");
        _;
    }


    modifier isValidChoice(uint8 _choice) {
        require(!((_choice != rock) && (_choice != paper) && (_choice != scissors)), "Invalid choice");
        _;
    }
    
    
    function challenge(bytes32 _slatedHash, address _respondent, uint256 _blockduration) external payable{
        require(msg.value != 0, "Must provide stake for challenge");
        require(msg.sender != _respondent, "Can't challenge yourself");
        require(_respondent != address(0), "Respondent can't be burn address");
        require(_blockduration != 0, "Can't have game with 0 duration");
        
        Game memory _newGame = Game(_slatedHash, msg.sender, _respondent, msg.value, 0, _blockduration, rock, false, false, true);  // default choice is rock
        bytes32 _gameId = keccak256(abi.encode(_newGame.challenger, _newGame.respondent, _newGame.stake, block.number, _newGame.blockduration));
        games[_gameId] = _newGame;
        
        emit GameCreated(_gameId, msg.sender, _respondent);
    }
    
    
    function accept(bytes32 _gameId, uint8 _choice) external payable 
        realGame(_gameId) 
        gameStatus(_gameId, false) 
        isRespondent(_gameId)  // status of false signifies "not finished"
        isValidChoice(_choice)
    { 
        require(msg.value >= games[_gameId].stake, "Must provide stake equal or higher than challenger");
        require(games[_gameId].hasStarted == false, "You have already accepted the game");

        games[_gameId].respondentChoice = _choice;
        games[_gameId].hasStarted = true;
        games[_gameId].blocknumber = block.number;
        emit GameAccepted(_gameId);
    }
    
    
    function settleGame(bytes32 _gameId, bytes32 _salt) external
        realGame(_gameId)
        gameStatus(_gameId, false)
        isChallenger(_gameId)
    {
        require(games[_gameId].hasStarted == true, "Respondent hasn't accepted yet");
        
        uint8 _respondentChoice = games[_gameId].respondentChoice;
        uint8 _challangerChoice;
        bool _hasHashDecoded;
        string memory _result = "Challenger won";
        (_challangerChoice, _hasHashDecoded) = decodeHash(games[_gameId].saltedHash, _salt);
        
        require(_hasHashDecoded == true, "Something went wrong decoding your salted hash, check your input");
        
        if (_challangerChoice == _respondentChoice) {  // if their choice is the same
            payable(games[_gameId].respondent).transfer(games[_gameId].stake);  //refund both players
            payable(games[_gameId].challenger).transfer(games[_gameId].stake);
            _result = "Draw";
        }
        else if ((_challangerChoice == rock) && (_respondentChoice == scissors)){
            payable(games[_gameId].challenger).transfer(games[_gameId].stake * 2);
        }
        else if ((_challangerChoice == paper) && (_respondentChoice == rock)){
            payable(games[_gameId].challenger).transfer(games[_gameId].stake * 2);
        }
        else if ((_challangerChoice == scissors) && (_respondentChoice == paper)){
            payable(games[_gameId].challenger).transfer(games[_gameId].stake * 2);
        }
        else {
            payable(games[_gameId].respondent).transfer(games[_gameId].stake * 2);
            _result = "respondent won";
        }
        
        games[_gameId].isFinished = true;
        emit GameEnded(_gameId, _result);
    }

    
    function withdrawAsChallenger(bytes32 _gameId) external 
        realGame(_gameId)
        gameStatus(_gameId, false)
        isChallenger(_gameId)
    {
        require(games[_gameId].hasStarted == false, "Can't withdraw now, respondent accepted challenge");
        games[_gameId].isFinished = true;  // cancel game
        payable(games[_gameId].challenger).transfer(games[_gameId].stake);
        emit GameCancelled(_gameId);
    }
    
    
    function withdrawAsRespondent(bytes32 _gameId) external
        realGame(_gameId)
        gameStatus(_gameId, false)
        isRespondent(_gameId)
    {
        require(games[_gameId].hasStarted == true, "You haven't accepted that game");
        require(block.number - games[_gameId].blocknumber >= games[_gameId].blockduration, "Challanger still may provide proof");
        games[_gameId].isFinished = true;
        payable(games[_gameId].respondent).transfer(games[_gameId].stake * 2);  // refund the respondent double the stake in order to punish the challenger for not setteling the game
        emit GameCancelled(_gameId);
    }
    
    
    // do not use to generate actual hashes, just to check beforehand
    function hashMethod(uint8 _choice, bytes32 _salt) public pure returns(bytes32) {
        return keccak256(abi.encode(_choice, _salt));
    }
    
    // do not use to verify actual hashes, just to check beforehand
    function decodeHash(bytes32 _saltedHash, bytes32 _salt) public view returns(uint8, bool) {
        bytes32 _rock_r = hashMethod(rock, _salt);
        bytes32 _paper_r = hashMethod(paper, _salt);
        bytes32 _scissors_r = hashMethod(scissors, _salt);
        
        if (_saltedHash == _rock_r) {
            return (rock, true);
        }
        else if (_saltedHash == _paper_r) {
            return (paper, true);
        }
        else if (_saltedHash == _scissors_r) {
            return (scissors, true);
        }
        else {
            return (0, false);
        }
    }
    
    
    function getGameData1(bytes32 _gameId) external view
        returns (
            bytes32 _saltedHash,
            address _challenger,
            address _respondent,
            uint256 _stake
        )
    {
        return (
            games[_gameId].saltedHash,
            games[_gameId].challenger,
            games[_gameId].respondent,
            games[_gameId].stake
        );
    }
    
    
    // stack too deep: need for 2 game data function
    function getGameData2(bytes32 _gameId) external view
        returns (
            uint256 _blocknumber,
            uint256 _blockduration,
            uint8 _respondentChoice,
            bool _hasStarted,
            bool _isFinished,
            bool _isGame
        )
    {
        return (
            games[_gameId].blocknumber,
            games[_gameId].blockduration,
            games[_gameId].respondentChoice,
            games[_gameId].hasStarted,
            games[_gameId].isFinished,
            games[_gameId].isGame
        );
    }
    
    /**
     * for developing purposes, easier to debug on remix
     * 
    function _nonceHash(string memory _seed) external pure returns(bytes32){
        return keccak256(abi.encode(_seed));
    }
    
    
    function _blockNumber() external view returns(uint256){
        return block.number;
    }
    **/
}