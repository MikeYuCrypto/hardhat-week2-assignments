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
      return { guessNumber, owner, player1, player2 };
    } 
    describe("GuessNumber", function () {
        it("Basic functional test case: 2 Players join guess, one winner.", async function () {
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

        it("case1: The two players split the prize money equallys.", async function () {
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


        it("case3: You can't participate in games you create!", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options =
            {
            value: ethers.utils.parseEther("1")
            };
            await expect(
                guessNumber.connect(owner).guess(800,options)
            ).to.be.revertedWith("You can't participate in games you create!");
        });

        it("case4: player is full.", async function () {
            const { guessNumber, owner, player1,player2} = await loadFixture(deployGuess);
            options =
            {
            value: ethers.utils.parseEther("1")
            };
            await guessNumber.connect(player1).guess(900,options);
            await guessNumber.connect(player2).guess(800,options);
            await guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number);

            const [player3] = await ethers.getSigners();
            await expect(
                guessNumber.connect(player3).guess(800,options)
            ).to.be.revertedWith("player is full.");
        });

        it("case5: Player 1 and 2 both receive 1.5 Ether as rewards since their guessings have the same delta.", async function () {
            number = 500;
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
            await guessNumber.connect(player1).guess(450,options);
            await guessNumber.connect(player2).guess(550,options);
            await expect(
                guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number)
            ).to.changeEtherBalance(player2, ethers.utils.parseEther("1.5")).to.changeEtherBalance(player1, ethers.utils.parseEther("1.5"));
        });

        it("case6: Player 1 and 2 both receive 1.5 Ether as rewards since the host does not follow the rule (0<=n<1000).", async function () {
            number = 1415;
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
            await guessNumber.connect(player1).guess(1,options);
            await guessNumber.connect(player2).guess(2,options);
            await expect(
                guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number)
            ).to.changeEtherBalance(player2, ethers.utils.parseEther("1.5")).to.changeEtherBalance(player1, ethers.utils.parseEther("1.5"));
        });

        it("case7: Customized Player Numbers: Allow the Host to specify the number of Players upon deployment, and Ahead of the lottery.", async function () {
            number = 800;
            _minimumPlayCount = 2;
            _maximumPlayCount = 10;
            const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
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
            await guessNumber.connect(player1).guess(100,options);
            await guessNumber.connect(player2).guess(200,options);
            await guessNumber.connect(player3).guess(900,options);
            await guessNumber.connect(player4).guess(700,options);
            await guessNumber.connect(player5).guess(650,options);
            await expect(
                guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number)
            ).to.changeEtherBalance(player3, ethers.utils.parseEther("3")).to.changeEtherBalance(player4, ethers.utils.parseEther("3"));
        });
        it("case8: Game is over!", async function () {
            number = 800;
            _minimumPlayCount = 2;
            _maximumPlayCount = 10;
            const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
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
            await guessNumber.connect(player1).guess(100,options);
            await guessNumber.connect(player2).guess(200,options);
            await guessNumber.connect(player3).guess(900,options);
            await guessNumber.connect(player4).guess(700,options);
            await guessNumber.reveal(ethers.utils.formatBytes32String(nonce), number);

            await expect(
                guessNumber.connect(player5).guess(650,options)
            ).to.be.revertedWith("Game is over!");
        });
    })
})