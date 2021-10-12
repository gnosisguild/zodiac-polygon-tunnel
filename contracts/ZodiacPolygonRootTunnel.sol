// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "./lib/FxBaseRootTunnel.sol";
import "./TunnelEnd.sol";

contract ZodiacPolygonRootTunnel is FxBaseRootTunnel, TunnelEnd {
  constructor(address _checkpointManager, address _fxRoot)
    FxBaseRootTunnel(_checkpointManager, _fxRoot)
  {}

  function sendMessage(
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    bytes memory message = encodeIntoTunnel(target, data, gas);
    _sendMessageToChild(message);
  }

  function _processMessageFromChild(bytes memory message) internal override {
    (
      bytes32 sourceChainId,
      address sourceChainSender,
      address target,
      bytes memory data,
      uint256 gas
    ) = decodeFromTunnel(message);
    forwardToTarget(sourceChainId, sourceChainSender, target, data, gas);
  }
}
