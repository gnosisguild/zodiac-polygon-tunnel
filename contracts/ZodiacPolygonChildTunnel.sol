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

  /*
   * Note: for testing purposes left the function signature in the current shape
   * in the future signature will be (address contract, bytes data)
   * i.e., controller will be required to submitted already abi encoded call data
   */

  function sendMessage(address target, bytes memory targetCallPayload) public {
    bytes memory message = abi.encode(msg.sender, target, targetCallPayload);
    _sendMessageToRoot(message);
  }
}
