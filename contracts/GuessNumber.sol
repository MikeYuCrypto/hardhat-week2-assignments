// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract GuessNumber {

    bytes32 nonceHash;
    bytes32 nonceNumHash;
    address hostAddress;
    uint256 bonus;
    uint256 bet;

    // false is game over
    bool gameStatus; 
    uint256 playerCount;
    uint256 maximumPlayCount;
    uint256 minimumPlayCount;
    address[] playersAddress;
    address[] winner;
    uint16[] gaps;
    struct player {
        bool isGuess; 
        uint16 number;
    }
    mapping(address => player
    ) players;
    mapping(uint16 => bool
    ) guessedNumber;

    constructor(bytes32 _nonceHash,bytes32 _nonceNumHash,uint8 _minimumPlayCount,uint8 _maximumPlayCount) payable {
        bet = msg.value;
        bonus = msg.value;
        nonceHash = _nonceHash;
        nonceNumHash = _nonceNumHash;
        gameStatus = true;
        hostAddress = msg.sender;
        maximumPlayCount = _maximumPlayCount;
        minimumPlayCount = _minimumPlayCount;
    }

    function guess(uint16 _number) public payable guessCheck{
        require(_number>=0 && _number<1000, "numbers are illegal");
        require(!guessedNumber[_number], "number is guessed.");
        players[msg.sender].number = _number;
        players[msg.sender].isGuess = true;
        guessedNumber[_number] = true;
        playersAddress.push(msg.sender);
        bonus = bonus + msg.value;
        playerCount = playerCount + 1;
    }

    modifier guessCheck() {
        require(bet == msg.value, "Illegal bet.");
        require(!players[msg.sender].isGuess, "player is guessed.");
        require(playerCount + 1 <= maximumPlayCount, "player is full.");
        require(bet == msg.value, "Illegal bet.");
        require(gameStatus, "Game is over!");
        require( 
            hostAddress != msg.sender,
        "You can't participate in games you create!");
        _;
    }
    
    function reveal(bytes32 _nonce, uint16 _number) public{
        require(
            keccak256(abi.encodePacked(_nonce)) == nonceHash, 
        "nonce are illegal.");
        require( 
            keccak256(abi.encode(_nonce, _number)) == nonceNumHash,
        "numbers are illegal.");
        require( 
            hostAddress == msg.sender,
        "You don't have access.");
        require(playerCount >= minimumPlayCount, "The minimum number of players is not met!");
        // Game is over
        gameStatus = false;
        uint256 length = playersAddress.length;
        uint16 winnerGap;
        uint256 relBound;
        // check host number
        if(_number >= 1000 || _number <0){
            relBound = bonus / length;
            // Distribute the prize
            for(uint16 i = 0;i < length; i++){
                payable(playersAddress[i]).transfer(relBound);
            }
        } else {
            // Distribute the winner's prize
            for(uint16 i = 0;i < length; i++){
                uint16 guessNumber = players[playersAddress[i]].number;
                uint16 gap = _number > guessNumber ? _number - guessNumber : guessNumber - _number;
                if(winner.length == 0 || gap == winnerGap){
                    winner.push(playersAddress[i]);
                } else if(gap < winnerGap){
                    delete winner;
                    winner.push(playersAddress[i]);
                }
                winnerGap = gap;
            }
            uint256 winnerLength = winner.length;
            relBound = bonus / winnerLength;
            for(uint16 i = 0;i < winnerLength; i++){
                payable(winner[i]).transfer(relBound);
            }
        }
    }
}