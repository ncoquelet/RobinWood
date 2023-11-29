import { ethers } from 'hardhat'
import { LABEL_1 } from './constants'

// ---------- deployement ----------

export async function deployLabelContract() {
  const [owner, cert1, cert2, prod1, prod2, pub] = await ethers.getSigners()
  const labelC = await ethers.deployContract('Label')
  return { labelC, owner, cert1, cert2, prod1, prod2, pub }
}

export async function deployLabelDeliveryContract() {
  const contracts = await deployLabelContract()
  const labelDeliveryC = await ethers.deployContract('LabelDelivery', [
    contracts.labelC.getAddress(),
  ])
  return { ...contracts, labelDeliveryC }
}

export async function deployMerchandiseContract() {
  const contracts = await deployLabelDeliveryContract()
  const merchandiseC = await ethers.deployContract('Merchandise', [
    contracts.labelDeliveryC.getAddress(),
  ])
  return { ...contracts, merchandiseC }
}

// ---------- with data ----------

export async function withAllowedCertifierLabel() {
  const deployed = await deployMerchandiseContract()

  const { labelC, cert1 } = deployed

  await labelC.connect(cert1).submitLabel('new label')
  await labelC.allowLabel(LABEL_1.id, true)

  return deployed
}

export async function withNotAllowedCertifierLabel() {
  const deployed = await deployLabelDeliveryContract()

  const { labelC, cert1 } = deployed

  await labelC.connect(cert1).submitLabel('new label')

  return deployed
}

export async function withCertifiedProductor() {
  const deployed = await withAllowedCertifierLabel()

  const { labelDeliveryC, cert1, prod1 } = deployed

  await labelDeliveryC.connect(cert1).certify(prod1, LABEL_1.id)

  return deployed
}
