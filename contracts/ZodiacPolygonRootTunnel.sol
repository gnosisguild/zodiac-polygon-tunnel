// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import './lib/FxBaseRootTunnel.sol';

contract ZodiacPolygonRootTunnel is FxBaseRootTunnel {
  address private childSender;

  constructor(address _checkpointManager, address _fxRoot)
    FxBaseRootTunnel(_checkpointManager, _fxRoot)
  {}

  function _processMessageFromChild(bytes memory message) internal override {
    (address sender, address target, bytes memory data, uint256 gas) = abi
      .decode(message, (address, address, bytes, uint256));

    require(gas == 0xffffffff || (gasleft() * 63) / 64 > gas);

    childSender = sender;
    (bool success, bytes memory returnData) = target.call{gas: gas}(data);
    _validateExecutionStatus(success, returnData);
    childSender = address(0);
  }

  function messageSender() public view returns (address) {
    return childSender;
  }

  function messageSourceChainId() public pure returns (bytes32) {
    return bytes32(uint256(80001));
  }

  function _validateExecutionStatus(bool success, bytes memory returnData)
    internal
    pure
  {
    /*
     * TODO given that we mark messages as processed in BaseRootTunnel, are we to require call to be successful?
     */
    (success);
    (returnData);
  }
}
