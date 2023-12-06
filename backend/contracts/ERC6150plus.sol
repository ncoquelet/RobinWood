// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "./interfaces/IERC6150plus.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC6150plus is ERC721, IERC6150plus {
  mapping(uint256 => uint256[]) private _parentsOf;
  mapping(uint256 => uint256[]) private _childrenOf;

  /**
   * @notice Emitted when `tokenId` token is burned.
   * @param minter The address of burner
   * @param tokenId The id of minted token, required to be greater than zero
   */
  event Burned(address indexed minter, uint256 tokenId);

  error NotTheOwner(address owner);

  constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

  function parentsOf(uint256 tokenId) public view virtual override returns (uint256[] memory parentId) {
    _requireOwned(tokenId);
    parentId = _parentsOf[tokenId];
  }

  function childrenOf(uint256 tokenId) public view virtual override returns (uint256[] memory childrenIds) {
    if (tokenId > 0) {
      _requireOwned(tokenId);
    }
    childrenIds = _childrenOf[tokenId];
  }

  function isRoot(uint256 tokenId) public view virtual override returns (bool) {
    _requireOwned(tokenId);
    return _parentsOf[tokenId].length == 0;
  }

  function isLeaf(uint256 tokenId) public view virtual override returns (bool) {
    _requireOwned(tokenId);
    return _childrenOf[tokenId].length == 0;
  }

  function _safeMintBatchWithParent(address to, uint256 parentId, uint256[] memory tokenIds) internal virtual {
    _safeMintBatchWithParent(to, parentId, tokenIds, new bytes[](tokenIds.length));
  }

  function _safeMintBatchWithParent(address to, uint256 parentId, uint256[] memory tokenIds, bytes[] memory datas) internal virtual {
    if (tokenIds.length != datas.length) {
      revert ERC6150InvalidArrayLength(tokenIds.length, datas.length);
    }

    for (uint256 i = 0; i < tokenIds.length; i++) {
      _safeMintWithParent(to, parentId, tokenIds[i], datas[i]);
    }
  }

  function _safeMintWithParent(address to, uint256 parentId, uint256 tokenId) internal virtual {
    _safeMintWithParent(to, parentId, tokenId, "");
  }

  function _safeMintWithParent(address to, uint256 parentId, uint256 tokenId, bytes memory data) internal virtual {
    uint256[] memory parentIds = new uint256[](1);
    parentIds[0] = parentId;
    _safeMintWithParents(to, parentIds, tokenId, data);
  }

  function _safeMintWithParents(address to, uint256[] memory parentIds, uint256 tokenId) internal virtual {
    _safeMintWithParents(to, parentIds, tokenId, "");
  }

  function _safeMintWithParents(address to, uint256[] memory parentIds, uint256 tokenId, bytes memory data) internal virtual {
    if (tokenId == 0) {
      revert ERC6150InvalidParent(tokenId);
    }
    _requiredParents(parentIds);

    _parentsOf[tokenId] = parentIds;
    for (uint i; i < parentIds.length; i++) {
      _childrenOf[parentIds[i]].push(tokenId);
    }

    _safeMint(to, tokenId, data);
    emit Minted(msg.sender, to, parentIds, tokenId);
  }

  function _requiredParents(uint256[] memory parentIds) internal view {
    if (parentIds.length == 0) {
      revert ERC6150InvalidParentLength(parentIds.length);
    }
    for (uint i; i < parentIds.length; i++) {
      if (_requireOwned(parentIds[i]) != msg.sender) {
        revert NotTheOwner(msg.sender);
      }
    }
  }

  function _burnTo1(uint256 tokenId) internal {
    address previousOwner = _update(address(1), tokenId, address(0));
    if (previousOwner == address(0)) {
      revert ERC721NonexistentToken(tokenId);
    }
    emit Burned(msg.sender, tokenId);
  }
}
