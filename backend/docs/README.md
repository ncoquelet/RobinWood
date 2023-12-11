# Solidity API

## ERC6150plus

### Burned

```solidity
event Burned(address minter, uint256 tokenId)
```

Emitted when `tokenId` token is burned.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| minter | address | The address of burner |
| tokenId | uint256 | The id of minted token, required to be greater than zero |

### NotTheOwner

```solidity
error NotTheOwner(address owner)
```

Error throw when minter is not the owner of parents tokens

### constructor

```solidity
constructor(string name_, string symbol_) internal
```

_See {ERC721}_

### parentsOf

```solidity
function parentsOf(uint256 tokenId) public view virtual returns (uint256[] parentId)
```

Get parents of a token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | a token id |

### childrenOf

```solidity
function childrenOf(uint256 tokenId) public view virtual returns (uint256[] childrenIds)
```

Get children of a token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | a token id |

### isRoot

```solidity
function isRoot(uint256 tokenId) public view virtual returns (bool)
```

Check if a token is a root

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | a token id |

### isLeaf

```solidity
function isLeaf(uint256 tokenId) public view virtual returns (bool)
```

Check if a token is a leaf

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | a token id |

### _safeMintBatchWithParent

```solidity
function _safeMintBatchWithParent(address to, uint256 parentId, uint256[] tokenIds) internal virtual
```

_Mint new tokens attached to a parent token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentId | uint256 | token used to mint the token |
| tokenIds | uint256[] | tokens metadata URI |

### _safeMintBatchWithParent

```solidity
function _safeMintBatchWithParent(address to, uint256 parentId, uint256[] tokenIds, bytes[] datas) internal virtual
```

_Mint new tokens attached to a parent token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentId | uint256 | token used to mint the token |
| tokenIds | uint256[] | tokens metadata URI |
| datas | bytes[] | datas |

### _safeMintWithParent

```solidity
function _safeMintWithParent(address to, uint256 parentId, uint256 tokenId) internal virtual
```

_Mint a new token attached to a parent token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentId | uint256 | token used to mint the token |
| tokenId | uint256 | token metadata URI |

### _safeMintWithParent

```solidity
function _safeMintWithParent(address to, uint256 parentId, uint256 tokenId, bytes data) internal virtual
```

_Mint a new token attached to a parent token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentId | uint256 | token used to mint the token |
| tokenId | uint256 | token metadata URI |
| data | bytes | datas |

### _safeMintWithParents

```solidity
function _safeMintWithParents(address to, uint256[] parentIds, uint256 tokenId) internal virtual
```

_Mint a new token attached to parents tokens_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentIds | uint256[] | tokens used to mint the token |
| tokenId | uint256 | token metadata URI |

### _safeMintWithParents

```solidity
function _safeMintWithParents(address to, uint256[] parentIds, uint256 tokenId, bytes data) internal virtual
```

_Mint a new token attached to parents tokens_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | owner of token minted |
| parentIds | uint256[] | tokens used to mint the token |
| tokenId | uint256 | token metadata URI |
| data | bytes | datas |

### _requiredParents

```solidity
function _requiredParents(uint256[] parentIds) internal view
```

_Check that all parents exists and are owned by user that mint token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentIds | uint256[] | tokens used to mint the token |

### _burnTo1

```solidity
function _burnTo1(uint256 tokenId) internal
```

_burn token by sending it to address 0x0000000000000000000000000000000000000001_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | a token id |

## Label

As a certifier, use this contract to submit your labels

### allowedLabels

```solidity
mapping(uint256 => bool) allowedLabels
```

### LabelSubmitted

```solidity
event LabelSubmitted(address owner, uint256 tokenId)
```

Event emitted when a new label is submited

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | owner of label |
| tokenId | uint256 | label id |

### LabelAllowed

```solidity
event LabelAllowed(uint256 tokenId, bool allowed)
```

Event emitted when a new proposal is registered

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | label id |
| allowed | bool | is allowed or not |

### UnknownLabel

```solidity
error UnknownLabel(uint256 tokenId)
```

### NotTransferable

```solidity
error NotTransferable(address actor)
```

### constructor

```solidity
constructor() public
```

_uses Ownable to limit some actions to the owner only
ERC721 contract_

### submitLabel

```solidity
function submitLabel(string _tokenURI) external
```

Submit a new label with its metadata

_See {ERC721URIStorage-_setTokenURI}_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenURI | string | the tokenURI |

### isAllowed

```solidity
function isAllowed(uint256 _tokenId) external view returns (bool)
```

Check if the label is allowed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | the token label id |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### isAllowed

```solidity
function isAllowed(uint256 _tokenId, address _to) external view returns (bool)
```

Check if the owner of label is allowed to use it

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | the token label id |
| _to | address | certifier address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### allowLabel

```solidity
function allowLabel(uint256 _tokenId, bool _allowed) external
```

Allow or revoke a submited label

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | the token label id |
| _allowed | bool | allow with true, revoke with false |

### transferFrom

```solidity
function transferFrom(address, address, uint256) public view
```

