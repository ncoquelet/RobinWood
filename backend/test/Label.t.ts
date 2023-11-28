// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('contract', function () {
  async function deployContract() {
    // Get the ContractFactory and Signers here.
    const Label = await ethers.getContractFactory('Label')
    const [owner, cert1, cert2, prod1, prod2, addr5] = await ethers.getSigners()

    const labelC = await Label.deploy()

    return { labelC, owner, cert1, cert2, prod1, prod2, addr5 }
  }

  describe('Deployment', function () {
    it('Should set the right owner', async () => {
      const { labelC, owner } = await loadFixture(deployContract)
      expect(await labelC.owner()).to.equal(owner.address)
    })
  })

  describe('Submit', function () {
    it('Should submit a new label as a certifier', async () => {
      const { labelC, cert1, cert2 } = await loadFixture(deployContract)

      await expect(labelC.connect(cert1).submitLabel('new label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert1.address, 0)

      expect(await labelC.ownerOf(0)).to.be.equals(cert1.address)

      await expect(labelC.connect(cert2).submitLabel('second label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert2.address, 1)

      expect(await labelC.ownerOf(1)).to.be.equals(cert2.address)
    })

    it('Should new label must not be validate by default', async () => {
      const { labelC, cert1 } = await loadFixture(deployContract)

      await expect(labelC.connect(cert1).submitLabel('new label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert1.address, 0)
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(0, false)

      expect(await labelC.isAllowed(0)).to.be.false
    })

    it('Should only admin can accept label', async () => {
      const { labelC, cert1 } = await loadFixture(deployContract)

      await labelC.connect(cert1).submitLabel('new label')

      await expect(
        labelC.connect(cert1).allowLabel(0, true)
      ).to.be.revertedWithCustomError(labelC, 'OwnableUnauthorizedAccount')
    })

    it('Should admin accept new label', async () => {
      const { labelC, cert1 } = await loadFixture(deployContract)

      await labelC.connect(cert1).submitLabel('new label')

      await expect(labelC.allowLabel(0, true))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(0, true)
      expect(await labelC.isAllowed(0)).to.be.true
    })

    it('Should admin disallow a label', async () => {
      const { labelC, cert1 } = await loadFixture(deployContract)

      await labelC.connect(cert1).submitLabel('new label')
      await expect(labelC.allowLabel(0, true))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(0, true)
      expect(await labelC.isAllowed(0)).to.be.true

      await expect(labelC.allowLabel(0, false))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(0, false)
      expect(await labelC.isAllowed(0)).to.be.false
    })
  })
})
