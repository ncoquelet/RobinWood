import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('\nDeploy contract')

  const label = await ethers.deployContract('Label')
  await label.waitForDeployment()

  const labelDelivery = await ethers.deployContract('LabelDelivery', [
    label.getAddress(),
  ])
  await labelDelivery.waitForDeployment()

  const merchandise = await ethers.deployContract('Merchandise', [
    labelDelivery.getAddress(),
  ])
  await merchandise.waitForDeployment()

  console.log(`NEXT_PUBLIC_CONTRACT_LABEL=${await label.getAddress()}`)
  console.log(
    `NEXT_PUBLIC_CONTRACT_LABELDELIVERY=${await labelDelivery.getAddress()}`
  )
  console.log(
    `NEXT_PUBLIC_CONTRACT_MERCHANDISE=${await merchandise.getAddress()}`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