DISABLED, revert with NotTransferable

### safeTransferFrom

```solidity
function safeTransferFrom(address, address, uint256, bytes) public view
```

DISABLED, revert with NotTransferable

## LabelDelivery

Store productor label delivery

### label

```solidity
contract Label label
```

### Certified

```solidity
event Certified(address actor, uint256 labelId, bool certified)
```

Event emitted when an actor is certified or not

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| actor | address | actor address |
| labelId | uint256 | label id |
| certified | bool | is certified |

### NotAllowedLabel

```solidity
error NotAllowedLabel()
```

### NotTransferable

```solidity
error NotTransferable(address actor)
```

### AlreadyCertified

```solidity
error AlreadyCertified(address actor)
```

### NotCertified

```solidity
error NotCertified(address actor)
```

### constructor

```solidity
constructor(address _labelContract) public
```

_ERC1155 contract_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _labelContract | address | Label contract address |

### certify

```solidity
function certify(address _actor, uint256 _labelId) external
```

certify an actor to use one of your label

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _actor | address | address of actor |
| _labelId | uint256 | label id |

### revoke

```solidity
function revoke(address _actor, uint256 _labelId) external
```

revoke an actor to use one of your label

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _actor | address | address of actor |
| _labelId | uint256 | label id |

### isCertified

```solidity
function isCertified(address _actor, uint256 _labelId) external view returns (bool)
```

verify if an actor is certified for a label

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _actor | address | address of actor |
| _labelId | uint256 | label id |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### _requireAllowedLabel

```solidity
function _requireAllowedLabel(uint256 _labelId) internal view
```

_call Label to verify if label is allowed by the protocol_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _labelId | uint256 | label id |

### safeTransferFrom

```solidity
function safeTransferFrom(address, address, uint256, uint256, bytes) public view
```

DISABLED, revert with NotTransferable

### safeBatchTransferFrom

```solidity
function safeBatchTransferFrom(address, address, uint256[], uint256[], bytes) public view
```

DISABLED, revert with NotTransferable

## Merchandise

Mint Merchandise and transfer them between actors

### labelDelivery

```solidity
contract LabelDelivery labelDelivery
```

### MandateStatus

```solidity
enum MandateStatus {
  CREATED,
  ACCEPTED,
  VALIDATED
}
```

### Mandate

```solidity
struct Mandate {
  address to;
  enum Merchandise.MandateStatus status;
  bytes transporterSign;
}
```

### mandates

```solidity
mapping(uint256 => mapping(address => struct Merchandise.Mandate)) mandates
```

### isMandated

```solidity
mapping(address => mapping(uint256 => bool)) isMandated
```

### TransportMerchandise

```solidity
event TransportMerchandise(uint256 _merchandiseId, address from, address by, address to, enum Merchandise.MandateStatus status)
```

Event emitted when the transport status change

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| from | address | address of sender |
| by | address | address of transporter |
| to | address | address of recipient |
| status | enum Merchandise.MandateStatus | trasnport status |

### NotCertified

```solidity
error NotCertified(address addr, uint256 labelId)
```

### NotOwner

```solidity
error NotOwner(address addr, uint256 merchandiseId)
```

### AlreadyMandated

```solidity
error AlreadyMandated(address addr, uint256 merchandiseId)
```

### NotMandated

```solidity
error NotMandated(address addr, uint256 merchandiseId)
```

### NotAccepted

```solidity
error NotAccepted(address addr, uint256 merchandiseId)
```

### NotReciever

```solidity
error NotReciever(address addr, uint256 merchandiseId)
```

### WronnSignature

```solidity
error WronnSignature()
```

### NotTransferable

```solidity
error NotTransferable(address actor)
```

### constructor

```solidity
constructor(address _labelDeliveryContract) public
```

_ERC721 contract with ERC6150plus_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _labelDeliveryContract | address | LabelDelivery contract address |

### mintWithLabel

```solidity
function mintWithLabel(string _tokenUri, uint256 _labelId) external
```

Mint a new merchandise with a label

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenUri | string | merchandise metadata as URI |
| _labelId | uint256 | a label id |

### mintWithParent

```solidity
function mintWithParent(string _tokenUri, uint256 _merchandiseId) external
```

Mint a new merchandise from a merchandise

_parent merchandise will be burn_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenUri | string | merchandise metadata as URI |
| _merchandiseId | uint256 | a merchandise id |

### mintWithParents

```solidity
function mintWithParents(string _tokenUri, uint256[] _parentIds) public
```

Mint a new merchandise from some merchandises

_parents merchandise will be burn_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenUri | string | merchandise metadata as URI |
| _parentIds | uint256[] | list of merchandise id |

### mintBatchWithParent

```solidity
function mintBatchWithParent(string[] _tokenUris, uint256 _merchandiseId) external
```

Mint some new merchandises from a merchandise

_parents merchandise will be burn_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenUris | string[] | list of merchandise metadata URI |
| _merchandiseId | uint256 | a merchandise id |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_See {IERC721Metadata-tokenURI}._

### _setTokenURI

