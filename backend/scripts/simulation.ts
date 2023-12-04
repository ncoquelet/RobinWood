import { ethers } from 'hardhat'
import {
  ADDRESS_1,
  LABEL_1,
  LABEL_NAMES,
  MERCH_1_TREE,
  MERCH_2_BOARD,
  MERCH_2_BOARD2,
  MERCH_3_TABLE,
  MERCH_NAMES,
  Merch,
} from '../test/utils/constants'
import { getSign } from '../test/utils/crypto'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { TypedEventLog } from '../typechain-types/common'
import { TransportMerchandiseEvent } from '../typechain-types/contracts/Merchandise'

async function getActors() {
  // prettier-ignore
  const [ owner, cert1, cert2, prod1, prod2, nego1, nego2, fab1, fab2, transf1, transf2, transp1, transp2, dist1, dist2, pub ] = await ethers.getSigners()

  const ACTORNAMES = {} as { [key: string]: string }
  ACTORNAMES[cert1.address] = 'certifier'
  ACTORNAMES[prod1.address] = 'producer'
  ACTORNAMES[nego1.address] = 'trader'
  ACTORNAMES[fab1.address] = 'maker'
  ACTORNAMES[transf1.address] = 'transformer'
  ACTORNAMES[transp1.address] = 'transporter'
  ACTORNAMES[dist1.address] = 'distributor'

  console.log('\nCreating Actors :')
  Object.entries(ACTORNAMES).forEach(([address, title]) => {
    console.log(`${title}: ${address}`)
  })

  function nameOf(signer: HardhatEthersSigner | string) {
    const address =
      signer instanceof HardhatEthersSigner ? signer.address : signer
    return ACTORNAMES[address]
  }

  // prettier-ignore
  return { owner, cert1, cert2, prod1, prod2, nego1, nego2, fab1, fab2, transf1, transf2, transp1, transp2, dist1, dist2, pub, nameOf }
}

async function deployContracts() {
  const actors = await getActors()
  console.log('\nDeploying  contract')

  const label = await ethers.deployContract('Label')
  await label.waitForDeployment()
  console.log(`Label contract: ${await label.getAddress()}`)

  const labelDelivery = await ethers.deployContract('LabelDelivery', [
    label.getAddress(),
  ])
  await labelDelivery.waitForDeployment()
  console.log(`LabelDelivery contract: ${await labelDelivery.getAddress()}`)

  const merchandise = await ethers.deployContract('Merchandise', [
    labelDelivery.getAddress(),
  ])
  await merchandise.waitForDeployment()
  console.log(`Merchandise contract: ${await merchandise.getAddress()}`)

  return { ...actors, label, labelDelivery, merchandise }
}

async function addNewLabel(deployed: any) {
  const { label, labelDelivery, cert1, prod1 } = deployed

  console.log(`\nSubmit new label : OK`)
  await label.connect(cert1).submitLabel(LABEL_1.name)

  console.log('List of submited labels')
  const submitedLabelfilter = label.filters.LabelSubmitted()
  await (
    await label.queryFilter(submitedLabelfilter)
  ).forEach((event: { args: { owner: any; tokenId: any } }) => {
    console.log(` - ${event.args.owner}, "${LABEL_NAMES[event.args.tokenId]}"`)
  })

  console.log('\nAllow new label: OK')
  await label.allowLabel(0, true)

  console.log('List of allowed labels')
  const filter = label.filters['LabelAllowed(uint256,bool)'](undefined, true)
  await (
    await label.queryFilter(filter)
  ).forEach((event: { args: { tokenId: any; allowed: any } }) => {
    console.log(
      ` - "${LABEL_NAMES[event.args.tokenId]}" : ${event.args.allowed}`
    )
  })

  await labelDelivery.connect(cert1).certify(prod1, LABEL_1.id)
  console.log('\nCertify Producer: OK')
}

async function produceAndTransferTree(deployed: any) {
  const { merchandise, prod1, transf1, transp1 } = deployed

  await merchandise
    .connect(prod1)
    .mintWithLabel(MERCH_1_TREE.tokenUri, LABEL_1.id)
  console.log('\nProducer mint "New Tree": OK')

  console.log('\nProducer transfer tree to a transformer :')
  await transfer(prod1, transf1, transp1, MERCH_1_TREE, deployed)
}

