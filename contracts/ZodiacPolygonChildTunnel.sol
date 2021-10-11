// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "./lib/FxBaseChildTunnel.sol";
import "./TunnelTip.sol";

contract ZodiacPolygonChildTunnel is FxBaseChildTunnel {
  uint256 private stateId;
  address private sender;

  constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {}

  function sendMessage(
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    bytes memory message = abi.encode(msg.sender, target, data, gas);
    _sendMessageToRoot(message);
  }

  function _processMessageFromRoot(
    uint256 _stateId,
    address _sender,
    bytes memory data
  ) internal override validateSender(sender) {
    stateId = _stateId;
    sender = _sender;
    (data);
  }

  function getStateId() public view returns (uint256) {
    return stateId;
  }

  function getSender() public view returns (address) {
    return sender;
  }
}
