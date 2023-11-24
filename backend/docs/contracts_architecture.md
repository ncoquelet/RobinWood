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
  other([Producteur / Transformateur / Negociant])
  any([Public])

  labl["fa:fa-lock Lable"]
  arbre[fa:fa-lock Arbre]

  expl -->|"mint(tree, label)"| arbre
  other -->|"transfer(tree, operator)"| arbre -.->|"arbre"| other
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
  other([Transformateur / Negociant / Fabriquant])
  any([Public])

  arbre[Arbre]
  byprod[Byproduct]

  trans -->|"mint(byprod, tree)"| byprod
  other -->|"transfer(byproduct, operator)"| byprod -.->|"byproduct"| other
  any -->|"verify(operator,byproduct)"| byprod
  byprod -->|"verify(operator,arbre)"| arbre
  byprod -->|"burn(operator,arbre)"| arbre

  linkStyle 0,4,5 stroke:green;

```

### Contrat Produit Final

```mermaid
flowchart

  fab([Fabriquant])
  other([Fabriquant / Distributeur])
  any([Public])

  byprod[Byproduct]
  product[Product]

  fab -->|"mint(product, byproduct[])"| product
  other -->|"transfer(product, operator)"| product -.->|"product"| other
  any -->|"verify(operator,product)"| product
  product -->|"verify(operator,byproduct)"| byprod
  product -->|"burn(operator,byproduct)"| byprod

  linkStyle 0,4,5 stroke:green;

```
