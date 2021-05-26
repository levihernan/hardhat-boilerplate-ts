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

  let SwapperContract: ContractFactory;
  let swapper: Contract;

  const { network } = require('hardhat');

  let tokenAadd = '0xdac17f958d2ee523a2206206994597c13d831ec7'; //USDT-mainnet
  let tokenBadd = '0x8b9c35c79af5319c70dd9a3e3850f368822ed64e'; //DOGE-mainnet

  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
  const shibaAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
  const andreAddress = '0x2D407dDb06311396fE14D4b49da5F0471447d45C';
  const dudeAddress = '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503';

  before('deploy contract', async () => {
    await network.provider.request({ method: 'hardhat_impersonateAccount', params: [dudeAddress] });
    dude = await ethers.provider.getUncheckedSigner(dudeAddress);
  });

  beforeEach(async () => {
    tokenA = await ethers.getContractAt('contracts/interfaces/IERC20.sol:IERC20', tokenAadd);
    tokenB = await ethers.getContractAt('contracts/interfaces/IERC20.sol:IERC20', tokenBadd);
    SwapperContract = await ethers.getContractFactory('Swapper');
    swapper = await SwapperContract.deploy(tokenAadd, tokenBadd);
  });

  describe('test', async () => {
    context('deploy', async () => {
      let balanceTx: TransactionResponse;
      given(async () => {
        console.log('hello!');
        balanceTx = await swapper.balanceFrom(dudeAddress);
      });
      then('it works!', async () => {
        expect(balanceTx).to.be.equal(0);
      });
    });
  });

  describe('working', async () => {
    context('dude exchanges tokenA for tokenB', async () => {
      given(async () => {
        await tokenA.connect(dude).approve(swapper.address, 100, { gasPrice: 0 });
        await swapper.connect(dude).provide(100, { gasPrice: 0 });
        console.log('ok?');
      });
      then('dude has money', async () => {
        expect(await swapper.balanceFrom(dude.getAddress())).to.be.above(0);
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
