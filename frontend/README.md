# Robin Wood

## Description

> A Next JS DApp for the RobinWood contracts

## Installation

1. Clone this repo by running `git clone https://github.com/ncoquelet/robinwood`
2. `cd robinwood/frontend`
3. Create a `.env` file with the variables

```
NEXT_PUBLIC_ALCHEMY_KEY=...
NEXT_PUBLIC_WALLETCONNECT_KEY=...
NEXT_PUBLIC_NFTSTORAGE_KEY=...
NEXT_PUBLIC_FROM_BLOCK=...

NEXT_PUBLIC_CONTRACT_LABEL=...
NEXT_PUBLIC_CONTRACT_LABELDELIVERY=...
NEXT_PUBLIC_CONTRACT_MERCHANDISE=...

```

4. `npx next dev`

## Technicals

Use NextJS App Router

## Dependencies

    "next": "^13.4.19",
    "react": "18.2.0",
    "typescript": "5.2.2",
    "@rainbow-me/rainbowkit": "^1.2.0",
    "wagmi": "^1.4.5"
    "viem": "^1.18.9",
    "nft.storage": "^7.1.1",
    "@chakra-ui/react": "^2.8.2",
