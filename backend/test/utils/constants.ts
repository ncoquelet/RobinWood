const MandateStatus = {
  CREATED: 0,
  ACCEPTED: 1,
  VALIDATED: 2,
}

const LABEL_1 = {
  id: 0,
}

const LABEL_2 = {
  id: 1,
}

const UNKNOWN_LABEL_ID = 999

type Merch = {
  id: bigint
  tokenUri: string
  name: string
}

const MERCH_1_TREE: Merch = {
  id: 0n,
  tokenUri: 'New Tree',
  name: 'New Tree',
}
const MERCH_2_BOARD: Merch = {
  id: 1n,
  tokenUri: 'New Board',
  name: 'New Board',
}
const MERCH_2_BOARD2: Merch = {
  id: 2n,
  tokenUri: 'New Board',
  name: 'New Board',
}
const MERCH_3_TABLE: Merch = {
  id: 2n,
  tokenUri: 'New Table',
  name: 'New Table',
}

export {
  Merch,
  MandateStatus,
  LABEL_1,
  LABEL_2,
  UNKNOWN_LABEL_ID,
  MERCH_1_TREE,
  MERCH_2_BOARD,
  MERCH_2_BOARD2,
  MERCH_3_TABLE,
}
