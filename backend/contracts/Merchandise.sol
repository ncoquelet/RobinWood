// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./LabelDelivery.sol";

contract Merchandise is ERC721URIStorage {
  LabelDelivery internal labelDelivery;

  uint256 private _nextTokenId;

  event MerchandiseMinted(address indexed owner, uint256 tokenId);

  error NotCertified(address owner, uint256 tokenId);

  constructor(address _labelDeliveryContract) ERC721("RobinWood Merchandises", "RWM") {
    labelDelivery = LabelDelivery(_labelDeliveryContract);
  }

  function mintMerchandise(string calldata _tokenUri, uint256 _labelId) external {
    if (!labelDelivery.isCertified(msg.sender, _labelId)) {
      revert NotCertified(msg.sender, _labelId);
    }
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, _tokenUri);
    emit MerchandiseMinted(msg.sender, tokenId);
  }
}
