import { ethers } from 'hardhat'

export async function getSign(merchId: number, from: any, to: any) {
  const salt = ethers.randomBytes(32)
  const pack = ethers.solidityPacked(
    ['uint256', 'address', 'address', 'bytes32'],
    [merchId, from.address, to.address, salt]
  )
  const signature = await from.signMessage(pack)

  return { signature, salt }
}
