// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import {
  withAllowedCertifierLabel,
  withCertifiedProductor,
  withCertifiedProductorAndMerchandise,
} from './utils/fixtures'
import {
  LABEL_1,
  MERCH_2_BOARD,
  MERCH_1_TREE,
  MandateStatus,
} from './utils/constants'
import { getSign } from './utils/crypto'

describe('contract', function () {
  describe('Mint Merchandise', () => {
    it('Should mint new merchandise as a certified producer of a label', async () => {
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

    it('Should revert when mint new merchandise as a non certified producer of a label', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withAllowedCertifierLabel
      )

      await expect(
        merchandiseC.connect(prod1).mintWithLabel('New Tree', LABEL_1.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotCertified')
        .withArgs(prod1.address, LABEL_1.id)
    })

    it('Should mint new merchandise from other merchandise I own ', async () => {
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

    it("Should revert when mint new merchandise from other merchandise I don't own", async () => {
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
    describe('Mandate', () => {
      it('Should revert when owner assigns self as transporter', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await expect(
          merchandiseC
            .connect(prod1)
            .mandateTransport(prod1, transf1, MERCH_1_TREE.id)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'ERC721InvalidApprover')
          .withArgs(prod1.address)
      })
      it('Should revert when owner assigns 0x as transporter', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await expect(
          merchandiseC
            .connect(prod1)
            .mandateTransport(ethers.ZeroAddress, transf1, MERCH_1_TREE.id)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'ERC721InvalidApprover')
          .withArgs(ethers.ZeroAddress)
      })
      it('Should revert when owner assigns self as recipient', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await expect(
          merchandiseC
            .connect(prod1)
            .mandateTransport(transp1, prod1, MERCH_1_TREE.id)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'ERC721InvalidReceiver')
          .withArgs(prod1.address)
      })
      it('Should revert when owner assigns 0x as recipient', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await expect(
          merchandiseC
            .connect(prod1)
            .mandateTransport(transp1, ethers.ZeroAddress, MERCH_1_TREE.id)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'ERC721InvalidReceiver')
          .withArgs(ethers.ZeroAddress)
      })

      it('Should mandate transporter to deliver merchandise to recipient', async () => {
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
          .to.be.emit(merchandiseC, 'TransportMerchandise')
          .withArgs(
            MERCH_1_TREE.id,
            prod1.address,
            transp1.address,
            transf1.address,
            MandateStatus.CREATED
          )
        expect(await merchandiseC.isMandate(MERCH_1_TREE.id, transp1, transf1))
          .to.be.true
      })

      it('Should revert when unauthorized user try to mandate merchandise', async () => {
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
    })

    describe('Accept', () => {
      it('Should accept to transport merchandise to recipient ', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)

        const { signature } = await getSign(MERCH_1_TREE.id, transp1, transf1)

        await expect(
          merchandiseC
            .connect(transp1)
            .acceptTransport(MERCH_1_TREE.id, signature)
        )
          .to.be.emit(merchandiseC, 'TransportAccepted')
          .withArgs(transp1.address, transf1.address, MERCH_1_TREE.id)
          .to.be.emit(merchandiseC, 'TransportMerchandise')
          .withArgs(
            MERCH_1_TREE.id,
            prod1.address,
            transp1.address,
            transf1.address,
            MandateStatus.ACCEPTED
          )

        expect(await merchandiseC.isMandateAccepted(MERCH_1_TREE.id, transp1))
          .to.be.true
      })

      it('Should revert when accepting to transfer non-mandated merchandise', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )
        const { signature } = await getSign(MERCH_1_TREE.id, transp1, transf1)
        await expect(
          merchandiseC
            .connect(transp1)
            .acceptTransport(MERCH_1_TREE.id, signature)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'NotMandated')
          .withArgs(transp1.address, MERCH_1_TREE.id)

        expect(await merchandiseC.isMandateAccepted(MERCH_1_TREE.id, transp1))
          .to.be.false
      })
    })

    describe('Validate', () => {
      it('Should validate transfer conducted by transporter', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)

        const { signature, salt } = await getSign(
          MERCH_1_TREE.id,
          transp1,
          transf1
        )
        await merchandiseC
          .connect(transp1)
          .acceptTransport(MERCH_1_TREE.id, signature)

        await expect(
          merchandiseC
            .connect(transf1)
            .validateTransport(MERCH_1_TREE.id, transp1, salt)
        )
          .to.be.emit(merchandiseC, 'TransportValidated')
          .withArgs(transp1.address, transf1.address, MERCH_1_TREE.id)
          .to.be.emit(merchandiseC, 'TransportMerchandise')
          .withArgs(
            MERCH_1_TREE.id,
            prod1.address,
            transp1.address,
            transf1.address,
            MandateStatus.VALIDATED
          )

        expect(
          await merchandiseC.isTransportValidated(MERCH_1_TREE.id, transp1)
        ).to.be.true

        expect(await merchandiseC.ownerOf(MERCH_1_TREE.id)).to.be.equals(
          transf1.address
        )
      })

      it('Should revert when validate transfer of non-accepted merchandise', async () => {
        const { merchandiseC, prod1, transp1, transf1 } = await loadFixture(
          withCertifiedProductorAndMerchandise
        )

        await merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)

        const { signature, salt } = await getSign(
          MERCH_1_TREE.id,
          transp1,
          transf1
        )
        await expect(
          merchandiseC
            .connect(transf1)
            .validateTransport(MERCH_1_TREE.id, transp1, salt)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'NotAccepted')
          .withArgs(transf1.address, MERCH_1_TREE.id)

        expect(
          await merchandiseC.isTransportValidated(MERCH_1_TREE.id, transp1)
        ).to.be.false
      })

      it('Should revert when validate transfer if not the recipient', async () => {
        const { merchandiseC, prod1, transp1, transf1, transf2 } =
          await loadFixture(withCertifiedProductorAndMerchandise)

        await merchandiseC
          .connect(prod1)
          .mandateTransport(transp1, transf1, MERCH_1_TREE.id)
        const { signature, salt } = await getSign(
          MERCH_1_TREE.id,
          transp1,
          transf1
        )
        await merchandiseC
          .connect(transp1)
          .acceptTransport(MERCH_1_TREE.id, signature)

        await expect(
          merchandiseC
            .connect(transf2)
            .validateTransport(MERCH_1_TREE.id, transp1, salt)
        )
          .to.be.revertedWithCustomError(merchandiseC, 'NotReciever')
          .withArgs(transf2.address, MERCH_1_TREE.id)

        expect(
          await merchandiseC.isTransportValidated(MERCH_1_TREE.id, transp1)
        ).to.be.false
      })
    })
  })
})