async function produceAndTransferBoards(deployed: any) {
  const { merchandise, nego1, transf1, transp1, fab1 } = deployed

  await merchandise
    .connect(transf1)
    .mintBatchWithParent(
      [MERCH_2_BOARD.tokenUri, MERCH_2_BOARD2.tokenUri],
      MERCH_1_TREE.id
    )
  console.log('\nTransformer mint new boards from tree: OK')

  console.log('\nTransformer transfer boards to a trader :')
  await transfer(transf1, nego1, transp1, MERCH_2_BOARD, deployed)
  await transfer(transf1, nego1, transp1, MERCH_2_BOARD2, deployed)

  console.log('\nTrader transfer boards to a maker :')
  await transfer(nego1, fab1, transp1, MERCH_2_BOARD, deployed)
  await transfer(nego1, fab1, transp1, MERCH_2_BOARD2, deployed)
}

async function produceAndTransferTable(deployed: any) {
  const { merchandise, transp1, fab1, dist1 } = deployed
  await merchandise
    .connect(fab1)
    .mintWithParents(MERCH_3_TABLE.tokenUri, [
      MERCH_2_BOARD.id,
      MERCH_2_BOARD2.id,
    ])
  console.log('\nMaker mint new table from board: OK')

  console.log('\nMaker transfer table to a distributor :')
  await transfer(fab1, dist1, transp1, MERCH_3_TABLE, deployed)
}

async function transfer(
  from: HardhatEthersSigner,
  to: HardhatEthersSigner,
  by: HardhatEthersSigner,
  merch: Merch,
  { merchandise, nameOf }: any
) {
  await merchandise.connect(from).mandateTransport(by, to, merch.id)
  console.log(
    ` - mandate ${nameOf(by)} to transfer "${merch.name}" to ${nameOf(to)}: OK`
  )
  await getSign(merch.id, by, to).then(async ({ signature, salt }) => {
    await merchandise.connect(by).acceptTransport(merch.id, signature)
    console.log(` - ${nameOf(by)} accept and sign the mandat: OK`)
    await merchandise.connect(to).validateTransport(merch.id, by, salt)
    console.log(` - ${nameOf(to)} validate delivery: OK`)
  })
}

async function displayTracability(pre: string, tokenId: any, deployed: any) {
  const { merchandise, transp1, fab1, dist1, nameOf } = deployed
  console.log(`\n${pre}Identity card of ${MERCH_NAMES[tokenId]}`)

  const transferfilter = merchandise.filters.Transfer(null, null, tokenId)
  const events: Array<any> = (
    await merchandise.queryFilter(transferfilter)
  ).reverse()

  for (let i = 0; i < events.length; i++) {
    const event = events[i]

    if (event.args.to == ADDRESS_1) {
      continue
    }

    console.log(`${pre}# Owner : ${nameOf(event.args.to)}`)
    if (event.args.from == ethers.ZeroAddress) {
      const parentIds = await merchandise.parentsOf(tokenId)
      if (parentIds.length != 0) {
        console.log(
          `${pre}  > Minted from : [ ${parentIds.map(
            (parentId: any) => MERCH_NAMES[parentId]
          )} ]`
        )
      } else {
        console.log(`${pre}  > Minted with : [ ${LABEL_1.name} ]`)
      }
      for (let i = 0; i < parentIds.length; i++) {
        await displayTracability(pre + '  ', parentIds[i], deployed)
      }
    } else {
      console.log(`${pre}  > Transfered from : ${nameOf(event.args.from)}`)
    }
  }
}

async function displayTransportOf(tokenId: bigint, { merchandise }: any) {
  const transportfilter = merchandise.filters.TransportMerchandise(tokenId)
  const events: Array<any> = (
    await merchandise.queryFilter(transportfilter)
  ).reverse()

  const lastEvent = events.slice(-1)

  console.log(`   > Transfered from  ${tokenId}`)
  if (events.length != 0) {
    events.forEach((event: { args: { _merchandiseId: any; status: any } }) => {
      console.log(`${event.args._merchandiseId} - ${event.args.status}`)
    })
  } else {
    console.log('no transport')
  }
}

async function main() {
  console.log('Welcome to the RobinWood protocol')
  console.log(
    'Here is an example of wood traceability where a tree is transformed into a table after numerous exchanges between stakeholders.'
  )
  console.log('\n--------------------------------------------')

  const deployed = await deployContracts()
  console.log('\n--------------------------------------------')
  await addNewLabel(deployed)
  await produceAndTransferTree(deployed)
  await produceAndTransferBoards(deployed)
  await produceAndTransferTable(deployed)
  console.log('--------------------------------------------')

  await displayTracability('', MERCH_3_TABLE.id, deployed)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
