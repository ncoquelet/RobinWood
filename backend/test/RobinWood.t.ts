// We import Chai to use its asserting functions here.
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('contract', function () {
  async function deployContract() {
    // Get the ContractFactory and Signers here.
    const RobinWood = await ethers.getContractFactory('RobinWood');
    const [owner, cert1, cert2, prod1, prod2, addr5] =
      await ethers.getSigners();

    const rwd = await RobinWood.deploy();

    return { rwd, owner, cert1, cert2, prod1, prod2, addr5 };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async () => {
      const { rwd, owner } = await loadFixture(deployContract);
      expect(await rwd.owner()).to.equal(owner.address);
    });
  });

  describe('Submit', function () {
    it('Should submit a new label as a certifier', async () => {
      const { rwd, cert1, cert2 } = await loadFixture(deployContract);

      await expect(rwd.connect(cert1).submitLabel('new label'))
        .to.emit(rwd, 'LabelSubmitted')
        .withArgs(0, cert1.address);

      expect(await rwd.ownerOf(0)).to.be.equals(cert1.address);

      await expect(rwd.connect(cert2).submitLabel('second label'))
        .to.emit(rwd, 'LabelSubmitted')
        .withArgs(1, cert2.address);

      expect(await rwd.ownerOf(1)).to.be.equals(cert2.address);
    });
  });
});
