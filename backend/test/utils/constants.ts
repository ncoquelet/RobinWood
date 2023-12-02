const LABEL_1 = {
  id: 0,
}

const LABEL_2 = {
  id: 1,
}

const UNKNOWN_LABEL_ID = 999

type Merch = {
  id: number
  tokenUri: string
  name: string
}

const MERCH_1_TREE: Merch = {
  id: 0,
  tokenUri: 'New Tree',
  name: 'New Tree',
}
const MERCH_2_BOARD: Merch = {
  id: 1,
  tokenUri: 'New Board',
  name: 'New Board',
}

export {
  Merch,
  LABEL_1,
  LABEL_2,
  UNKNOWN_LABEL_ID,
  MERCH_1_TREE,
  MERCH_2_BOARD,
}
