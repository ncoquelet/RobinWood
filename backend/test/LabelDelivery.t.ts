// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

const LABEL_1 = {
  id: 0,
}

const LABEL_2 = {
  id: 1,
}

describe('LabelDelivery contract', function () {
  async function deployContract() {
    // Get the ContractFactory and Signers here.
    const [owner, cert1, cert2, prod1, prod2, pub] = await ethers.getSigners()

    const labelC = await ethers.deployContract('Label')
    const labelDeliveryC = await ethers.deployContract('LabelDelivery', [
      labelC.getAddress(),
    ])

    return { labelC, labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub }
  }

  async function withAllowedCertifierLabel() {
    const { labelC, labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub } =
      await deployContract()

    await labelC.connect(cert1).submitLabel('new label')
    await labelC.allowLabel(LABEL_1.id, true)

    return { labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub }
  }

  describe('Deployment', function () {
    it('Should set the right owner', async () => {
      const { labelDeliveryC, owner } = await loadFixture(deployContract)
    })
  })

  describe('Label', function () {
    it('Should revert if certifier don\'t own the label', async () => {
      const { labelC, labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub } =
        await loadFixture(deployContract)

      await labelC.connect(cert2).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)

      await expect(
        labelDeliveryC.connect(cert1).certify(prod1.address, LABEL_1.id)
      ).to.be.revertedWithCustomError(labelDeliveryC, 'NotAllowedLabel')
    })

    it('Should revert if label not allowed for certifier', async () => {
      const { labelC, labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub } =
        await loadFixture(deployContract)

      await labelC.connect(cert1).submitLabel('new label')

      await expect(
        labelDeliveryC.connect(cert1).certify(prod1.address, LABEL_1.id)
      ).to.be.revertedWithCustomError(labelDeliveryC, 'NotAllowedLabel')
    })

    it('Should certifier certify productor on his label', async () => {
      const { labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub } =
        await loadFixture(withAllowedCertifierLabel)

      await expect(
        labelDeliveryC.connect(cert1).certify(prod1.address, LABEL_1.id)
      )
        .to.be.emit(labelDeliveryC, 'Certified')
        .withArgs(cert1.address, prod1.address, LABEL_1.id)

      expect(await labelDeliveryC.balanceOf(prod1, LABEL_1.id)).to.be.equals(1)
      expect(await labelDeliveryC.isCertified(prod1, LABEL_1.id)).to.be.true
    })

    it('Should certify productor only once by label', async () => {
      const { labelDeliveryC, owner, cert1, cert2, prod1, prod2, pub } =
        await loadFixture(withAllowedCertifierLabel)

      await labelDeliveryC.connect(cert1).certify(prod1.address, LABEL_1.id)
      await labelDeliveryC.connect(cert1).certify(prod1.address, LABEL_1.id)

      expect(await labelDeliveryC.balanceOf(prod1, LABEL_1.id)).to.be.equals(1)
      expect(await labelDeliveryC.isCertified(prod1, LABEL_1.id)).to.be.true
    })
  })
})
