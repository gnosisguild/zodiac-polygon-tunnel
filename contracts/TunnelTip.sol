// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

contract TunnelTip {
  address private foreignMessageSender;

  function processMessage(bytes memory message) internal {
    (address sender, address target, bytes memory data, uint256 gas) = abi
      .decode(message, (address, address, bytes, uint256));

    require(gas == 0xffffffff || (gasleft() * 63) / 64 > gas);

    foreignMessageSender = sender;
    (bool success, bytes memory returnData) = target.call{gas: gas}(data);
    validateExecutionStatus(success, returnData);
    foreignMessageSender = address(0);
  }

  function messageSender() public view returns (address) {
    return foreignMessageSender;
  }

  function messageSourceChainId() public pure returns (bytes32) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return bytes32(id);
  }

  function validateExecutionStatus(bool success, bytes memory returnData)
    private
    pure
  {
    (returnData);
    require(success);
  }
}
