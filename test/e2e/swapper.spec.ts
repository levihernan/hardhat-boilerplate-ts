import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract, ContractFactory } from 'ethers';
import { evm } from '../utils';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, utils } from 'ethers';
import { given, then, when } from '../utils/bdd';

describe('Testing deployment', () => {
  let providedToken: Contract;
  let swappedToken: Contract;
  let usdt: Contract;
  let shiba: Contract;
  let andre: JsonRpcSigner;
  let dude: JsonRpcSigner;
  let worker: JsonRpcSigner;
  let deployer: SignerWithAddress;

  let swapperContract: ContractFactory;
  let swapper: Contract;
  let keep3r: Contract;

  const { network } = require('hardhat');

  let providedTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; //USDT-mainnet
  let swappedTokenAddress = '0x4206931337dc273a630d328da6441786bfad668f'; //DOGE-mainnet

  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
  const shibaAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
  const andreAddress = '0x2D407dDb06311396fE14D4b49da5F0471447d45C';
  const dudeAddress = '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503';
  const workerAddress = '0x07c2af75788814ba7e5225b2f5c951ed161cb589';
  const keep3rAddress = '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44';

  before('swapper contract', async () => {
    // await network.provider.request({ method: 'hardhat_impersonateAccount', params: [dudeAddress] });
    // dude = await ethers.provider.getUncheckedSigner(dudeAddress);
  });

  beforeEach(async () => {

    await evm.reset({
      jsonRpcUrl: process.env.MAINNET_HTTPS_URL,
      blockNumber: 12509240,
    });

    await network.provider.request({ method: 'hardhat_impersonateAccount', params: [dudeAddress] });
    dude = await ethers.provider.getUncheckedSigner(dudeAddress);
    await network.provider.request({ method: 'hardhat_impersonateAccount', params: [workerAddress] });
    worker = await ethers.provider.getUncheckedSigner(workerAddress);


    providedToken = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', providedTokenAddress);
    swappedToken = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', swappedTokenAddress);
    keep3r = await ethers.getContractAt('./contracts/utils/Keep3rV1.sol:Keep3rV1', keep3rAddress);

    swapperContract = await ethers.getContractFactory('Swapper');
    swapper = await swapperContract.deploy(providedTokenAddress, swappedTokenAddress);
  });

  describe('test', async () => {
    context('deploy', async () => {
      let balance: BigNumber;
      given(async () => {
        // console.log('hello!');
        balance = await swapper.balance(providedTokenAddress, dudeAddress);
      });
      then('it works!', async () => {
        expect( balance ).to.be.equal(0);
      });
    });
    context('tokens', async () => {
      then('USDT', async () => {
        expect( await providedToken.symbol() ).to.be.equal('USDT');
        console.log('USDT supply', utils.formatEther(await providedToken.totalSupply()));
      });
      then('DOGE', async () => {
        expect( await swappedToken.symbol() ).to.be.equal('DOGE');
        console.log('DOGE supply', utils.formatEther(await swappedToken.totalSupply()));
      });
    });
  });

  describe('swapping', async () => {
    context('dude exchanges providedToken for swappedToken', async () => {
      let swapResponse: TransactionResponse;
      given(async () => {
        await providedToken.connect(dude).approve(swapper.address, 1000, { gasPrice: 0 });
        await swapper.connect(dude).provide(100, { gasPrice: 0 });
        swapResponse = await swapper.connect(dude).swap(50, {gasPrice:0});
        await swapper.connect(dude).withdraw(providedTokenAddress, 30, {gasPrice:0})
        await swapper.connect(dude).withdraw(swappedTokenAddress, 10, {gasPrice:0})
      });
      then('dude has providedToken in contract', async () => {
        expect(await swapper.balance(providedTokenAddress, dude.getAddress())).to.be.above(0);
      });
      then('dude swaps', async()=>{
        // expect(swapResponse).not.to.be.reverted;
        expect(await swapper.balance(swappedTokenAddress, dude.getAddress())).to.be.above(0);
      })
      then('dude has swappedToken in contract', async () => {
        expect(await swapper.balance(swappedTokenAddress, dude.getAddress())).to.be.above(0);
      });
      then('dude can withdraw swappedToken', async () => {
        expect(await swappedToken.balanceOf(dudeAddress)).to.be.equal(10);
      });
    });
  });

  describe('working', async() => {

    context('worker wants to work contract', async()=>{

      let isMinKeeper: Boolean;

      given(async()=>{
        await providedToken.connect(dude).approve(swapper.address, 1000, { gasPrice: 0 });
        await swapper.connect(dude).provide(100, { gasPrice: 0 });
        await keep3r.connect(worker).bond(keep3rAddress, 1000);
        await evm.advanceTimeAndBlock(10000000);
        await keep3r.connect(worker).activate(keep3rAddress);
        await evm.advanceTimeAndBlock(10000000);
        isMinKeeper = await keep3r.isMinKeeper(worker._address, 10, 0, 0);
      });
      then('user has bonds!', async()=>{
        expect( await keep3r.bonds(worker._address, keep3rAddress) ).to.be.above(0);
      });
      then('is workable', async()=>{
        expect( await swapper.workable() ).to.be.true;
      })
      then('user is min keep3r', async() => {
        expect( isMinKeeper ).to.be.true;
      })
    })
  })

});
