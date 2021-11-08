import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { writeDeployTempFile } from "./utils"

interface FxConfig {
  checkpointManager: string | null
  fxRoot: string | null
  fxChild: string | null
}

task("deployRootTunnel", "deploy the RootTunnel contract").setAction(
  async (_: any, hardhatRuntime: HardhatRuntimeEnvironment) => {
    const { checkpointManager, fxRoot } = (hardhatRuntime as any)
      .fxConfig as FxConfig

    if (!checkpointManager) {
      throw new Error("No checkpointManager specified")
    }

    if (!fxRoot) {
      throw new Error("No fxRoot specified")
    }

    const signers = await hardhatRuntime.ethers.getSigners()
    const [signer] = signers
    console.log("Using account:", signer.address)

    console.log(
      `Starting RootTunnel Deployment...\n\tcheckpointManager: ${checkpointManager}\n\tfxRoot: ${fxRoot}`
    )

    const ZodiacPolygonRootTunnel =
      await hardhatRuntime.ethers.getContractFactory("ZodiacPolygonRootTunnel")
    const contract = await ZodiacPolygonRootTunnel.deploy(
      checkpointManager,
      fxRoot
    )

    console.log("RootTunnel deployed to ", contract.address, " waiting ...")
    await contract.deployTransaction.wait()
    writeRootTunnelAddress(contract.address)
    console.log("done")
  }
)

task("deployChildTunnel", "deploy the ChildTunnel contract").setAction(
  async (_: any, hardhatRuntime: HardhatRuntimeEnvironment) => {
    const { fxChild } = (hardhatRuntime as any).fxConfig as FxConfig
    if (!fxChild) {
      throw new Error("No fxChild specified")
    }

    const signers = await hardhatRuntime.ethers.getSigners()
    const [signer] = signers
    console.log("Using account:", signer.address)

    console.log(`Starting ChildTunnel Deployment...\n\tfxChild: ${fxChild}`)

    const ZodiacPolygonChildTunnel =
      await hardhatRuntime.ethers.getContractFactory(
        "ZodiacPolygonChildTunnel",
        signer
      )
    const contract = await ZodiacPolygonChildTunnel.deploy(fxChild)
    console.log("ChildTunnel deployed to", contract.address, "waiting ...")
    await contract.deployTransaction.wait()
    writeChildTunnelAddress(contract.address)
    console.log("Done")
  }
)

function writeRootTunnelAddress(rootTunnelAddress: string) {
  writeDeployTempFile((config) => ({
    ...config,
    rootTunnelAddress,
  }))
}

function writeChildTunnelAddress(childTunnelAddress: string) {
  writeDeployTempFile((config) => ({
    ...config,
    childTunnelAddress,
  }))
}
