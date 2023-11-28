// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract RobinWood is Ownable, ERC721URIStorage {
  uint256 private _nextTokenId;
  mapping(uint256 => bool) allowedLabels;

  event LabelSubmitted(address indexed owner, uint256 tokenId);
  event LabelAllowed(uint256 indexed tokenId, bool allowed);

  constructor() Ownable(msg.sender) ERC721("RobinWood", "WOD") {}

  function submitLabel(string calldata tokenURI) external {
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenURI);

    emit LabelSubmitted(msg.sender, tokenId);
    // by default emit an not allowed event to enable to list not allowed labels
    emit LabelAllowed(tokenId, false);
  }

  function isAllowed(uint256 _tokenId) external view returns (bool) {
    return allowedLabels[_tokenId];
  }

  function allowLabel(uint256 _tokenId, bool allowed) external onlyOwner {
    allowedLabels[_tokenId] = allowed;
    emit LabelAllowed(_tokenId, allowed);
  }
}
