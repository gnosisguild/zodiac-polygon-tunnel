// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

// interface IAMBish {
//     function messageSender() external view returns (address);
//     function messageSourceChainId() external view returns (bytes32);
// }

contract TunnelEnd {
  bytes32 private sourceChainId;
  address private sourceChainSender;

  function decodeAndInvokeTarget(bytes memory message) internal {
    (
      bytes32 chainId,
      address sender,
      address target,
      bytes memory data,
      uint256 gas
    ) = abi.decode(message, (bytes32, address, address, bytes, uint256));

    require(gas == 0xffffffff || (gasleft() * 63) / 64 > gas);

    sourceChainId = chainId;
    sourceChainSender = sender;
    (bool success, bytes memory returnData) = target.call{gas: gas}(data);
    sourceChainSender = address(0);
    sourceChainId = bytes32("0x");
    validateExecutionStatus(success, returnData);
  }

  function messageSender() public view returns (address) {
    return sourceChainSender;
  }

  function messageSourceChainId() public view returns (bytes32) {
    return sourceChainId;
  }

  function validateExecutionStatus(bool success, bytes memory returnData)
    private
    pure
  {
    (returnData);
    require(success);
  }

  function getChainId() internal pure returns (bytes32) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return bytes32(id);
  }
}
