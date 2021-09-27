// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import './lib/FxBaseRootTunnel.sol';

contract ZodiacPolygonRootTunnel is FxBaseRootTunnel {
  event Tunneling(bool success, bytes data);
  address lastSender;

  constructor(address _checkpointManager, address _fxRoot)
    FxBaseRootTunnel(_checkpointManager, _fxRoot)
  {}

  function _processMessageFromChild(bytes memory message) internal override {
    (
      address senderInChildChain,
      address target,
      bytes memory targetCallPayload
    ) = abi.decode(message, (address, address, bytes));

    lastSender = senderInChildChain;
    (bool success, bytes memory data) = target.call(targetCallPayload);
    emit Tunneling(success, data);
  }

  function messageSender() public view returns (address) {
    return lastSender;
  }

  function messageSourceChainId() public pure returns (bytes32) {
    return bytes32(uint256(80001));
  }
}
