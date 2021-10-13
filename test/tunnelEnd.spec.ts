import { expect } from "chai"
import { BigNumber } from "ethers"
import { ethers, waffle, getChainId } from "hardhat"

import { ExposedTunnelEnd, MockTarget } from "../typechain"

import "@nomiclabs/hardhat-ethers"

const ZeroAddress = "0x0000000000000000000000000000000000000000"

describe("TunnelEnd", () => {
  const [sender, firstRecipient, secondRecipient] = waffle.provider.getWallets()
  let tunnelEndContract: ExposedTunnelEnd
  let mockTargetContract: MockTarget

  before(async () => {
    // deploy contracts
    const tunnelEndFactory = await ethers.getContractFactory("ExposedTunnelEnd")
    tunnelEndContract = await tunnelEndFactory.deploy()

    const mockTargetFactory = await ethers.getContractFactory("MockTarget")
    mockTargetContract = await mockTargetFactory.deploy()
  })

  it("encodeIntoTunnel", async () => {
    const [signer] = await ethers.getSigners()
    const chainId = intToBytes32HexString(await getChainId())
    const target = mockTargetContract.address
    const data = ethers.utils.defaultAbiCoder.encode(["bytes"], ["0x"])
    const gas = 21000

    expect(
      await tunnelEndContract.__encodeIntoTunnel(target, data, gas)
    ).to.equal(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "address", "bytes", "uint256"],
        [chainId, signer.address, target, data, gas]
      )
    )
  })

  it("decodeFromTunnel", async () => {
    const [signer] = await ethers.getSigners()
    const chainId = intToBytes32HexString(await getChainId())
    const target = mockTargetContract.address
    const data = ethers.utils.defaultAbiCoder.encode(["bytes"], ["0x"])
    const gas = 70000

    const message = ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "address", "bytes", "uint256"],
      [chainId, signer.address, target, data, gas]
    )

    const result = await tunnelEndContract.__decodeFromTunnel(message)
    expect(result[0]).to.equal(chainId)
    expect(result[1]).to.equal(signer.address)
    expect(result[2]).to.equal(target)
    expect(result[3]).to.equal(data)
    expect(result[4]).to.equal(BigNumber.from(gas))
  })

  it("forwardToTarget")
})

function intToBytes32HexString(i: string): string {
  // convert to hex string
  // pad left with zeros up until 64 -> 32 bytes
  return `0x${parseInt(i).toString(16).padStart(64, "0")}`
}
