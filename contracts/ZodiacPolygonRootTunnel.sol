// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import './lib/FxBaseRootTunnel.sol';

interface ZodiacBridge {
  enum Operation {
    Call,
    DelegateCall
  }

  function executeTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation
  ) external;
}

contract ZodiacPolygonRootTunnel is FxBaseRootTunnel {
  address lastController;

  constructor(address _checkpointManager, address _fxRoot)
    FxBaseRootTunnel(_checkpointManager, _fxRoot)
  {}

  function _processMessageFromChild(bytes memory message) internal override {
    (
      address controller,
      address bridge,
      address to,
      uint256 value,
      bytes memory data
    ) = abi.decode(message, (address, address, address, uint256, bytes));

    lastController = controller;
    ZodiacBridge(bridge).executeTransaction(
      to,
      value,
      data,
      ZodiacBridge.Operation.Call
    );
  }

  function messageSender() public view returns (address) {
    return lastController;
  }

  function messageSourceChainId() public pure returns (bytes32) {
    return bytes32(uint256(80001));
  }
}
