import { run, ethers } from 'hardhat';

let tokenA = 0x12345;
let tokenB = 0x12345;

async function main() {
  run('compile');
  const Swapper = await ethers.getContractFactory('Swapper');

  const greeter = await Swapper.deploy(tokenA, tokenB);
  console.log('Swapper deployed to:', greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
