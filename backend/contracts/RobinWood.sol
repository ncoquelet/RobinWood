// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract RobinWood is Ownable, ERC721URIStorage {
  uint256 private _nextTokenId;
  mapping(uint256 => bool) acceptedLabels;

  event LabelSubmitted(address indexed owner, uint256 tokenId);

  constructor() Ownable(msg.sender) ERC721("RobinWood", "WOD") {}

  function submitLabel(string calldata tokenURI) external {
    uint256 tokenId = _nextTokenId++;
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenURI);

    emit LabelSubmitted(msg.sender, tokenId);
  }

  function isAccepted(uint256 _tokenId) external view returns (bool) {
    return acceptedLabels[_tokenId];
  }

  function acceptLabel(uint256 _tokenId, bool allowed) external onlyOwner {
    acceptedLabels[_tokenId] = allowed;
  }
}