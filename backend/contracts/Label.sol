// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title RobinWood Label
 * @author Nicolas
 * @notice As a certifier, use this contract to submit your labels
 */
contract Label is Ownable, ERC721URIStorage {
  uint256 private _nextTokenId;
  mapping(uint256 labelId => bool) allowedLabels;

  /**
   * Event emitted when a new label is submited
   * @param owner owner of label
   * @param tokenId label id
   */
  event LabelSubmitted(address indexed owner, uint256 tokenId);

  /**
   * Event emitted when a new proposal is registered
   * @param tokenId label id
   * @param allowed is allowed or not
   */
  event LabelAllowed(uint256 indexed tokenId, bool indexed allowed);

  error UnknownLabel(uint256 tokenId);
  error NotTransferable(address actor);

  /**
   * @dev uses Ownable to limit some actions to the owner only
   * @dev ERC721 contract
   */
  constructor() Ownable(msg.sender) ERC721("RobinWood Labels", "RWL") {}

  /**
   * @notice Submit a new label with its metadata
   * @dev See {ERC721URIStorage-_setTokenURI}
   * @param _tokenURI the tokenURI
   */
  function submitLabel(string calldata _tokenURI) external {
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, _tokenURI);

    emit LabelSubmitted(msg.sender, tokenId);
  }

  /**
   * @notice Check if the label is allowed
   * @param _tokenId the token label id
   * @return true or false
   */
  function isAllowed(uint256 _tokenId) external view returns (bool) {
    return allowedLabels[_tokenId];
  }

  /**
   * @notice Check if the owner of label is allowed to use it
   * @param _tokenId the token label id
   * @param _to certifier address
   * @return true or false
   */
  function isAllowed(uint256 _tokenId, address _to) external view returns (bool) {
    return allowedLabels[_tokenId] && _ownerOf(_tokenId) == _to;
  }

  /**
   * @notice Allow or revoke a submited label
   * @param _tokenId the token label id
   * @param _allowed allow with true, revoke with false
   */
  function allowLabel(uint256 _tokenId, bool _allowed) external onlyOwner {
    if (_ownerOf(_tokenId) == address(0)) {
      revert UnknownLabel(_tokenId);
    }
    allowedLabels[_tokenId] = _allowed;
    emit LabelAllowed(_tokenId, _allowed);
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
