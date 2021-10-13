// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "../TunnelEnd.sol";

contract ExposedTunnelEnd is TunnelEnd {
  function __encodeIntoTunnel(
    address target,
    bytes memory data,
    uint256 gas
  ) public view returns (bytes memory) {
    return encodeIntoTunnel(target, data, gas);
  }

  function __decodeFromTunnel(bytes memory message)
    public
    pure
    returns (
      bytes32,
      address,
      address,
      bytes memory,
      uint256
    )
  {
    return decodeFromTunnel(message);
  }

  function __forwardToTarget(
    bytes32 sourceChainId,
    address sourceChainSender,
    address target,
    bytes memory data,
    uint256 gas
  ) public {
    __forwardToTarget(sourceChainId, sourceChainSender, target, data, gas);
  }
}
