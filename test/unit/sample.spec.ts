import { expect } from 'chai';
import { ethers } from 'hardhat';

let tokenA = '0xdac17f958d2ee523a2206206994597c13d831ec7'; //USDT-mainnet
let tokenB = '0x8b9c35c79af5319c70dd9a3e3850f368822ed64e'; //DOGE-mainnet

describe('Greeter', function () {
  it('Should return token A & B once its deployed', async function () {
    const Swapper = await ethers.getContractFactory('Swapper');
    const swapper = await Swapper.deploy(tokenA, tokenB);

    // expect(await swapper.fromToken()).to.equal( tokenA );
    // expect(await swapper.toToken()).to.equal( tokenB );
    expect((await swapper.fromToken()).toLowerCase()).to.equal(tokenA.toLowerCase());
    expect((await swapper.toToken()).toLowerCase()).to.equal(tokenB.toLowerCase());

    await new Promise((res) => setTimeout(res, 5000));
  });
});
