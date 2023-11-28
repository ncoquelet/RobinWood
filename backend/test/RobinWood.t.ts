// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('contract', function () {
  async function deployContract() {
    // Get the ContractFactory and Signers here.
    const RobinWood = await ethers.getContractFactory('RobinWood')
    const [owner, cert1, cert2, prod1, prod2, addr5] = await ethers.getSigners()

    const rwd = await RobinWood.deploy()

    return { rwd, owner, cert1, cert2, prod1, prod2, addr5 }
  }

  describe('Deployment', function () {
    it('Should set the right owner', async () => {
      const { rwd, owner } = await loadFixture(deployContract)
      expect(await rwd.owner()).to.equal(owner.address)
    })
  })

  describe('Submit', function () {
    it('Should submit a new label as a certifier', async () => {
      const { rwd, cert1, cert2 } = await loadFixture(deployContract)

      await expect(rwd.connect(cert1).submitLabel('new label'))
        .to.emit(rwd, 'LabelSubmitted')
        .withArgs(cert1.address, 0)

      expect(await rwd.ownerOf(0)).to.be.equals(cert1.address)

      await expect(rwd.connect(cert2).submitLabel('second label'))
        .to.emit(rwd, 'LabelSubmitted')
        .withArgs(cert2.address, 1)

      expect(await rwd.ownerOf(1)).to.be.equals(cert2.address)
    })

    it('Should new label must not be validate by default', async () => {
      const { rwd, cert1 } = await loadFixture(deployContract)

      await expect(rwd.connect(cert1).submitLabel('new label'))
        .to.emit(rwd, 'LabelSubmitted')
        .withArgs(cert1.address, 0)
        .to.emit(rwd, 'LabelAllowed')
        .withArgs(0, false)

      expect(await rwd.isAllowed(0)).to.be.false
    })

    it('Should only admin can accept label', async () => {
      const { rwd, cert1 } = await loadFixture(deployContract)

      await rwd.connect(cert1).submitLabel('new label')

      await expect(
        rwd.connect(cert1).allowLabel(0, true)
      ).to.be.revertedWithCustomError(rwd, 'OwnableUnauthorizedAccount')
    })

    it('Should admin accept new label', async () => {
      const { rwd, cert1 } = await loadFixture(deployContract)

      await rwd.connect(cert1).submitLabel('new label')

      await expect(rwd.allowLabel(0, true))
        .to.emit(rwd, 'LabelAllowed')
        .withArgs(0, true)
      expect(await rwd.isAllowed(0)).to.be.true
    })

    it('Should admin disallow a label', async () => {
      const { rwd, cert1 } = await loadFixture(deployContract)

      await rwd.connect(cert1).submitLabel('new label')
      await expect(rwd.allowLabel(0, true))
        .to.emit(rwd, 'LabelAllowed')
        .withArgs(0, true)
      expect(await rwd.isAllowed(0)).to.be.true

      await expect(rwd.allowLabel(0, false))
        .to.emit(rwd, 'LabelAllowed')
        .withArgs(0, false)
      expect(await rwd.isAllowed(0)).to.be.false
    })
  })
})
