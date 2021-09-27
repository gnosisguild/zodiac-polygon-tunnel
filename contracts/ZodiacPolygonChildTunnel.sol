// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import './lib/FxBaseChildTunnel.sol';

contract ZodiacPolygonChildTunnel is FxBaseChildTunnel {
  constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {}

  function _processMessageFromRoot(
    uint256 stateId,
    address sender,
    bytes memory data
  ) internal view override validateSender(sender) {
    (stateId);
    (sender);
    (data);
    revert('Not Implemented');
  }

  function sendMessage(
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    bytes memory message = abi.encode(msg.sender, target, data, gas);
    _sendMessageToRoot(message);
  }
}
