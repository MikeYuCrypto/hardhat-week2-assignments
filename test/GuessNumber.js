const {
    loadFixture
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { expect } = require("chai");
  const { ethers,keccak256 } = require("hardhat");

  describe("GuessNumber", function () {

    let nonce = "HELLO";
    let nonceHash;
    let nonceNumHash;
    let number = 999;
    let _minimumPlayCount = 2;
    let _maximumPlayCount = 2;
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deployGuess() {
  
      // Contracts are deployed using the first signer/account by default
      const [owner, player1, player2] = await ethers.getSigners();
      nonceHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32'],
          [ethers.utils.formatBytes32String(nonce)])
      );
      nonceNumHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['bytes32', 'uint'],
          [ethers.utils.formatBytes32String(nonce), number])
      );
      const GuessNumber = await ethers.getContractFactory("GuessNumber");
      options =
      {
      value: ethers.utils.parseEther("1")
      };
      const guessNumber = await GuessNumber.deploy(nonceHash, nonceNumHash, _minimumPlayCount, _maximumPlayCount, options);
      guessNumber.deployed
      return { guessNumber, owner, player1, player2 };
    }
    describe("Guess", function () {
        it("2 Players join guess.", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options =
            {
            value: ethers.utils.parseEther("1")
            };
            await guessNumber.connect(player1).guess(2,options);
            await guessNumber.connect(player2).guess(999,options);
            await expect(
                guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number)
            ).to.changeEtherBalance(player2, ethers.utils.parseEther("3"));
        });
    })

    describe("Guess", function () {
        it("case1: 2 Players join guess.", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options =
            {
            value: ethers.utils.parseEther("1")
            };
            await guessNumber.connect(player1).guess(800,options);
            await guessNumber.connect(player2).guess(900,options);
            await expect(
                guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number)
            ).to.changeEtherBalance(player2, ethers.utils.parseEther("3"));
        });

        it("case2: Player 1 input is reverted since he does not attach 1 Ether as the deposit value", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options1 =
            {
            value: ethers.utils.parseEther("2")
            };
            await expect(
                guessNumber.connect(player1).guess(800,options1)
            ).to.be.revertedWith("Illegal bet.");

            options2 =
            {
            value: ethers.utils.parseEther("1")
            };
            await guessNumber.connect(player2).guess(900,options2);
        });

        it("case3: Player 1 and 2 both receive 1.5 Ether as rewards since their guessings have the same delta.", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options1 =
            {
            value: ethers.utils.parseEther("2")
            };
            await expect(
                guessNumber.connect(player1).guess(800,options1)
            ).to.be.revertedWith("Illegal bet.");

            options2 =
            {
            value: ethers.utils.parseEther("1")
            };
            await guessNumber.connect(player2).guess(900,options2);
        });
    })
})