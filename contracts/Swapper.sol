//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract Swapper {
  // using SafeMath for uint256;
  using SafeERC20 for IERC20;

  mapping(address => mapping(address => uint256)) public balance;

  address public providedToken;
  address public swappedToken;
  address uniswapAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; //<---

  event TokenProvided(address owner, uint256 _providedAmount);
  event TokenWithdrawed(address owner, uint256 _withdrawedAmount);
  event TokenSwapped(address owner, uint256 _sentAmount, uint256 _swappedAmount);

  constructor(address _providedToken, address _swappedToken) {
    providedToken = _providedToken;
    swappedToken = _swappedToken;
  }

  function provide(uint256 _amount) public {
    IERC20(providedToken).safeTransferFrom(msg.sender, address(this), _amount);
    balance[providedToken][msg.sender] = balance[providedToken][msg.sender] + _amount;
    emit TokenProvided(msg.sender, _amount);
  }

  function swap(uint256 _amount) public {
    balance[providedToken][msg.sender] = balance[providedToken][msg.sender] - _amount;
    IUniswapV2Router02 uniswap = IUniswapV2Router02(uniswapAddress);

    address[] memory _path = new address[](2);
    _path[0] = providedToken;
    _path[1] = swappedToken;

    IERC20(providedToken).safeApprove(uniswapAddress, _amount);
    uint256[] memory answer = uniswap.swapExactTokensForTokens(_amount, 0, _path, address(this), block.timestamp + 1 days);
    balance[swappedToken][msg.sender] = balance[swappedToken][msg.sender] + answer[1];
    emit TokenSwapped(msg.sender, answer[0], answer[1]);
  }

  function withdraw(address _token, uint256 _amount) public {
    balance[_token][msg.sender] = balance[_token][msg.sender] - _amount;
    IERC20(_token).safeTransfer(msg.sender, _amount);
    emit TokenWithdrawed(msg.sender, _amount);
  }
}
