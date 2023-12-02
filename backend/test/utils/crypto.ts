import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

export async function getSign(
  merchId: number,
  from: HardhatEthersSigner,
  to: HardhatEthersSigner
) {
  const salt = ethers.randomBytes(32)
  const pack = ethers.solidityPacked(
    ['uint256', 'address', 'address', 'bytes32'],
    [merchId, from.address, to.address, salt]
  )
  const signature = await from.signMessage(pack)

  return { signature, salt }
}
