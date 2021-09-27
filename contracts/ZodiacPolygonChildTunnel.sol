// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import './lib/FxBaseChildTunnel.sol';

contract ZodiacPolygonChildTunnel is FxBaseChildTunnel {
  constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {}

  function _processMessageFromRoot(
    uint256 stateId,
    address sender,
    bytes memory data
  ) internal override validateSender(sender) {
    revert('Not Implemented');
  }  

  function sendMessage(address target, bytes memory targetCallPayload) public {
    bytes memory message = abi.encode(msg.sender, target, targetCallPayload);
    _sendMessageToRoot(message);
  }
}
