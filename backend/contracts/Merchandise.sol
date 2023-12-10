// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./LabelDelivery.sol";
import "./ERC6150plus.sol";

contract Merchandise is ERC6150plus {
  using ECDSA for bytes32;
  using MessageHashUtils for bytes32;

  LabelDelivery internal immutable labelDelivery;

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

  uint256 private _nextTokenId;
  mapping(uint256 tokenId => string) private _tokenURIs;
  mapping(uint256 tokenId => mapping(address transporter => Mandate)) mandates;
  mapping(address owner => mapping(uint256 tokenId => bool)) isMandated;

  event MintedWithLabel(address indexed from, uint256 labelId, uint256 merchandiseId);

  event TransportMerchandise(uint256 indexed _merchandiseId, address indexed from, address indexed by, address to, MandateStatus status);

  error NotCertified(address addr, uint256 labelId);
  error NotOwner(address addr, uint256 merchandiseId);
  error AlreadyMandated(address addr, uint256 merchandiseId);
  error NotMandated(address addr, uint256 merchandiseId);
  error NotAccepted(address addr, uint256 merchandiseId);
  error NotReciever(address addr, uint256 merchandiseId);
  error WronnSignature();
  error NotTransferable(address actor);

  constructor(address _labelDeliveryContract) ERC6150plus("RobinWood Merchandises", "RWM") {
    labelDelivery = LabelDelivery(_labelDeliveryContract);
  }

  // ---------- mint --------

  function mintWithLabel(string calldata _tokenUri, uint256 _labelId) external {
    if (!labelDelivery.isCertified(msg.sender, _labelId)) {
      revert NotCertified(msg.sender, _labelId);
    }
    uint256 tokenId = _nextTokenId++;
    _setTokenURI(tokenId, _tokenUri);
    _mint(msg.sender, tokenId);
    uint256[] memory parentdIds = new uint[](0);
    emit Minted(msg.sender, msg.sender, parentdIds, tokenId);
  }

  function mintWithParent(string calldata _tokenUri, uint256 _merchandiseId) external {
    uint256[] memory parentIds = new uint256[](1);
    parentIds[0] = _merchandiseId;
    mintWithParents(_tokenUri, parentIds);
  }

  function mintWithParents(string calldata _tokenUri, uint256[] memory _parentIds) public {
    _requiredParents(_parentIds);

    uint256 tokenId = _nextTokenId++;
    _setTokenURI(tokenId, _tokenUri);
    _safeMintWithParents(msg.sender, _parentIds, tokenId);
    for (uint i; i < _parentIds.length; i++) {
      _burnTo1(_parentIds[i]);
    }
  }

  function mintBatchWithParent(string[] calldata _tokenUris, uint256 _merchandiseId) external {
    _requireOwnerOf(_merchandiseId);

    uint256[] memory tokenIds = new uint[](_tokenUris.length);
    for (uint i; i < _tokenUris.length; i++) {
      tokenIds[i] = _nextTokenId++;
      _setTokenURI(tokenIds[i], _tokenUris[i]);
    }
    _safeMintBatchWithParent(msg.sender, _merchandiseId, tokenIds);
    _burnTo1(_merchandiseId);
  }

  // ---------- TokenURI --------

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireOwned(tokenId);

    string memory _tokenURI = _tokenURIs[tokenId];
    string memory base = _baseURI();

    // If there is no base URI, return the token URI.
    if (bytes(base).length == 0) {
      return _tokenURI;
    }
    // If both are set, concatenate the baseURI and tokenURI (via string.concat).
    if (bytes(_tokenURI).length > 0) {
      return string.concat(base, _tokenURI);
    }

    return super.tokenURI(tokenId);
  }

  /**
   * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Emits {MetadataUpdate}.
   */
  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    _tokenURIs[tokenId] = _tokenURI;
  }

  // ---------- transport --------

  function mandateTransport(address by, address to, uint256 _merchandiseId) external {
    _requireOwnerOf(_merchandiseId);
    _requireMandatable(_merchandiseId);
    if (by == msg.sender || by == address(0)) {
      revert ERC721InvalidApprover(by);
    }
    if (to == msg.sender || to == address(0)) {
      revert ERC721InvalidReceiver(to);
    }

    mandates[_merchandiseId][by].to = to;
    isMandated[msg.sender][_merchandiseId] = true;
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
    if (_requireOwned(_merchandiseId) != msg.sender) {
      revert NotTheOwner(msg.sender);
    }
  }

  function _requireMandatable(uint256 _merchandiseId) internal view {
    if (isMandated[msg.sender][_merchandiseId]) {
      revert AlreadyMandated(msg.sender, _merchandiseId);
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

  // ---------- override to avoid transfer --------

  function transferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/) public view override(ERC721, IERC721) {
    revert NotTransferable(msg.sender);
  }

  function safeTransferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/, bytes memory /*data*/) public view override(ERC721, IERC721) {
    revert NotTransferable(msg.sender);
  }
}
