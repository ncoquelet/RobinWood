// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { deployLabelContract } from './utils/fixtures'
import { LABEL_1, LABEL_2, UNKNOWN_LABEL_ID } from './utils/constants'

describe('contract', function () {
  describe('Deployment', function () {
    it('Should set the right owner', async () => {
      const { labelC, owner } = await loadFixture(deployLabelContract)
      expect(await labelC.owner()).to.equal(owner.address)
    })
  })

  describe('Label', function () {
    it('Should submit a new label as a certifier', async () => {
      const { labelC, cert1, cert2 } = await loadFixture(deployLabelContract)

      await expect(labelC.connect(cert1).submitLabel('new label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert1.address, LABEL_1.id)

      expect(await labelC.ownerOf(LABEL_1.id)).to.be.equals(cert1.address)

      await expect(labelC.connect(cert2).submitLabel('second label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert2.address, LABEL_2.id)

      expect(await labelC.ownerOf(LABEL_2.id)).to.be.equals(cert2.address)
    })

    it('Should new label must not be validate by default', async () => {
      const { labelC, cert1 } = await loadFixture(deployLabelContract)

      await expect(labelC.connect(cert1).submitLabel('new label'))
        .to.emit(labelC, 'LabelSubmitted')
        .withArgs(cert1.address, LABEL_1.id)
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(LABEL_1.id, false)

      expect(await labelC['isAllowed(uint256)'](LABEL_1.id)).to.be.false
    })

    it('Should only admin can accept label', async () => {
      const { labelC, cert1 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')

      await expect(
        labelC.connect(cert1).allowLabel(LABEL_1.id, true)
      ).to.be.revertedWithCustomError(labelC, 'OwnableUnauthorizedAccount')
    })

    it('Should admin accept new label', async () => {
      const { labelC, cert1 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')

      await expect(labelC.allowLabel(LABEL_1.id, true))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(LABEL_1.id, true)
      expect(await labelC['isAllowed(uint256)'](LABEL_1.id)).to.be.true
    })

    it('Should admin disallow a label', async () => {
      const { labelC, cert1 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await expect(labelC.allowLabel(LABEL_1.id, true))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(LABEL_1.id, true)
      expect(await labelC['isAllowed(uint256)'](LABEL_1.id)).to.be.true

      await expect(labelC.allowLabel(LABEL_1.id, false))
        .to.emit(labelC, 'LabelAllowed')
        .withArgs(LABEL_1.id, false)
      expect(await labelC['isAllowed(uint256)'](LABEL_1.id)).to.be.false
    })

    it('Should verify if label is allowed', async () => {
      const { labelC, cert1, pub } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)
      expect(await labelC.connect(pub)['isAllowed(uint256)'](LABEL_1.id)).to.be
        .true
    })

    it('Should verify if unkown label is disallowed by default', async () => {
      const { labelC, cert1, pub } = await loadFixture(deployLabelContract)

      expect(await labelC.connect(pub)['isAllowed(uint256)'](UNKNOWN_LABEL_ID))
        .to.be.false
    })

    it('Should verify if label is allowed for a certifier', async () => {
      const { labelC, cert1, pub } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)
      expect(
        await labelC
          .connect(pub)
          ['isAllowed(uint256,address)'](LABEL_1.id, cert1.address)
      ).to.be.true
    })

    it('Should revert if trying allowed unknown label', async () => {
      const { labelC, cert1, pub } = await loadFixture(deployLabelContract)

      await expect(labelC.allowLabel(UNKNOWN_LABEL_ID, true))
        .to.be.revertedWithCustomError(labelC, 'UnknownLabel')
        .withArgs(UNKNOWN_LABEL_ID)
    })
  })

  describe('Transferable', function () {
    it('Shoul revert on transfer', async () => {
      const { labelC, cert1, cert2 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)
      await expect(labelC.connect(cert1).transferFrom(cert1, cert2, LABEL_1.id))
        .to.be.revertedWithCustomError(labelC, 'NotTransferable')
        .withArgs(cert1.address)
    })

    it('Shoul revert on safe transfer', async () => {
      const { labelC, cert1, cert2 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)
      await expect(
        labelC
          .connect(cert1)
          ['safeTransferFrom(address,address,uint256)'](
            cert1,
            cert2,
            LABEL_1.id
          )
      )
        .to.be.revertedWithCustomError(labelC, 'NotTransferable')
        .withArgs(cert1.address)
    })

    it('Shoul revert on transfer', async () => {
      const { labelC, cert1, cert2 } = await loadFixture(deployLabelContract)

      await labelC.connect(cert1).submitLabel('new label')
      await labelC.allowLabel(LABEL_1.id, true)
      await expect(
        labelC
          .connect(cert1)
          ['safeTransferFrom(address,address,uint256,bytes)'](
            cert1,
            cert2,
            LABEL_1.id,
            '0x'
          )
      )
        .to.be.revertedWithCustomError(labelC, 'NotTransferable')
        .withArgs(cert1.address)
    })
  })
})
