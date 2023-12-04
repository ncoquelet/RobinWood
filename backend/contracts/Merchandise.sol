// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./LabelDelivery.sol";
import "./ERC6150plus.sol";

contract Merchandise is ERC6150plus {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;

  LabelDelivery internal immutable labelDelivery;

  uint256 private _nextTokenId;

  enum MandateStatus {
    CREATED,
    ACCEPTED,
    VALIDATED
  }

  struct Mandate {
    address to;
    MandateStatus status;
    bytes transporterSign;
  }

  mapping(uint256 labelId => mapping(address transporter => Mandate)) mandates;

  event MintedWithLabel(address indexed from, uint256 labelId, uint256 merchandiseId);

  event TransportMerchandise(uint256 indexed _merchandiseId, address indexed from, address indexed by, address to, MandateStatus status);

  error NotCertified(address addr, uint256 labelId);
  error NotOwner(address addr, uint256 merchandiseId);
  error NotMandated(address addr, uint256 merchandiseId);
  error NotAccepted(address addr, uint256 merchandiseId);
  error NotReciever(address addr, uint256 merchandiseId);
  error WronnSignature();

  constructor(address _labelDeliveryContract) ERC6150plus("RobinWood Merchandises", "RWM") {
    labelDelivery = LabelDelivery(_labelDeliveryContract);
  }

  // ---------- mint --------

  function mintWithLabel(string calldata _tokenUri, uint256 _labelId) external {
    if (!labelDelivery.isCertified(msg.sender, _labelId)) {
      revert NotCertified(msg.sender, _labelId);
    }
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    emit MintedWithLabel(msg.sender, _labelId, tokenId);
  }

  function mintWithParent(string calldata _tokenUri, uint256 _merchandiseId) external {
    _requireOwnerOf(_merchandiseId);

    uint256 tokenId = _nextTokenId++;
    _safeMintWithParent(msg.sender, _merchandiseId, tokenId);
    _burnTo1(_merchandiseId);
  }

  function mintBatchWithParent(string[] calldata _tokenUris, uint256 _merchandiseId) external {
    _requireOwnerOf(_merchandiseId);

    uint256[] memory tokenIds = new uint[](_tokenUris.length);
    for (uint i; i < _tokenUris.length; i++) {
      tokenIds[i] = _nextTokenId++;
    }
    _safeMintBatchWithParent(msg.sender, _merchandiseId, tokenIds);
    _burnTo1(_merchandiseId);
  }

  function mintWithParents(string calldata _tokenUri, uint256[] memory _parentIds) external {
    _requiredParents(_parentIds);

    uint256 tokenId = _nextTokenId++;
    _safeMintWithParents(msg.sender, _parentIds, tokenId);
    for (uint i; i < _parentIds.length; i++) {
      _burnTo1(_parentIds[i]);
    }
  }

  // ---------- transport --------

  function mandateTransport(address by, address to, uint256 _merchandiseId) external {
    _requireOwnerOf(_merchandiseId);
    if (by == msg.sender || by == address(0)) {
      revert ERC721InvalidApprover(by);
    }
    if (to == msg.sender || to == address(0)) {
      revert ERC721InvalidReceiver(to);
    }

    mandates[_merchandiseId][by].to = to;
    emit TransportMerchandise(_merchandiseId, msg.sender, by, to, MandateStatus.CREATED);
  }

  function isMandate(uint256 _merchandiseId, address by, address to) external view returns (bool) {
    return mandates[_merchandiseId][by].to == to;
  }

  function acceptTransport(uint256 _merchandiseId, bytes calldata sign) external {
    _requireMandated(_merchandiseId);

    mandates[_merchandiseId][msg.sender].status = MandateStatus.ACCEPTED;
    mandates[_merchandiseId][msg.sender].transporterSign = sign;
    emit TransportMerchandise(_merchandiseId, _ownerOf(_merchandiseId), msg.sender, mandates[_merchandiseId][msg.sender].to, MandateStatus.ACCEPTED);
  }

  function isMandateAccepted(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].status == MandateStatus.ACCEPTED;
  }

  function validateTransport(uint256 _merchandiseId, address by, bytes32 _salt) external {
    _requireToValidate(_merchandiseId, by);
    _requireValidSignature(_merchandiseId, by, _salt);

    mandates[_merchandiseId][by].status = MandateStatus.VALIDATED;
    //TODO ok peut surement faire plus sexy, mais ca me permet d'avancer pour le moment
    address previousOwner = _update(mandates[_merchandiseId][by].to, _merchandiseId, ownerOf(_merchandiseId));
    emit TransportMerchandise(_merchandiseId, previousOwner, by, msg.sender, MandateStatus.VALIDATED);
  }

  function isTransportValidated(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].status == MandateStatus.VALIDATED;
  }

  // ---------- private --------

  function _requireOwnerOf(uint256 _merchandiseId) internal view {
    if (_ownerOf(_merchandiseId) != msg.sender) {
      revert NotOwner(msg.sender, _merchandiseId);
    }
  }

  function _requireMandated(uint256 _merchandiseId) internal view {
    if (mandates[_merchandiseId][msg.sender].to == address(0)) {
      revert NotMandated(msg.sender, _merchandiseId);
    }
  }

  function _requireToValidate(uint256 _merchandiseId, address by) internal view {
    if (mandates[_merchandiseId][by].to != msg.sender) {
      revert NotReciever(msg.sender, _merchandiseId);
    }
    if (mandates[_merchandiseId][by].status != MandateStatus.ACCEPTED) {
      revert NotAccepted(msg.sender, _merchandiseId);
    }
  }

  function _requireValidSignature(uint256 _merchandiseId, address by, bytes32 _salt) internal view {
    bytes32 hash = keccak256(abi.encodePacked(_merchandiseId, by, msg.sender, _salt));
    if (hash.toEthSignedMessageHash().recover(mandates[_merchandiseId][by].transporterSign) == by) {
      revert WronnSignature();
    }
  }
}
