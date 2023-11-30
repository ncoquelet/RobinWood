// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./LabelDelivery.sol";

contract Merchandise is ERC721URIStorage {
  LabelDelivery internal labelDelivery;

  uint256 private _nextTokenId;

  struct Mandate {
    address to;
    bool accepted;
    bool validated;
  }

  mapping(uint256 labelId => mapping(address transporter => Mandate)) mandates;

  event MintedWithLabel(address indexed from, uint256 labelId, uint256 merchandiseId);
  event MintedWithMerchandise(address indexed from, uint256 sourceId, uint256 merchandiseId);
  event TransportMandated(address indexed from, address indexed by, address to, uint256 indexed _merchandiseId);
  event TransportAccepted(address indexed by, address to, uint256 indexed _merchandiseId);
  event TransportValidated(address indexed by, address to, uint256 indexed _merchandiseId);

  error NotCertified(address addr, uint256 labelId);
  error NotOwner(address addr, uint256 merchandiseId);
  error NotMandated(address addr, uint256 merchandiseId);
  error NotAccepted(address addr, uint256 merchandiseId);

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
    _requireOwnMerch(_merchandiseId);

    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _burn(_merchandiseId);
    _setTokenURI(tokenId, _tokenUri);
    emit MintedWithMerchandise(msg.sender, _merchandiseId, tokenId);
  }

  // ---------- transport --------

  function mandateTransport(address by, address to, uint256 _merchandiseId) external {
    _requireOwnMerch(_merchandiseId);

    mandates[_merchandiseId][by].to = to;
    emit TransportMandated(msg.sender, by, to, _merchandiseId);
  }

  function isMandate(uint256 _merchandiseId, address by, address to) external view returns (bool) {
    return mandates[_merchandiseId][by].to == to;
  }

  function acceptTransport(uint256 _merchandiseId) external {
    _requireMandated(_merchandiseId);

    mandates[_merchandiseId][msg.sender].accepted = true;
    emit TransportAccepted(msg.sender, mandates[_merchandiseId][msg.sender].to, _merchandiseId);
  }

  function isMandateAccepted(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].accepted;
  }

  function validateTransport(uint256 _merchandiseId, address by) external {
    _requireAccepted(_merchandiseId, by);
    mandates[_merchandiseId][by].validated = true;
    emit TransportValidated(by, msg.sender, _merchandiseId);
  }

  function isTransportValidated(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].validated;
  }

  // ---------- private --------

  function _requireOwnMerch(uint256 _merchandiseId) internal view {
    if (_ownerOf(_merchandiseId) != msg.sender) {
      revert NotOwner(msg.sender, _merchandiseId);
    }
  }

  function _requireMandated(uint256 _merchandiseId) internal view {
    if (mandates[_merchandiseId][msg.sender].to == address(0)) {
      revert NotMandated(msg.sender, _merchandiseId);
    }
  }

  function _requireAccepted(uint256 _merchandiseId, address by) internal view {
    if (!mandates[_merchandiseId][by].accepted) {
      revert NotAccepted(msg.sender, _merchandiseId);
    }
  }
}
