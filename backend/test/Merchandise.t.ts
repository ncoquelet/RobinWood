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
  MERCH_2_BOARD2,
  MERCH_3_TABLE,
  ADDRESS_1,
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
      expect(await merchandiseC.parentsOf(MERCH_1_TREE.id)).to.be.empty
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
          .mintWithParent(MERCH_2_BOARD.tokenUri, MERCH_1_TREE.id)
      )
        .to.be.emit(merchandiseC, 'Minted')
        .withArgs(
          prod1.address,
          prod1.address,
          [MERCH_1_TREE.id],
          MERCH_2_BOARD.id
        )
      expect(await merchandiseC.tokenURI(MERCH_2_BOARD.id)).to.be.equals(
        MERCH_2_BOARD.tokenUri
      )
      expect(await merchandiseC.ownerOf(MERCH_2_BOARD.id)).to.be.equals(
        prod1.address
      )
    })

    it('Should burn parent on mint', async () => {
      const { merchandiseC, prod1, burnAddr } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mintWithParent(MERCH_2_BOARD.tokenUri, MERCH_1_TREE.id)

      expect(await merchandiseC.ownerOf(MERCH_1_TREE.id)).to.be.equal(
        burnAddr
      )
    })

    it('Should mint 2 merchandises from other merchandises I own ', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod1)
          .mintBatchWithParent(
            [MERCH_2_BOARD.tokenUri, MERCH_2_BOARD2.tokenUri],
            MERCH_1_TREE.id
          )
      )
        .to.be.emit(merchandiseC, 'Minted')
        .withArgs(
          prod1.address,
          prod1.address,
          [MERCH_1_TREE.id],
          MERCH_2_BOARD.id
        )
        .to.be.emit(merchandiseC, 'Minted')
        .withArgs(
          prod1.address,
          prod1.address,
          [MERCH_1_TREE.id],
          MERCH_2_BOARD2.id
        )

      expect(await merchandiseC.tokenURI(MERCH_2_BOARD.id)).to.be.equals(
        MERCH_2_BOARD.tokenUri
      )
      expect(await merchandiseC.ownerOf(MERCH_2_BOARD.id)).to.be.equals(
        prod1.address
      )
      expect(await merchandiseC.parentsOf(MERCH_2_BOARD.id)).to.be.eql([
        MERCH_1_TREE.id,
      ])
      expect(await merchandiseC.tokenURI(MERCH_2_BOARD2.id)).to.be.equals(
        MERCH_2_BOARD2.tokenUri
      )
      expect(await merchandiseC.ownerOf(MERCH_2_BOARD2.id)).to.be.equals(
        prod1.address
      )
      expect(await merchandiseC.parentsOf(MERCH_2_BOARD2.id)).to.be.eql([
        MERCH_1_TREE.id,
      ])
    })

    it('Should mint one merchandise from two other merchandises I own ', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mintBatchWithParent(
          [MERCH_2_BOARD.tokenUri, MERCH_2_BOARD2.tokenUri],
          MERCH_1_TREE.id
        )

      await expect(
        merchandiseC
          .connect(prod1)
          .mintWithParents(MERCH_3_TABLE.tokenUri, [
            MERCH_2_BOARD.id,
            MERCH_2_BOARD2.id,
          ])
      )
        .to.be.emit(merchandiseC, 'Minted')
        .withArgs(
          prod1.address,
          prod1.address,
          [MERCH_2_BOARD.id, MERCH_2_BOARD2.id],
          MERCH_3_TABLE.id
        )

      expect(await merchandiseC.tokenURI(MERCH_3_TABLE.id)).to.be.equals(
        MERCH_3_TABLE.tokenUri
      )
      expect(await merchandiseC.ownerOf(MERCH_3_TABLE.id)).to.be.equals(
        prod1.address
      )
      expect(await merchandiseC.parentsOf(MERCH_3_TABLE.id))
        .to.have.lengthOf(2)
        .eql([MERCH_2_BOARD.id, MERCH_2_BOARD2.id])
    })

    it('Should burn parents on mint', async () => {
      const { merchandiseC, prod1, burnAddr } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await merchandiseC
        .connect(prod1)
        .mintBatchWithParent(
          [MERCH_2_BOARD.tokenUri, MERCH_2_BOARD2.tokenUri],
          MERCH_1_TREE.id
        )

      await merchandiseC
        .connect(prod1)
        .mintWithParents(MERCH_3_TABLE.tokenUri, [
          MERCH_2_BOARD.id,
          MERCH_2_BOARD2.id,
        ])

       expect(await merchandiseC.ownerOf(MERCH_2_BOARD.id)).to.be.equal(burnAddr)
       expect(await merchandiseC.ownerOf(MERCH_2_BOARD2.id)).to.be.equal(
         burnAddr
       )
    })

    it("Should revert when mint new merchandise from other merchandise I don't own", async () => {
      const { merchandiseC, prod2 } = await loadFixture(
        withCertifiedProductorAndMerchandise
      )

      await expect(
        merchandiseC
          .connect(prod2)
          .mintWithParent(MERCH_2_BOARD.tokenUri, MERCH_1_TREE.id)
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
