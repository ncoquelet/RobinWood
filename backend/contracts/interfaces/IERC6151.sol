// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ERC-6151 Hierarchical NFTs Token Standard
 * @dev See https://eips.ethereum.org/EIPS/eip-6151
 * Note: the ERC-165 identifier for this interface is 0x897e2c73.
 */
interface IERC6151 is IERC721 {
  /**
   * @notice Emitted when `tokenId` token under `parentId` is minted.
   * @param minter The address of minter
   * @param to The address received token
   * @param parentId The id of parent token, if it's zero, it means minted `tokenId` is a root token.
   * @param tokenId The id of minted token, required to be greater than zero
   */
  event Minted(address indexed minter, address indexed to, uint256[] parentId, uint256 tokenId);

  /**
   * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
   * Used in batch transfers.
   * @param idsLength Length of the array of token identifiers
   * @param valuesLength Length of the array of token amounts
   */
  error ERC6150InvalidArrayLength(uint256 idsLength, uint256 valuesLength);

  /**
   * @dev Pass wrong parent
   * @param parent The id of parent token, if it's zero, it means minted `tokenId` is a root token.
   */
  error ERC6150InvalidParent(uint256 parent);

  /**
   * @dev Pass wrong parent
   * @param parentLength The number of parents.
   */
  error ERC6150InvalidParentLength(uint256 parentLength);

  /**
   * @notice Get the parent token of `tokenId` token.
   * @param tokenId The child token
   * @return parentId The Parent token found
   */
  function parentsOf(uint256 tokenId) external view returns (uint256[] memory parentId);

  /**
   * @notice Get the children tokens of `tokenId` token.
   * @param tokenId The parent token
   * @return childrenIds The array of children tokens
   */
  function childrenOf(uint256 tokenId) external view returns (uint256[] memory childrenIds);

  /**
   * @notice Check the `tokenId` token if it is a root token.
   * @param tokenId The token want to be checked
   * @return Return `true` if it is a root token; if not, return `false`
   */
  function isRoot(uint256 tokenId) external view returns (bool);

  /**
   * @notice Check the `tokenId` token if it is a leaf token.
   * @param tokenId The token want to be checked
   * @return Return `true` if it is a leaf token; if not, return `false`
   */
  function isLeaf(uint256 tokenId) external view returns (bool);
}
