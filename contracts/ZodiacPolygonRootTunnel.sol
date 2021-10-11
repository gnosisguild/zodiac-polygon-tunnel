// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "./lib/FxBaseRootTunnel.sol";
import "./TunnelTip.sol";

contract ZodiacPolygonRootTunnel is FxBaseRootTunnel, TunnelTip {
  constructor(address _checkpointManager, address _fxRoot)
    FxBaseRootTunnel(_checkpointManager, _fxRoot)
  {}

  function sendMessage(
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    bytes memory message = abi.encode(msg.sender, target, data, gas);
    _sendMessageToChild(message);
  }

  function _processMessageFromChild(bytes memory message) internal override {
    processMessage(message);
  }
}
