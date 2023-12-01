import { ethers } from 'hardhat'
import { LABEL_1, MERCH_1_TREE } from '../test/utils/constants'

async function main() {

  const [
    owner,
    cert1,
    cert2,
    prod1,
    prod2,
    nego1,
    nego2,
    fab1,
    fab2,
    transf1,
    transf2,
    transp1,
    transp2,
    dist1,
    dist2,
  ] = await ethers.getSigners()

  console.log('Deploy contract')

  const label = await ethers.deployContract('Label')
  await label.waitForDeployment()
  console.log(`Label contract ${await label.getAddress()}`)

  const labelDelivery = await ethers.deployContract('LabelDelivery', [
    label.getAddress(),
  ])
  await labelDelivery.waitForDeployment()
  console.log(`LabelDelivery contract ${await labelDelivery.getAddress()}`)

  const merchandise = await ethers.deployContract('Merchandise', [
    labelDelivery.getAddress(),
  ])
  await merchandise.waitForDeployment()
  console.log(`Merchandise contract ${await merchandise.getAddress()}`)

  console.log('\nActors :')
  console.log(`certifier: ${cert1.address}`)
  console.log(`producer: ${prod1.address}`)
  console.log(`trader: ${nego1.address}`)
  console.log(`creator: ${fab1.address}`)
  console.log(`transformer: ${transf1.address}`)
  console.log(`transporter: ${transp1.address}`)
  console.log(`distributor: ${dist1.address}`)

  console.log('\nSubmit new Label: OK')
  await label.connect(cert1).submitLabel('Alyra Label')

  console.log('List of submited labels')
  const submitedLabelfilter = label.filters.LabelSubmitted()
  await (
    await label.queryFilter(submitedLabelfilter)
  ).forEach((event) => {
    console.log(` - ${event.args.owner}, id=${event.args.tokenId}`)
  })

  console.log('\nAllow "Alyra Label": OK')
  await label.allowLabel(0, true)

  console.log('List of allowed labels')
  const filter = label.filters['LabelAllowed(uint256,bool)'](undefined, true)
  await (
    await label.queryFilter(filter)
  ).forEach((event) => {
    console.log(` - #${event.args.tokenId} : ${event.args.allowed}`)
  })

  await labelDelivery.connect(cert1).certify(prod1, LABEL_1.id)
  console.log('\nCertify Producer: OK')

  await merchandise.connect(prod1).mintWithLabel(MERCH_1_TREE.tokenUri, LABEL_1.id)
  console.log('Producer mint new tree: OK')

  console.log('Transfer to a transformer :')
  console.log(' - mandate transporter to transfer tree to transformer: OK')
  await merchandise.connect(prod1).mandateTransport(transp1, transf1, MERCH_1_TREE.id)
  console.log(' - transporter accept mandat: OK')
  await merchandise
    .connect(transp1)
    .acceptTransport(MERCH_1_TREE.tokenUri)
  console.log(' - transporter deliver tree: OK')
  await merchandise.connect(transp1).dacceptTransport(MERCH_1_TREE.tokenUri)
  console.log(' - transformer validate delivery: OK')

  await merchandise
    .connect(prod1)
    .mintWithLabel(MERCH_1_TREE.tokenUri, LABEL_1.id)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
