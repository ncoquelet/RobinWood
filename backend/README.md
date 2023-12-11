# Robin Wood

## Install

1. Clone this repo by running `git clone https://github.com/ncoquelet/robinwood`
2. `cd robinwood/backend`
3. `npm install`
4. Run `npx hardhat compile` to test installation

## Tests

Run `npx hardhat test` to execute test suite

## Start a local node

run `npx hardhat node`

## Deployement scripts

### Localhost

run `npx hardhat run scripts/deploy.ts --network localhost` to deploy the contract manually

### Sepolia

run `HARDHAT_ENV=production npx hardhat run scripts/deploy.ts --network sepolia` to deploy the contract manually

## Simulation

You can simulate full traceability with the command `npx hardhat run scripts/simulate.ts --network localhost`

Before you must add envonment variables to your `.env` file

```
NFTSTORAGE_KEY=...
CONTRACT_LABEL=...
CONTRACT_LABELDELIVERY=...
CONTRACT_MERCHANDISE=...
```

## Documentation

You can read the contract documentation in the [docs directory](docs)

## Graphs

### Control flow

![Contracts interaction](docs/contracts_diagram.md 'Contracts interaction')

![Mandate workflow](docs/mandate_workflow.md 'Mandate workflow')

## Coverage

```
  47 passing (1s)

-----------------------|----------|----------|----------|----------|----------------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |    89.36 |    79.17 |    91.49 |    87.97 |                |
  ERC6150plus.sol      |    74.07 |       50 |    69.23 |    66.67 |... 135,154,170 |
  Label.sol            |      100 |      100 |      100 |      100 |                |
  LabelDelivery.sol    |      100 |      100 |      100 |      100 |                |
  Merchandise.sol      |    93.88 |    84.62 |      100 |     94.2 |147,148,151,302 |
 contracts/interfaces/ |      100 |      100 |      100 |      100 |                |
  IERC6150plus.sol     |      100 |      100 |      100 |      100 |                |
-----------------------|----------|----------|----------|----------|----------------|
All files              |    89.36 |    79.17 |    91.49 |    87.97 |                |
-----------------------|----------|----------|----------|----------|----------------|
```
