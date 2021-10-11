import { task, types } from 'hardhat/config'
import { MaticPOSClient } from '@maticnetwork/maticjs'

const { INFURA_KEY } = process.env
const optionalYes = true

const SEND_MESSAGE_EVENT_SIG =
  '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036'

task(
  'generateProof',
  'generates a cryptographic proof that a Tx that happened on ChildChain'
)
  .addParam('tx', 'Transaction id in ChildChain', undefined, types.string)
  .addParam(
    'ismainnet',
    'should the proof be generated for mainnet',
    undefined,
    types.boolean,
    optionalYes
  )
  .setAction(async (taskArgs) => {
    const { tx, ismainnet } = taskArgs
    const client = new MaticPOSClient({
      network: 'testnet', // optional, default is testnet
      version: 'mumbai', // optional, default is mumbai
      parentProvider: ismainnet
        ? `https://mainnet.infura.io/v3/${INFURA_KEY}`
        : `https://goerli.infura.io/v3/${INFURA_KEY}`,
      maticProvider: ismainnet
        ? `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`
        : `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    })
    const payload = await client[
      'posRootChainManager'
    ].exitManager.buildPayloadForExitHermoine(tx, SEND_MESSAGE_EVENT_SIG)

    console.log(payload)
  })
