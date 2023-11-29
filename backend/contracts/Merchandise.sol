// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./LabelDelivery.sol";

contract Merchandise is ERC721URIStorage {
  LabelDelivery internal labelDelivery;

  uint256 private _nextTokenId;

  event MintedWithLabel(address indexed owner, uint256 labelId, uint256 merchandiseId);
  event MintedWithMerchandise(address indexed owner, uint256 sourceId, uint256 merchandiseId);

  error NotCertified(address addr, uint256 labelId);
  error NotOwner(address addr, uint256 merchandiseId);

  // ---------- implementation --------

  constructor(address _labelDeliveryContract) ERC721("RobinWood Merchandises", "RWM") {
    labelDelivery = LabelDelivery(_labelDeliveryContract);
  }

  function mintWithLabel(string calldata _tokenUri, uint256 _labelId) external {
    if (!labelDelivery.isCertified(msg.sender, _labelId)) {
      revert NotCertified(msg.sender, _labelId);
    }
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, _tokenUri);
    emit MintedWithLabel(msg.sender, _labelId, tokenId);
  }

  function mintWithMerchandise(string calldata _tokenUri, uint256 _merchandiseId) external {
    if (_ownerOf(_merchandiseId) != msg.sender) {
      revert NotOwner(msg.sender, _merchandiseId);
    }
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _burn(_merchandiseId);
    _setTokenURI(tokenId, _tokenUri);
    emit MintedWithMerchandise(msg.sender, _merchandiseId, tokenId);
  }
}
