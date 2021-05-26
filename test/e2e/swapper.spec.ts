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
  let tokenA: Contract;
  let tokenB: Contract;
  let usdt: Contract;
  let shiba: Contract;
  let andre: JsonRpcSigner;
  let dude: JsonRpcSigner;
  let deployer: SignerWithAddress;

  let swapperContract: ContractFactory;
  let swapper: Contract;

  const { network } = require('hardhat');

  let tokenAadd = '0xdac17f958d2ee523a2206206994597c13d831ec7'; //USDT-mainnet
  let tokenBadd = '0x8b9c35c79af5319c70dd9a3e3850f368822ed64e'; //DOGE-mainnet

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
    tokenA = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', tokenAadd);
    tokenB = await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', tokenBadd);
    swapperContract = await ethers.getContractFactory('Swapper');
    swapper = await swapperContract.deploy(tokenAadd, tokenBadd);
  });

  describe('test', async () => {
    context('deploy', async () => {
      let balance: BigNumber;
      given(async () => {
        console.log('hello!');
        balance = await swapper.balance(tokenAadd, dudeAddress);
      });
      then('it works!', async () => {
        expect( balance ).to.be.equal(0);
      });
    });
    context('tokens', async () => {
      then('USDT', async () => {
        expect( await tokenA.symbol() ).to.be.equal('USDT');
        console.log( await tokenA.totalSupply() )
      });
      then('DOGE', async () => {
        expect( await tokenB.symbol() ).to.be.equal('DGT');
        console.log( await tokenB.totalSupply() )
      });
    });

  });

  describe('working', async () => {
    context('dude exchanges tokenA for tokenB', async () => {
      given(async () => {
        await tokenA.connect(dude).approve(swapper.address, 100, { gasPrice: 0 });
        console.log( await tokenA.allowance( dude._address, swapper.address ) );
        await swapper.connect(dude).provide(1, { gasPrice: 0 });
        console.log('ok?');
      });
      then('dude has money', async () => {
        expect(await swapper.balance(tokenAadd, dude.getAddress())).to.be.above(0);
      });
    });
  });
});

/*

deployar el contrato
dude carga tokenA
dude compra tokenB
dude le pregunta a tokenB si tiene coins

*/
