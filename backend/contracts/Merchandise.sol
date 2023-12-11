// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./LabelDelivery.sol";
import "./ERC6150plus.sol";

/**
 * @title RobinWood Merchandise
 * @author Nicolas
 * @notice Mint Merchandise and transfer them between actors
 */
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

  /**
   * Event emitted when the transport status change
   * @param _merchandiseId merchandise id
   * @param from address of sender
   * @param by address of transporter
   * @param to address of recipient
   * @param status trasnport status
   */
  event TransportMerchandise(uint256 indexed _merchandiseId, address indexed from, address indexed by, address to, MandateStatus status);

  error NotCertified(address addr, uint256 labelId);
  error NotOwner(address addr, uint256 merchandiseId);
  error AlreadyMandated(address addr, uint256 merchandiseId);
  error NotMandated(address addr, uint256 merchandiseId);
  error NotAccepted(address addr, uint256 merchandiseId);
  error NotReciever(address addr, uint256 merchandiseId);
  error WronnSignature();
  error NotTransferable(address actor);

  /**
   * @dev ERC721 contract with ERC6150plus
   * @param _labelDeliveryContract LabelDelivery contract address
   */
  constructor(address _labelDeliveryContract) ERC6150plus("RobinWood Merchandises", "RWM") {
    labelDelivery = LabelDelivery(_labelDeliveryContract);
  }

  // ---------- mint --------

  /**
   * @notice Mint a new merchandise with a label
   * @param _tokenUri merchandise metadata as URI
   * @param _labelId a label id
   */
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

  /**
   * @notice Mint a new merchandise from a merchandise
   * @dev parent merchandise will be burn
   * @param _tokenUri merchandise metadata as URI
   * @param _merchandiseId a merchandise id
   */
  function mintWithParent(string calldata _tokenUri, uint256 _merchandiseId) external {
    uint256[] memory parentIds = new uint256[](1);
    parentIds[0] = _merchandiseId;
    mintWithParents(_tokenUri, parentIds);
  }

  /**
   * @notice Mint a new merchandise from some merchandises
   * @dev parents merchandise will be burn
   * @param _tokenUri merchandise metadata as URI
   * @param _parentIds list of merchandise id
   */
  function mintWithParents(string calldata _tokenUri, uint256[] memory _parentIds) public {
    _requiredParents(_parentIds);

    uint256 tokenId = _nextTokenId++;
    _setTokenURI(tokenId, _tokenUri);
    _safeMintWithParents(msg.sender, _parentIds, tokenId);
    for (uint i; i < _parentIds.length; i++) {
      _burnTo1(_parentIds[i]);
    }
  }

  /**
   * @notice Mint some new merchandises from a merchandise
   * @dev parents merchandise will be burn
   * @param _tokenUris list of merchandise metadata URI
   * @param _merchandiseId a merchandise id
   */
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

  /**
   * @notice Mandate a transporter to transport your merchandise to a recipient
   * @param by address of transporter
   * @param to address of recipient
   * @param _merchandiseId a merchandise id
   */
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

  /**
   * @notice Is mandate exist for a marchandise, a transporter and a recipient
   * @param _merchandiseId merchandise id
   * @param by address of transporter
   * @param to address of recipient
   * @return true or false
   */
  function isMandate(uint256 _merchandiseId, address by, address to) external view returns (bool) {
    return mandates[_merchandiseId][by].to == to;
  }

  /**
   * @notice Accept the mandate
   * @dev signature = keccak256(abi.encodePacked(merchandiseId, by, msg.sender, salt)
   * @param sign the transporter signature
   * @param _merchandiseId a merchandise id
   */
  function acceptTransport(uint256 _merchandiseId, bytes calldata sign) external {
    _requireMandated(_merchandiseId);

    mandates[_merchandiseId][msg.sender].status = MandateStatus.ACCEPTED;
    mandates[_merchandiseId][msg.sender].transporterSign = sign;
    emit TransportMerchandise(_merchandiseId, _ownerOf(_merchandiseId), msg.sender, mandates[_merchandiseId][msg.sender].to, MandateStatus.ACCEPTED);
  }

  /**
   * @notice Is mandate accepted for a marchandise, a transporter
   * @param _merchandiseId merchandise id
   * @param by address of transporter
   * @return true or false
   */
  function isMandateAccepted(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].status == MandateStatus.ACCEPTED;
  }

  /**
   * @notice Validate the receipt of merchandise
   * @dev prove that they are a physical exchange of salt to validate the receipt
   * @param _merchandiseId a merchandise id
   * @param by address of transporter
   * @param _salt the salt use to sign
   */
  function validateTransport(uint256 _merchandiseId, address by, bytes32 _salt) external {
    _requireValidable(_merchandiseId, by);
    _requireValidSignature(_merchandiseId, by, _salt);

    mandates[_merchandiseId][by].status = MandateStatus.VALIDATED;
    //TODO ok peut surement faire plus sexy, mais ca me permet d'avancer pour le moment
    address previousOwner = _update(mandates[_merchandiseId][by].to, _merchandiseId, ownerOf(_merchandiseId));
    emit TransportMerchandise(_merchandiseId, previousOwner, by, msg.sender, MandateStatus.VALIDATED);
  }

  /**
   * @notice Is transport validated
   * @param _merchandiseId merchandise id
   * @param by address of transporter
   * @return true or false
   */
  function isTransportValidated(uint256 _merchandiseId, address by) external view returns (bool) {
    return mandates[_merchandiseId][by].status == MandateStatus.VALIDATED;
  }

  // ---------- private --------

  /**
   * Check if merchandise is owned by sender
   * @param _merchandiseId merchandise id
   */
  function _requireOwnerOf(uint256 _merchandiseId) internal view {
    if (_requireOwned(_merchandiseId) != msg.sender) {
      revert NotTheOwner(msg.sender);
    }
  }

  /**
   * Check if merchandise can by mandated by sender
   * @param _merchandiseId merchandise id
   */
  function _requireMandatable(uint256 _merchandiseId) internal view {
    if (isMandated[msg.sender][_merchandiseId]) {
      revert AlreadyMandated(msg.sender, _merchandiseId);
    }
  }

  /**
   * Check if merchandise is mandated to be transported by sender
   * @param _merchandiseId merchandise id
   */
  function _requireMandated(uint256 _merchandiseId) internal view {
    if (mandates[_merchandiseId][msg.sender].to == address(0)) {
      revert NotMandated(msg.sender, _merchandiseId);
    }
  }

  /**
   * Check if merchandise transport is ready to be validate by recipient
   * @param _merchandiseId merchandise id
   */
  function _requireValidable(uint256 _merchandiseId, address by) internal view {
    if (mandates[_merchandiseId][by].to != msg.sender) {
      revert NotReciever(msg.sender, _merchandiseId);
    }
    if (mandates[_merchandiseId][by].status != MandateStatus.ACCEPTED) {
      revert NotAccepted(msg.sender, _merchandiseId);
    }
  }

  /**
   * Check if transporter signature is correct
   * @param _merchandiseId merchandise id
   * @param by the transporter address
   * @param _salt the salt use by transporter to sign
   */
  function _requireValidSignature(uint256 _merchandiseId, address by, bytes32 _salt) internal view {
    bytes32 hash = keccak256(abi.encodePacked(_merchandiseId, by, msg.sender, _salt));
    if (hash.toEthSignedMessageHash().recover(mandates[_merchandiseId][by].transporterSign) == by) {
      revert WronnSignature();
    }
  }

  // ---------- override to avoid transfer --------

  /**
   * @notice DISABLED, revert with NotTransferable
   */
  function transferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/) public view override(ERC721, IERC721) {
    revert NotTransferable(msg.sender);
  }

  /**
   * @notice DISABLED, revert with NotTransferable
   */
  function safeTransferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/, bytes memory /*data*/) public view override(ERC721, IERC721) {
    revert NotTransferable(msg.sender);
  }
}
