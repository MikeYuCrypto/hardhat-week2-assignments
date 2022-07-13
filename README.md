# week2-assignments
Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
## Introduction
This is a customizable number guessing game with two characters, Host and player. Host creates the game and defines the number of participants and the host prize. Each player can send the number and attach the corresponding prize to participate in the game.

## Unit Test Case
Prepare some unit tests below:
      ✔ Basic functional test case: 2 Players join guess, one winner. 
      ✔ case1: The two players split the prize money equallys.
      ✔ case2: Player 1 input is reverted since he does not attach 1 Ether as the deposit value 
      ✔ case3: You can't participate in games you create!
      ✔ case4: player is full.
      ✔ case5: Player 1 and 2 both receive 1.5 Ether as rewards since their guessings have the same delta.
      ✔ case6: Player 1 and 2 both receive 1.5 Ether as rewards since the host does not follow the rule (0<=n<1000).
      ✔ case7: Customized Player Numbers: Allow the Host to specify the number of Players upon deployment, and Ahead of the lottery.
      ✔ case8: Game is over!

## Additional Tasks

**Question 1**:  Customized Player Numbers: Allow the Host to specify the number of Players upon deployment.

**Answer**: case7
        
**Question 2**:   Explain the reason of having both nonceHash and nonceNumHash in the smart contract. Can any of these two be omitted and why?
        
**Answer**: I don't think NonceHash can be deleted,Since all the code in a smart contract is public, 
nonceHash is like salting a password to make it hard to crack the numbers;

**Question 3**: loopholes
 
 **loophole**: Host knows the numbers, and if the temptation is big enough, Host will cheat.

 > **Solution**: 
 
 > 1) The number is generated by a random algorithm of the contract, and the host provides only nonce.
