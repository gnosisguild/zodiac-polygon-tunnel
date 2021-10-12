// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

contract TunnelEnd {
  bytes32 private latestSourceChainId;
  address private latestSourceChainSender;

  function messageSourceChainId() public view returns (bytes32) {
    return latestSourceChainId;
  }

  function messageSender() public view returns (address) {
    return latestSourceChainSender;
  }

  function encodeIntoTunnel(
    address target,
    bytes memory data,
    uint256 gas
  ) internal view returns (bytes memory) {
    return abi.encode(getChainId(), msg.sender, target, data, gas);
  }

  function decodeFromTunnel(bytes memory message)
    internal
    pure
    returns (
      bytes32,
      address,
      address,
      bytes memory,
      uint256
    )
  {
    (
      bytes32 sourceChainId,
      address sourceChainSender,
      address target,
      bytes memory data,
      uint256 gas
    ) = abi.decode(message, (bytes32, address, address, bytes, uint256));

    return (sourceChainId, sourceChainSender, target, data, gas);
  }

  function forwardToTarget(
    bytes32 sourceChainId,
    address sourceChainSender,
    address target,
    bytes memory data,
    uint256 gas
  ) internal {
    require(gas == 0xffffffff || (gasleft() * 63) / 64 > gas);

    latestSourceChainId = sourceChainId;
    latestSourceChainSender = sourceChainSender;
    (bool success, bytes memory returnData) = target.call{gas: gas}(data);
    latestSourceChainSender = address(0);
    latestSourceChainId = bytes32("0x");
    validateExecutionStatus(success, returnData);
  }

  function validateExecutionStatus(bool success, bytes memory returnData)
    private
    pure
  {
    (returnData);
    require(success);
  }

  function getChainId() private pure returns (bytes32) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return bytes32(id);
  }
}
