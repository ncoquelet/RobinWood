import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition';
import '@nomicfoundation/hardhat-verify';
import 'solidity-docgen';

const { MNEMONIC, ALCHEMY_RPC_URL, ALCHEMY_ID, ETHERSCAN_ID } = process.env;
const SEPOLIA_RPC_URL = `${ALCHEMY_RPC_URL}/${ALCHEMY_ID}`;

const config: HardhatUserConfig = {
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_ID,
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
};

export default config;
