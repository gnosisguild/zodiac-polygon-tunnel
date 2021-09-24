import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { task, types } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const optionalYES = true

interface DeployRootTunnelTaskArgs {
  checkpointmanager: string | undefined
  fxroot: string | undefined
  account: string | undefined
}

interface DeployChildTunnelTaskArgs {
  fxchild: string | undefined
  account: string | undefined
}

const deployRootTunnel = async (
  taskArgs: DeployRootTunnelTaskArgs,
  hardhatRuntime: HardhatRuntimeEnvironment
) => {
  const signers = await hardhatRuntime.ethers.getSigners()
  const signer = findSigner(signers, taskArgs.account)
  console.log('Using account:', signer.address)

  const checkpointManager =
    taskArgs.checkpointmanager ||
    findCheckpointManager(hardhatRuntime.network.name)

  const fxRoot = taskArgs.fxroot || findFxRoot(hardhatRuntime.network.name)

  if (!checkpointManager) {
    throw new Error('No checkpointManager specified')
  }

  if (!fxRoot) {
    throw new Error('No fxRoot specified')
  }

  console.log(
    `Starting RootTunnel Deployment...\n\tcheckpointManager: ${checkpointManager}\n\tfxRoot: ${fxRoot}`
  )

  const ZodiacPolygonRootTunnel =
    await hardhatRuntime.ethers.getContractFactory('ZodiacPolygonRootTunnel')
  const contract = await ZodiacPolygonRootTunnel.deploy(
    checkpointManager,
    fxRoot
  )

  console.log('RootTunnel deployed to ', contract.address, ' waiting ...')
  await contract.deployTransaction.wait()
  console.log('done')
}

const deployChildTunnel = async (
  taskArgs: DeployChildTunnelTaskArgs,
  hardhatRuntime: HardhatRuntimeEnvironment
) => {
  const signers = await hardhatRuntime.ethers.getSigners()
  const signer = findSigner(signers, taskArgs.account)
  console.log('Using account:', signer.address)

  const fxChild = taskArgs.fxchild || findFxChild(hardhatRuntime.network.name)

  if (!fxChild) {
    throw new Error('No fxChild specified')
  }

  console.log(`Starting ChildTunnel Deployment...\n\tfxChild: ${fxChild}`)

  const ZodiacPolygonChildTunnel =
    await hardhatRuntime.ethers.getContractFactory(
      'ZodiacPolygonChildTunnel',
      signer
    )
  const contract = await ZodiacPolygonChildTunnel.deploy(fxChild)
  console.log('ChildTunnel deployed to ', contract.address, ' waiting ...')
  await contract.deployTransaction.wait()
  console.log('done')
}

task('deployRootTunnel', 'deploy the root tunel')
  .addParam(
    'checkpointmanager',
    'checkpoint manager',
    undefined,
    types.string,
    optionalYES
  )
  .addParam('fxroot', 'Address of fxroot', undefined, types.string, optionalYES)
  .addParam(
    'account',
    'Address of account to use',
    undefined,
    types.string,
    optionalYES
  )
  .setAction(deployRootTunnel)

task('deployChildTunnel', 'deploy the child tunel')
  .addParam(
    'fxchild',
    'Address of fxchild',
    undefined,
    types.string,
    optionalYES
  )
  .addParam('account', 'Address of account to use', undefined, types.string)
  .setAction(deployChildTunnel)

task('verifyRootTunnel', 'Verifies the contract on etherscan')
  .addParam('address', 'Address of the contract', undefined, types.string)
  .addParam(
    'checkpointmanager',
    'checkpointmanager',
    undefined,
    types.string,
    optionalYES
  )
  .addParam('fxroot', 'Address of fxroot', undefined, types.string, optionalYES)

  .setAction(async (taskArgs, hardhatRuntime) => {
    const checkpointManager =
      taskArgs.checkpointmanager ||
      findCheckpointManager(hardhatRuntime.network.name)

    const fxRoot = taskArgs.fxroot || findFxRoot(hardhatRuntime.network.name)

    if (!checkpointManager) {
      throw new Error('No checkpointManager specified')
    }

    if (!fxRoot) {
      throw new Error('No fxRoot specified')
    }

    await hardhatRuntime.run('verify', {
      address: taskArgs.address,
      constructorArgsParams: [checkpointManager, fxRoot],
    })
  })

task('verifyChildTunnel', 'Verifies the contract on etherscan')
  .addParam('address', 'Address of the contract', undefined, types.string)
  .addParam(
    'fxchild',
    'Address of fxchild',
    undefined,
    types.string,
    optionalYES
  )

  .setAction(async (taskArgs, hardhatRuntime) => {
    const fxChild = taskArgs.fxchild || findFxChild(hardhatRuntime.network.name)

    if (!fxChild) {
      throw new Error('No fxChild specified')
    }
    await hardhatRuntime.run('verify', {
      address: taskArgs.address,
      constructorArgsParams: [fxChild],
    })
  })

function findCheckpointManager(network: string): string | null {
  switch (network.toLowerCase()) {
    case 'mainnent':
      return '0x86e4dc95c7fbdbf52e33d563bbdb00823894c287'
    case 'goerli':
    case 'görli':
      return '0x2890bA17EfE978480615e330ecB65333b880928e'
    default:
      return null
  }
}

function findFxRoot(network: string): string | null {
  switch (network.toLowerCase()) {
    case 'mainnet':
    case 'ethereum':
      return '0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2'
    case 'goerli':
    case 'görli':
      return '0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA'
    default:
      return null
  }
}

function findFxChild(network: string): string | null {
  switch (network.toLowerCase()) {
    case 'polygon':
    case 'matic':
      return '0x8397259c983751DAf40400790063935a11afa28a'
    case 'mumbai':
      return '0xCf73231F28B7331BBe3124B907840A94851f9f11'
    default:
      return null
  }
}

function findSigner(
  allSigners: SignerWithAddress[],
  account: string | undefined
): SignerWithAddress {
  if (account) {
    const signer = allSigners.find((signer) => signer.address === account)
    if (!signer) {
      throw Error(`Could not derive a Signer for account ${account}`)
    }
    return signer
  }

  const [signer] = allSigners
  return signer
}

export {}
