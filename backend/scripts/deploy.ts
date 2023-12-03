import { ethers } from 'hardhat'

async function main() {
  console.log('\nDeploy contract')

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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
