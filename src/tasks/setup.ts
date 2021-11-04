import fs from "fs"
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import { task, types } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const DEPLOY_OUT = "./deploy.temp.json"

const optionalYES = true

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
    writeRootTunnelAddress(hardhatRuntime.network.name, contract.address)
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
    writeChildTunnelAddress(hardhatRuntime.network.name, contract.address)
    console.log("Done")
  }
)

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

function writeRootTunnelAddress(network: string, rootTunnelAddress: string) {
  writeDeployTempFile((config) => ({
    ...config,
    rootTunnelAddress,
  }))
}

function writeChildTunnelAddress(network: string, childTunnelAddress: string) {
  writeDeployTempFile((config) => ({
    ...config,
    childTunnelAddress,
  }))
}

function writeDeployTempFile(update: (json: any) => any) {
  let config: any
  try {
    config = JSON.parse(fs.readFileSync(DEPLOY_OUT, "utf8"))
  } catch (e) {
    config = {}
  }

  if (!config) {
    throw new Error("Could not load the temp log file")
  }

  config = update(config)

  fs.writeFileSync(DEPLOY_OUT, JSON.stringify(config, null, 2), "utf8")
}

function readDeployTempFile() {
  let config: any
  try {
    config = JSON.parse(fs.readFileSync(DEPLOY_OUT, "utf8"))
  } catch (e) {
    config = {}
  }

  return config
}

export {}
