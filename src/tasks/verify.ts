import { task, types } from "hardhat/config"
import { readDeployTempFile } from "./utils"

const optionalYES = true

interface FxConfig {
  checkpointManager: string | null
  fxRoot: string | null
  fxChild: string | null
}

task("verifyRootTunnel", "Verifies the contract on etherscan")
  .addParam(
    "address",
    "Address of the contract",
    undefined,
    types.string,
    optionalYES
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    const { checkpointManager, fxRoot } = (hardhatRuntime as any)
      .fxConfig as FxConfig

    if (!checkpointManager) {
      throw new Error("checkpointManager not found in config")
    }

    if (!fxRoot) {
      throw new Error("fxRoot not found in config")
    }

    const { rootTunnelAddress } = readDeployTempFile()
    const address = taskArgs.address || rootTunnelAddress
    if (!address) {
      throw new Error("Contract address not specified")
    }

    await hardhatRuntime.run("verify", {
      address: address,
      constructorArgsParams: [checkpointManager, fxRoot],
    })
  })

task("verifyChildTunnel", "Verifies the contract on etherscan")
  .addParam(
    "address",
    "Address of the contract",
    undefined,
    types.string,
    optionalYES
  )
  .setAction(async (taskArgs, hardhatRuntime) => {
    const { fxChild } = (hardhatRuntime as any).fxConfig as FxConfig
    if (!fxChild) {
      throw new Error("fxChild not found in config")
    }

    const { childTunnelAddress } = readDeployTempFile()

    const address = taskArgs.address || childTunnelAddress
    if (!address) {
      throw new Error("Contract address not specified")
    }

    await hardhatRuntime.run("verify", {
      address: address,
      constructorArgsParams: [fxChild],
    })
  })

export {}
