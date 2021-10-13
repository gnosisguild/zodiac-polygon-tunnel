// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract MockTarget {
  uint256 public someValue;

  function setSomeValue(uint256 nextValue) public {
    someValue = nextValue;
  }

  function warever() public pure returns (uint8) {
    return 1;
  }
}
