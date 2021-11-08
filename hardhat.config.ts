import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"

import "solidity-coverage"
import dotenv from "dotenv"

// Load environment variables.
dotenv.config()
const {
  INFURA_KEY,
  MNEMONIC,
  ETHERSCAN_API_KEY,
  ETHERSCAN_GOERLI_API_KEY,
  ETHERSCAN_POLYGON_API_KEY,
  ETHERSCAN_MUMBAI_API_KEY,

  SIGNER_INDEX,
  SIGNER_GOERLI_INDEX,
  // SIGNER_POLYGON_INDEX,
  SIGNER_MUMBAI_INDEX,
} = process.env

import "./src/tasks/setup"
import "./src/tasks/generateProof"
import { extendEnvironment } from "hardhat/config"

const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

export default {
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "src/deploy",
    sources: "contracts",
  },
  solidity: {
    version: "0.7.3",
  },
  networks: {
    mainnet: {
      accounts: {
        mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
        initialIndex: parseIntFromEnv(SIGNER_INDEX),
      },
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      accounts: {
        mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
        initialIndex: parseIntFromEnv(SIGNER_GOERLI_INDEX),
      },
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    mumbai: {
      accounts: {
        mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
        initialIndex: parseIntFromEnv(SIGNER_MUMBAI_INDEX),
      },
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    },
  },
  mocha: {
    timeout: 2000000,
  },
  etherscan: {
    apiKey: etherscanApiKeyFromEnv(),
  },
}

extendEnvironment((env: any) => {
  const networkName = findNetworkNameFromArgv()

  let checkpointManager
  switch (networkName) {
    case "mainnet":
      checkpointManager = "0x86e4dc95c7fbdbf52e33d563bbdb00823894c287"
      break
    case "goerli":
      checkpointManager = "0x2890bA17EfE978480615e330ecB65333b880928e"
      break
    default:
      checkpointManager = null
  }

  let fxRoot
  switch (networkName) {
    case "mainnet":
      fxRoot = "0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2"
      break
    case "goerli":
      fxRoot = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA"
      break
    default:
      fxRoot = null
  }

  let fxChild
  switch (networkName) {
    case "polygon":
      fxChild = "0x8397259c983751DAf40400790063935a11afa28a"
      break
    case "mumbai":
      fxChild = "0xCf73231F28B7331BBe3124B907840A94851f9f11"
      break
    default:
      fxChild = null
  }

  env.fxConfig = {
    checkpointManager,
    fxRoot,
    fxChild,
  }
})

// Workaround for https://github.com/nomiclabs/hardhat/issues/1448
function etherscanApiKeyFromEnv() {
  const networkName = findNetworkNameFromArgv()
  let apiKey = ETHERSCAN_API_KEY

  switch (networkName) {
    case "mainnet":
      apiKey = ETHERSCAN_API_KEY
      break
    case "goerli":
      apiKey = ETHERSCAN_GOERLI_API_KEY || ETHERSCAN_API_KEY
      break
    case "polygon":
      apiKey = ETHERSCAN_POLYGON_API_KEY || ETHERSCAN_API_KEY
      break
    case "mumbai":
      apiKey =
        ETHERSCAN_MUMBAI_API_KEY ||
        ETHERSCAN_MUMBAI_API_KEY ||
        ETHERSCAN_API_KEY
      break
  }
  return apiKey
}

// Workaround for https://github.com/nomiclabs/hardhat/issues/1448
function findNetworkNameFromArgv() {
  const index = process.argv.findIndex((arg) => arg === "--network")

  if (index === -1) {
    return null
  }
  const networkName = process.argv[index + 1]
  return networkName
}

function parseIntFromEnv(env: string | undefined) {
  const parsed = parseInt(env || "")
  return isNaN(parsed) ? 0 : parsed
}
