import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "solidity-coverage"
import "hardhat-deploy"
import dotenv from "dotenv"
import type { HttpNetworkUserConfig } from "hardhat/types"

// Load environment variables.
dotenv.config()
const { INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, POLYGON_ETHERSCAN_API_KEY } =
  process.env

import "./src/tasks/setup"
import "./src/tasks/generateProof"

const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

const sharedNetworkConfig: HttpNetworkUserConfig = {
  accounts: {
    mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
  },
}

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
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    rinkeby: {
      ...sharedNetworkConfig,
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.poanetwork.dev",
    },
    mumbai: {
      ...sharedNetworkConfig,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 2000000,
  },
  etherscan: {
    //apiKey: ETHERSCAN_API_KEY,
    apiKey: POLYGON_ETHERSCAN_API_KEY,
  },
}
