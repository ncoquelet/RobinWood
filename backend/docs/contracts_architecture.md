## Contracts architecture

### Acteurs

```mermaid
flowchart LR

  robin([RobinWood])
  certif([Certificateur])
  expl([Producteur])
  trans([Transformateur])
  nego([Negociant])
  fab([Fabriquant])
  port([Transporter])
  dist([Distributeur])

  robin ~~~ certif
  expl ~~~ trans ~~~ fab ~~~ nego ~~~ dist

```

### Contrats

```mermaid
flowchart TB

  labl[Label]
  arbre[Arbre]
  derive[Produit dérivé]
  produit[Produit final]

```

### Contrat Label

```mermaid
flowchart

  robin([Producteur])
  certif([Certificateur])
  expl([Producteur])
  any([Public])

  labl[Label]

  certif -->|"propose(label)"| labl
  robin -->|"approve(label)"| labl
  certif -->|"approve(operator)"| labl -.-> |label| expl
  any -->|"verify(operator,label)"| labl

```

| Méthode                 | Description                        | Auth                 |
| ----------------------- | ---------------------------------- | -------------------- |
| propose(label)          | Propose a new label                |                      |
| approve(label)          | Approve a proposed label           | isOwner              |
| approve(operator)       | Approve a operator                 | isApprovedLabelOwner |
| verify(operator, label) | Verify if an operator owns a label |                      |

### Contrat Arbre

```mermaid
flowchart

  expl([Producteur])
  trans([Producteur / Transformateur / Negociant])
  any([Public])

  labl[Lable]
  arbre[Arbre]

  expl -->|"mint(tree, label)"| arbre
  trans -->|"transfer(tree, operator)"| arbre -.->|"arbre"| trans
  any -->|"verify(operator,arbre)"| arbre
  arbre -->|"verify(operator,label)"| labl

  linkStyle 0,4 stroke:green;

```

| Méthode                  | Description                       | Auth                       |
| ------------------------ | --------------------------------- | -------------------------- |
| mint(tree, label)        | Mint a new tree                   | isVerified(operator,label) |
| transfer(tree, operator) | Transfer a tree                   | isOwner(tree)              |
| verify(operator,arbre)   | Verify if an operator owns a tree |                            |

### Contrat Produit Dérivé

```mermaid
flowchart

  trans([Transformateur])
  trans([Producteur / Transformateur / Negociant])
  any([Public])

  byprod[Byproduct]
  arbre[Arbre]

  trans -->|"mint(deriv, tree)"| arbre
  trans -->|"transfer(tree, operator)"| arbre -.->|"arbre"| trans
  any -->|"verify(operator,arbre)"| arbre
  arbre -->|"verify(operator,label)"| labl

  linkStyle 0,4 stroke:green;

```
