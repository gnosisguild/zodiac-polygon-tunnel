import { task } from "hardhat/config"
import { readDeployTempFile } from "./utils"

task(
  "wireRootTunnel",
  "Connect RootTunnel to ChildTunnel on the other side"
).setAction(async (taskArgs, hardhatRuntime) => {
  const signers = await hardhatRuntime.ethers.getSigners()
  const [signer] = signers
  console.log("Using account:", signer.address)

  const { rootTunnelAddress, childTunnelAddress } = readDeployTempFile()
  if (!rootTunnelAddress) {
    throw new Error("Could not find RootTunnel deployed address")
  }

  if (!childTunnelAddress) {
    throw new Error("Could not find ChildTunnel deployed address")
  }

  console.log(`Calling setFxChildTunnel on RootTunnel:`)
  console.log(`\tRootTunnel:  ${rootTunnelAddress}`)
  console.log(`\tChildTunnel: ${childTunnelAddress}`)

  const contract = await hardhatRuntime.ethers.getContractAt(
    "ZodiacPolygonRootTunnel",
    rootTunnelAddress,
    signer
  )

  const transaction = await contract.setFxChildTunnel(childTunnelAddress)

  await transaction.wait()
  console.log(`Done`)
})

task(
  "wireChildTunnel",
  "Connect ChildTunnel to RootTunnel on the other side"
).setAction(async (taskArgs, hardhatRuntime) => {
  const signers = await hardhatRuntime.ethers.getSigners()
  const [signer] = signers
  console.log("Using account:", signer.address)

  const { rootTunnelAddress, childTunnelAddress } = readDeployTempFile()
  if (!rootTunnelAddress) {
    throw new Error("Could not find RootTunnel deployed address")
  }

  console.log(`Calling setFxRootTunnel on ChildTunnel:`)
  console.log(`\tChildTunnel: ${childTunnelAddress}`)
  console.log(`\tRootTunnel:  ${rootTunnelAddress}`)

  const contract = await hardhatRuntime.ethers.getContractAt(
    "ZodiacPolygonChildTunnel",
    rootTunnelAddress,
    signer
  )

  const transaction = await contract.setFxRootTunnel(childTunnelAddress)

  await transaction.wait()
  console.log(`Done`)
})
