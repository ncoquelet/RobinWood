// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import {
  withAllowedCertifierLabel,
  withCertifiedProductor,
  withCertifiedProductorAndMerchandise,
} from './utils/fixtures'
import { LABEL_1, MERCH_2_BOARD, MERCH_1_TREE } from './utils/constants'

describe('Merchandise contract', function () {
  describe('Mint Merchandise', () => {
    it('Should mint merchandise with label as certified productor', async () => {
      const { merchandiseC, prod1 } = await loadFixture(withCertifiedProductor)

      await expect(
        merchandiseC
          .connect(prod1)
          .mintWithLabel(MERCH_1_TREE.tokenUri, LABEL_1.id)
      )
        .to.be.emit(merchandiseC, 'MintedWithLabel')
        .withArgs(prod1.address, LABEL_1.id, MERCH_1_TREE.id)
      expect(await merchandiseC.ownerOf(MERCH_1_TREE.id)).to.be.equals(
        prod1.address
      )
      expect(await merchandiseC.tokenURI(MERCH_1_TREE.id)).to.be.equals(
        MERCH_1_TREE.tokenUri
      )
    })

    it('Should revert mint merchandise with label as non certified productor', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withAllowedCertifierLabel
      )

      await expect(
        merchandiseC.connect(prod1).mintWithLabel('New Tree', LABEL_1.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotCertified')
        .withArgs(prod1.address, LABEL_1.id)
    })

    it('Should mint merchandise with other merchandise I own ', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod1)
          .mintWithMerchandise(MERCH_2_BOARD.tokenUri, MERCH_1_TREE.id)
      )
        .to.be.emit(merchandiseC, 'MintedWithMerchandise')
        .withArgs(prod1.address, MERCH_1_TREE.id, MERCH_2_BOARD.id)
      expect(await merchandiseC.ownerOf(MERCH_2_BOARD.id)).to.be.equals(
        prod1.address
      )
      expect(await merchandiseC.tokenURI(MERCH_2_BOARD.id)).to.be.equals(
        MERCH_2_BOARD.tokenUri
      )
      await expect(
        merchandiseC.ownerOf(MERCH_1_TREE.id)
      ).to.be.revertedWithCustomError(merchandiseC, 'ERC721NonexistentToken')
    })

    it('Should revert mint merchandise with other merchandise if i not the owner', async () => {
      const { merchandiseC, prod2 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod2)
          .mintWithMerchandise(MERCH_2_BOARD.tokenUri, MERCH_1_TREE.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotOwner')
        .withArgs(prod2.address, MERCH_1_TREE.id)
    })
  })

  describe('Transport', () => {
    it('Should revert if owner mandate itself as transporter', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod1)
          .mandateTransport(prod1, transf1, MERCH_1_TREE.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'CantMandateOneself')
        .withArgs(prod1.address, MERCH_1_TREE.id)
    })
    it('Should revert if owner mandate itself as recipient', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, prod1, MERCH_1_TREE.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'CantMandateOneself')
        .withArgs(prod1.address, MERCH_1_TREE.id)
    })

    it('Should mandate transporter to transfer merch to recipient ', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)
      )
        .to.be.emit(merchandiseC, 'TransportMandated')
        .withArgs(
          prod1.address,
          transp1.address,
          transf1.address,
          MERCH_1_TREE.id
        )

      expect(await merchandiseC.isMandate(MERCH_1_TREE.id, transp1, transf1)).to
        .be.true
    })

    it('Should revert not owner to merch that i mandate', async () => {
      const { merchandiseC, prod2, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod2)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotOwner')
        .withArgs(prod2.address, MERCH_1_TREE.id)
    })

    it('Should accept to transfer merch to recipient ', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mandateTransport(transp1, transf1, MERCH_1_TREE.id)

      await expect(
        merchandiseC.connect(transp1).acceptTransport(MERCH_1_TREE.id)
      )
        .to.be.emit(merchandiseC, 'TransportAccepted')
        .withArgs(transp1.address, transf1.address, MERCH_1_TREE.id)

      expect(await merchandiseC.isMandateAccepted(MERCH_1_TREE.id, transp1)).to
        .be.true
    })

    it('Should revert if accept non mandate merch', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC.connect(transp1).acceptTransport(MERCH_1_TREE.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotMandated')
        .withArgs(transp1.address, MERCH_1_TREE.id)

      expect(await merchandiseC.isMandateAccepted(MERCH_1_TREE.id, transp1)).to
        .be.false
    })

    it('Should validate transfer by transporter', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mandateTransport(transp1, transf1, MERCH_1_TREE.id)
      await merchandiseC.connect(transp1).acceptTransport(MERCH_1_TREE.id)

      await expect(
        merchandiseC
          .connect(transf1)
          .validateTransport(MERCH_1_TREE.id, transp1)
      )
        .to.be.emit(merchandiseC, 'TransportValidated')
        .withArgs(transp1.address, transf1.address, MERCH_1_TREE.id)

      expect(await merchandiseC.isTransportValidated(MERCH_1_TREE.id, transp1))
        .to.be.true
    })

    it('Should revert if accept non accepted merch', async () => {
      const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mandateTransport(transp1, transf1, MERCH_1_TREE.id)

      await expect(
        merchandiseC
          .connect(transf1)
          .validateTransport(MERCH_1_TREE.id, transp1)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotAccepted')
        .withArgs(transf1.address, MERCH_1_TREE.id)

      expect(await merchandiseC.isTransportValidated(MERCH_1_TREE.id, transp1))
        .to.be.false
    })
  })
})
