import '@nomicfoundation/hardhat-ignition'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import { HardhatUserConfig } from 'hardhat/config'
import 'solidity-docgen'

const { ACCOUNT0, ALCHEMY_SEPOLIA_RPC_URL, ALCHEMY_KEY, ETHERSCAN_API_KEY } =
  process.env

const networks: any = {}
if (process.env.HARDHAT_ENV === 'production') {
  networks['sepolia'] = {
    url: (ALCHEMY_SEPOLIA_RPC_URL as string) + ALCHEMY_KEY,
    chainId: 11155111,
    accounts: [ACCOUNT0 as string],
  }
}

const config: HardhatUserConfig = {
  paths: {
    tests: './contracts',
  },

  networks: networks,

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
