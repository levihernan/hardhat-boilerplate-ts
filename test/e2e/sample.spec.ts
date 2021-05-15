import { Contract } from '@ethersproject/contracts';
import { utils } from 'ethers';
import { ethers } from 'hardhat';
import { evm } from '../utils';
import { then } from '../utils/bdd';

// This will allow to cache blockchain state
const forkBlockNumber = 12103332;

describe('DAI', function () {
  let dai: Contract;
  before(async () => {
    dai = await ethers.getContractAt('IERC20', '0x6b175474e89094c44da98b954eedeac495271d0f');
  });
  beforeEach(async () => {
    await evm.reset({
      jsonRpcUrl: process.env.MAINNET_HTTPS_URL,
      blockNumber: forkBlockNumber,
    });
  });
  then('gets supply correctly', async () => {
    console.log(utils.formatEther(await dai.totalSupply()));
  });
});