```solidity
function _setTokenURI(uint256 tokenId, string _tokenURI) internal virtual
```

_Sets `_tokenURI` as the tokenURI of `tokenId`.

Emits {MetadataUpdate}._

### mandateTransport

```solidity
function mandateTransport(address by, address to, uint256 _merchandiseId) external
```

Mandate a transporter to transport your merchandise to a recipient

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| by | address | address of transporter |
| to | address | address of recipient |
| _merchandiseId | uint256 | a merchandise id |

### isMandate

```solidity
function isMandate(uint256 _merchandiseId, address by, address to) external view returns (bool)
```

Is mandate exist for a marchandise, a transporter and a recipient

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| by | address | address of transporter |
| to | address | address of recipient |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### acceptTransport

```solidity
function acceptTransport(uint256 _merchandiseId, bytes sign) external
```

Accept the mandate

_signature = keccak256(abi.encodePacked(merchandiseId, by, msg.sender, salt)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | a merchandise id |
| sign | bytes | the transporter signature |

### isMandateAccepted

```solidity
function isMandateAccepted(uint256 _merchandiseId, address by) external view returns (bool)
```

Is mandate accepted for a marchandise, a transporter

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| by | address | address of transporter |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### validateTransport

```solidity
function validateTransport(uint256 _merchandiseId, address by, bytes32 _salt) external
```

Validate the receipt of merchandise

_prove that they are a physical exchange of salt to validate the receipt_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | a merchandise id |
| by | address | address of transporter |
| _salt | bytes32 | the salt use to sign |

### isTransportValidated

```solidity
function isTransportValidated(uint256 _merchandiseId, address by) external view returns (bool)
```

Is transport validated

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| by | address | address of transporter |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true or false |

### _requireOwnerOf

```solidity
function _requireOwnerOf(uint256 _merchandiseId) internal view
```

Check if merchandise is owned by sender

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |

### _requireMandatable

```solidity
function _requireMandatable(uint256 _merchandiseId) internal view
```

Check if merchandise can by mandated by sender

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |

### _requireMandated

```solidity
function _requireMandated(uint256 _merchandiseId) internal view
```

Check if merchandise is mandated to be transported by sender

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |

### _requireValidable

```solidity
function _requireValidable(uint256 _merchandiseId, address by) internal view
```

Check if merchandise transport is ready to be validate by recipient

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| by | address |  |

### _requireValidSignature

```solidity
function _requireValidSignature(uint256 _merchandiseId, address by, bytes32 _salt) internal view
```

Check if transporter signature is correct

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _merchandiseId | uint256 | merchandise id |
| by | address | the transporter address |
| _salt | bytes32 | the salt use by transporter to sign |

### transferFrom

```solidity
function transferFrom(address, address, uint256) public view
```

DISABLED, revert with NotTransferable

### safeTransferFrom

```solidity
function safeTransferFrom(address, address, uint256, bytes) public view
```

DISABLED, revert with NotTransferable

## IERC6150plus

_See https://eips.ethereum.org/EIPS/eip-6150plus
Note: the ERC-165 identifier for this interface is 0x897e2c73._

### Minted

```solidity
event Minted(address minter, address to, uint256[] parentId, uint256 tokenId)
```

Emitted when `tokenId` token under `parentId` is minted.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| minter | address | The address of minter |
| to | address | The address received token |
| parentId | uint256[] | The id of parent token, if it's zero, it means minted `tokenId` is a root token. |
| tokenId | uint256 | The id of minted token, required to be greater than zero |

### ERC6150InvalidArrayLength

```solidity
error ERC6150InvalidArrayLength(uint256 idsLength, uint256 valuesLength)
```

_Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
Used in batch transfers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| idsLength | uint256 | Length of the array of token identifiers |
| valuesLength | uint256 | Length of the array of token amounts |

### ERC6150InvalidParent

```solidity
error ERC6150InvalidParent(uint256 parent)
```

_Pass wrong parent_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parent | uint256 | The id of parent token, if it's zero, it means minted `tokenId` is a root token. |

### ERC6150InvalidParentLength

```solidity
error ERC6150InvalidParentLength(uint256 parentLength)
```

_Pass wrong parent_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentLength | uint256 | The number of parents. |

### parentsOf

```solidity
function parentsOf(uint256 tokenId) external view returns (uint256[] parentId)
```

Get the parent token of `tokenId` token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The child token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256[] | The Parent token found |

### childrenOf

```solidity
function childrenOf(uint256 tokenId) external view returns (uint256[] childrenIds)
```

Get the children tokens of `tokenId` token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The parent token |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| childrenIds | uint256[] | The array of children tokens |

### isRoot

```solidity
function isRoot(uint256 tokenId) external view returns (bool)
```

Check the `tokenId` token if it is a root token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token want to be checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Return `true` if it is a root token; if not, return `false` |

### isLeaf

```solidity
function isLeaf(uint256 tokenId) external view returns (bool)
```

Check the `tokenId` token if it is a leaf token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The token want to be checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | Return `true` if it is a leaf token; if not, return `false` |

