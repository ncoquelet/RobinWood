// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Label.sol";

/**
 * @title RobinWood LabelDelivery
 * @author Nicolas
 * @notice Store productor label delivery
 */
contract LabelDelivery is ERC1155 {
  Label internal immutable label;

  /**
   * Event emitted when an actor is certified or not
   * @param actor actor address
   * @param labelId label id
   * @param certified is certified
   */
  event Certified(address indexed actor, uint256 indexed labelId, bool certified);

  error NotAllowedLabel();
  error NotTransferable(address actor);
  error AlreadyCertified(address actor);
  error NotCertified(address actor);

  // ---------- implementation --------

  /**
   * @dev ERC1155 contract
   * @param _labelContract Label contract address
   */
  constructor(address _labelContract) ERC1155("") {
    label = Label(_labelContract);
  }

  /**
   * @notice certify an actor to use one of your label
   * @param _actor address of actor
   * @param _labelId label id
   */
  function certify(address _actor, uint256 _labelId) external {
    _requireAllowedLabel(_labelId);
    if (balanceOf(_actor, _labelId) > 0) {
      revert AlreadyCertified(_actor);
    }
    _mint(_actor, _labelId, 1, "");
    emit Certified(_actor, _labelId, true);
  }

  /**
   * @notice revoke an actor to use one of your label
   * @param _actor address of actor
   * @param _labelId label id
   */
  function revoke(address _actor, uint256 _labelId) external {
    _requireAllowedLabel(_labelId);
    if (balanceOf(_actor, _labelId) == 0) {
      revert NotCertified(_actor);
    }
    _burn(_actor, _labelId, 1);
    emit Certified(_actor, _labelId, false);
  }

  /**
   * @notice verify if an actor is certified for a label
   * @param _actor address of actor
   * @param _labelId label id
   * @return true or false
   */
  function isCertified(address _actor, uint256 _labelId) external view returns (bool) {
    return balanceOf(_actor, _labelId) > 0;
  }

  /**
   * @dev call Label to verify if label is allowed by the protocol
   * @param _labelId label id
   */
  function _requireAllowedLabel(uint256 _labelId) internal view {
    if (!label.isAllowed(_labelId, msg.sender)) {
      revert NotAllowedLabel();
    }
  }

  // ---------- override to avoid transfer --------

  /**
   * @notice DISABLED, revert with NotTransferable
   */
  function safeTransferFrom(address /*from*/, address /*to*/, uint256 /*id*/, uint256 /*value*/, bytes memory /*data*/) public view override {
    revert NotTransferable(msg.sender);
  }

  /**
   * @notice DISABLED, revert with NotTransferable
   */
  function safeBatchTransferFrom(address /*from*/, address /*to*/, uint256[] memory /*ids*/, uint256[] memory /*values*/, bytes memory /*data*/) public view override {
    revert NotTransferable(msg.sender);
  }
}
