const ethers = require("ethers");
const ganache = require("ganache");

const INFURA_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";
const USER_ADDRESS = "0x72cea5e3540956b2b71a91012a983267472d2fb1";
const USER2_ADDRESS = "0xc458e1a4ec03c5039fbf38221c54be4e63731e2a";
const TETHER_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TETHER_ABI = [
  {
    constant: true,
    inputs: [{ name: "who", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function main() {
  const blockNumbers = [
    14080485, 14080486, 14080487, 14080488, 14080489, 14080490, 14080491,
    14080492, 14080493, 14080494,
  ];

  for (const blockNumber of blockNumbers) {
    console.log(`forking at block ${blockNumber}`);
    const provider = new ethers.providers.Web3Provider(
      ganache.provider({
        fork: {
          url: INFURA_URL,
          blockNumber: blockNumber,
        },
        wallet: {
          unlockedAccounts: [USER_ADDRESS],
        },
      })
    );
    const tetherContract = new ethers.Contract(
      TETHER_ADDRESS,
      TETHER_ABI,
      provider.getSigner(USER_ADDRESS)
    );

    try {
      const userTetherBalance = await tetherContract.balanceOf(USER_ADDRESS);
      console.log(`eth balance ${await provider.getBalance(USER_ADDRESS)}`);
      const tx = await tetherContract.transfer(
        USER2_ADDRESS,
        userTetherBalance
      ); //<---- INSUFFICIENT FUNDS ERROR THROWN HERE FOR BLOCKS 14080485 AND 14080494
      await tx.wait(); // wait for tx to be mined
      console.log("completed transfer simulation");
    } catch (e) {
      console.error("error occurred", e);
    }
  }
}

main();
