// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import {
  withAllowedCertifierLabel,
  withCertifiedProductor,
} from './utils/fixtures'
import { LABEL_1 } from './utils/constants'

describe('Merchandise contract', function () {
  describe('Mint Tree', () => {
    it('Should mint tree as certified productor', async () => {
      const { merchandiseC, prod1 } = await loadFixture(withCertifiedProductor)

      await expect(
        merchandiseC.connect(prod1).mintMerchandise('New Tree', LABEL_1.id)
      )
        .to.be.emit(merchandiseC, 'MerchandiseMinted')
        .withArgs(prod1.address, 0)
    })

    it('Should revert mint tree as non certified productor', async () => {
      const { merchandiseC, prod1 } = await loadFixture(
        withAllowedCertifierLabel
      )

      await expect(
        merchandiseC.connect(prod1).mintMerchandise('New Tree', LABEL_1.id)
      )
        .to.be.revertedWithCustomError(merchandiseC, 'NotCertified')
        .withArgs(prod1.address, 0)
    })
  })
})
