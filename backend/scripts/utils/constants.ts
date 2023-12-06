const MandateStatus = {
  CREATED: 0,
  ACCEPTED: 1,
  VALIDATED: 2,
}

const LABEL_1 = {
  id: 0,
  name: 'Eco 2000 label',
}

const LABEL_2 = {
  id: 1,
  name: 'Alyra label',
}

const LABEL_NAMES = [] as Array<string>
LABEL_NAMES[0] = LABEL_1.name
LABEL_NAMES[1] = LABEL_2.name

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
  name: 'New Board 2',
}
const MERCH_3_TABLE: Merch = {
  id: 3n,
  tokenUri: 'New Table',
  name: 'New Table',
}

const MERCH_NAMES = [] as Array<string>
MERCH_NAMES[0] = MERCH_1_TREE.name
MERCH_NAMES[1] = MERCH_2_BOARD.name
MERCH_NAMES[2] = MERCH_2_BOARD2.name
MERCH_NAMES[3] = MERCH_3_TABLE.name

const ADDRESS_1 = '0x0000000000000000000000000000000000000001'

export {
  Merch,
  MandateStatus,
  LABEL_1,
  LABEL_2,
  LABEL_NAMES,
  UNKNOWN_LABEL_ID,
  MERCH_1_TREE,
  MERCH_2_BOARD,
  MERCH_2_BOARD2,
  MERCH_3_TABLE,
  MERCH_NAMES,
  ADDRESS_1,
}
