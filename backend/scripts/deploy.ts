import { ethers } from 'hardhat'

async function main() {
  console.log('Deploy contract')

  const label = await ethers.deployContract('Label')
  await label.waitForDeployment()
  console.log(`Label contract ${await label.getAddress()}`)

  const labelDelivery = await ethers.deployContract('LabelDelivery', [
    label.getAddress(),
  ])
  await labelDelivery.waitForDeployment()
  console.log(`LabelDelivery contract ${await labelDelivery.getAddress()}`)

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
  ] = await ethers.getSigners()

  console.log('\nSubmit new Label')
  await label.connect(cert1).submitLabel('New Label')

  console.log('List of submited Labels')
  const submitedLabelfilter = label.filters.LabelSubmitted()
  await (
    await label.queryFilter(submitedLabelfilter)
  ).forEach((event) => {
    console.log(` - ${event.args.owner}, id=${event.args.tokenId}`)
  })

  console.log('\nAllow "New Label"')
  await label.allowLabel(0, true)

  console.log('List of submited Labels')
  const filter = label.filters['LabelAllowed(uint256,bool)'](undefined, true)
  await (
    await label.queryFilter(filter)
  ).forEach((event) => {
    console.log(` - #${event.args.tokenId} : ${event.args.allowed}`)
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
