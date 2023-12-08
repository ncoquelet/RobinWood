import '@nomicfoundation/hardhat-ignition'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import { HardhatUserConfig } from 'hardhat/config'
import 'solidity-docgen'

const { ACCOUNT0, ALCHEMY_SEPOLIA_RPC_URL, ETHERSCAN_ID } = process.env

const config: HardhatUserConfig = {
  paths: {
    tests: './contracts',
  },

  networks: {
    sepolia: {
      url: ALCHEMY_SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [ACCOUNT0 as string],
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
}

export default config
