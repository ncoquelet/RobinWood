// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Label.sol";

contract LabelDelivery is ERC1155 {
  Label internal label;

  event Certified(address indexed actor, uint256 indexed labelId, bool certified);

  error NotAllowedLabel();
  error NotTransferable(address actor);

  // ---------- modifier ----------

  modifier allowedLabelOnly(uint256 _labelId) {
    if (!label.isAllowed(_labelId, msg.sender)) {
      revert NotAllowedLabel();
    }
    _;
  }

  // ---------- implementation --------

  constructor(address _labelContract) ERC1155("") {
    label = Label(_labelContract);
  }

  function certify(address _actor, uint256 _labelId) external allowedLabelOnly(_labelId) {
    if (balanceOf(_actor, _labelId) == 0) {
      _mint(_actor, _labelId, 1, "");
      emit Certified(_actor, _labelId, true);
    }
  }

  function revoke(address _actor, uint256 _labelId) external allowedLabelOnly(_labelId) {
    if (balanceOf(_actor, _labelId) > 0) {
      _burn(_actor, _labelId, 1);
      emit Certified(_actor, _labelId, false);
    }
  }

  function isCertified(address _actor, uint256 _labelId) external view returns (bool) {
    return balanceOf(_actor, _labelId) > 0;
  }

  // ---------- override to avoid transfer --------

  function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public view override {
    revert NotTransferable(msg.sender);
  }

  function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public view override {
    revert NotTransferable(msg.sender);
  }
}
