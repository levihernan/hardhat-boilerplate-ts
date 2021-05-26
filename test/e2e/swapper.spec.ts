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
  let deployer: SignerWithAddress;

  let swapperContract: ContractFactory;
  let swapper: Contract;

  const { network } = require('hardhat');

  let providedTokenadd = '0xdac17f958d2ee523a2206206994597c13d831ec7'; //USDT-mainnet
  let swappedTokenadd = '0x4206931337dc273a630d328da6441786bfad668f'; //DOGE-mainnet

  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
  const shibaAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
  const andreAddress = '0x2D407dDb06311396fE14D4b49da5F0471447d45C';
  const dudeAddress = '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503';

  before('deploy contract', async () => {
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
    providedToken = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', providedTokenadd);
    swappedToken = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', swappedTokenadd);
    swapperContract = await ethers.getContractFactory('Swapper');
    swapper = await swapperContract.deploy(providedTokenadd, swappedTokenadd);
  });

  describe('test', async () => {
    context('deploy', async () => {
      let balance: BigNumber;
      given(async () => {
        // console.log('hello!');
        balance = await swapper.balance(providedTokenadd, dudeAddress);
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

  describe('working', async () => {
    context('dude exchanges providedToken for swappedToken', async () => {
      let swapResponse: TransactionResponse;
      given(async () => {
        await providedToken.connect(dude).approve(swapper.address, 1000, { gasPrice: 0 });
        await swapper.connect(dude).provide(100, { gasPrice: 0 });
        swapResponse = await swapper.connect(dude).swap(50, {gasPrice:0});
        await swapper.connect(dude).withdraw(providedTokenadd, 30, {gasPrice:0})
        await swapper.connect(dude).withdraw(swappedTokenadd, 10, {gasPrice:0})
      });
      then('dude has providedToken in contract', async () => {
        expect(await swapper.balance(providedTokenadd, dude.getAddress())).to.be.above(0);
      });
      then('dude swaps', async()=>{
        // expect(swapResponse).not.to.be.reverted;
        expect(await swapper.balance(swappedTokenadd, dude.getAddress())).to.be.above(0);
      })
      then('dude has swappedToken in contract', async () => {
        expect(await swapper.balance(swappedTokenadd, dude.getAddress())).to.be.above(0);
      });
      then('dude can withdraw swappedToken', async () => {
        expect(await swappedToken.balanceOf(dudeAddress)).to.be.equal(10);
      });
    });
  });
});

/*

deployar el contrato
dude carga providedToken
dude compra swappedToken
dude le pregunta a swappedToken si tiene coins

*/
