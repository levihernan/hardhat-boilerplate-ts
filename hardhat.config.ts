import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ganache';
import '@nomiclabs/hardhat-etherscan';
import { removeConsoleLog } from 'hardhat-preprocessor';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { utils } from 'ethers';
import config from './.config.json';

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      enabled: process.env.FORK ? true : false,
      accounts: [
        {
          privateKey: config.accounts.mainnet.privateKey,
          balance: utils.parseEther('1000').toString(),
        },
      ],
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${config.alchemy.mainnet.apiKey}`,
      },
    },
    localMainnet: {
      url: 'http://127.0.0.1:8545',
      accounts: [config.accounts.mainnet.privateKey],
      gasMultiplier: 1.1,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${config.alchemy.ropsten.apiKey}`,
      accounts: [config.accounts.ropsten.privateKey],
      gasMultiplier: 1.1,
      gasPrice: 'auto',
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${config.alchemy.mainnet.apiKey}`,
      accounts: [config.accounts.mainnet.privateKey],
      gasMultiplier: 1.1,
      gasPrice: 'auto',
    },
  },
  solidity: {
    version: '0.6.8',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 100000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: 'USD',
    gasPrice: 200,
    coinmarketcap: `${config.coinmarketcap.apiKey}`,
  },
  preprocess: {
    eachLine: removeConsoleLog((hre) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
  etherscan: {
    apiKey: `${config.etherscan.apiKey}`,
  },
};
