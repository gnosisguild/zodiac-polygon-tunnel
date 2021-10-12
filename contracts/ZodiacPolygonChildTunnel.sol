// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "./lib/FxBaseChildTunnel.sol";
import "./TunnelEnd.sol";

contract ZodiacPolygonChildTunnel is FxBaseChildTunnel, TunnelEnd {
  bytes public latestData;

  constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {}

  function sendMessage(
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    bytes memory message = abi.encode(
      getChainId(),
      msg.sender,
      target,
      data,
      gas
    );
    _sendMessageToRoot(message);
  }

  function _processMessageFromRoot(
    uint256 stateId,
    address sender,
    bytes memory data
  ) internal override validateSender(sender) {
    (stateId);
    (sender);
    latestData = data;
    decodeAndInvokeTarget(data);
  }
}
