"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, getAddress, parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

// hooks
import useBase64 from "@/hooks/useBase64";
import useNftStorage from "@/hooks/useNftStorage";

// types
import { ProductFormData } from "@/components/products/AddProduct";
import { Product, ProductTraceability } from "@/types";

// Abis
import merchandiseAbi from "@/abi/Merchandise.json";
const merchandiseContractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_MERCHANDISE as Address;

export enum ProductStatus {
  MINTED = "MINTED",
  BURNED = "BURNED",
}

export enum ProductTraceabilityType {
  MINTED_WITH = "MINTED_WITH",
  MINTED_FROM = "MINTED_FROM",
  TRANSPORT = "TRANSPORT",
}

type ProductContextProps = {
  currentProduct?: Product;
  fetchingProducts: boolean;
  products: Array<Product>;
  productTraceability: Array<ProductTraceability>;
  setCurrentProduct(product: Product | undefined): void;
  setFilterMyProduct(filter: boolean): void;
  mintNewTree(product: ProductFormData): void;
};

// product context
const ProductContext = createContext<ProductContextProps>({
  currentProduct: undefined,
  fetchingProducts: false,
  products: [] as Array<Product>,
  productTraceability: [] as Array<ProductTraceability>,
  setCurrentProduct: () => {},
  setFilterMyProduct: () => {},
  mintNewTree: () => {},
});

const ADDRESS_0 = getAddress("0x0000000000000000000000000000000000000000");
const ADDRESS_1 = getAddress("0x0000000000000000000000000000000000000001");

export function useProducts() {
  return useContext(ProductContext);
}

export const ProductProvider = ({ children }: PropsWithChildren) => {
  // connection + utils
  const publicClient = usePublicClient();
  const { address } = useAccount(); // TODO: Handle isDisconnected and redirects
  const { nftstorage, formatIpfsUri } = useNftStorage();
  const { fromBase64Uri, toBase64Uri } = useBase64();

  // refresh
  const [fetchingProducts, setFetchingProducts] = useState(false);

  // properties
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [products, setProducts] = useState<Array<Product>>([]);
  const [productTraceability, setProductTraceability] = useState<
    Array<ProductTraceability>
  >([]);
  const [filterMyProduct, setFilterMyProduct] = useState(false);

  const fetchproduts = async () => {
    setFetchingProducts(true);
    try {
      console.log("fetch products");

      const burnedLogs = await publicClient.getLogs({
        address: merchandiseContractAddress,
        event: parseAbiItem(
          "event Burned(address indexed minter, uint256 tokenId)"
        ),
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
      });

      const burnedIds = burnedLogs.map((log) => log.args.tokenId);

      const mintedLogs = await publicClient.getLogs({
        address: merchandiseContractAddress,
        event: parseAbiItem(
          "event Minted(address indexed minter, address indexed to, uint256[] parentId, uint256 tokenId)"
        ),
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
      });

      const allProducts = await Promise.all(
        mintedLogs
          .filter((log) => burnedIds.indexOf(log.args.tokenId) === -1)
          .map(async (log) => {
            const metadataUri = (await readContract({
              address: merchandiseContractAddress,
              abi: merchandiseAbi.abi,
              functionName: "tokenURI",
              args: [log.args.tokenId],
            })) as string;
            const block = await publicClient.getBlock({
              blockHash: log.blockHash,
            });
            const metadata = fromBase64Uri(metadataUri) as Product;
            metadata.id = log.args.tokenId;
            metadata.owner = log.args.to;
            metadata.status = ProductStatus.MINTED;
            metadata.creation_date = new Date(Number(block.timestamp) * 1000);

            return metadata;
          })
      );

      setProducts(allProducts);
    } finally {
      setFetchingProducts(false);
    }
  };

  const fetchProductTraceability = async () => {
    if (currentProduct) {
      const productTraceability = await getProductTraceability(
        currentProduct.id as bigint,
        0
      );
      setProductTraceability(productTraceability);
    }
  };

  const getProductTraceability = async (
    tokenId: bigint,
    index: number
  ): Promise<Array<ProductTraceability>> => {
    const logs = (
      await publicClient.getContractEvents({
        abi: merchandiseAbi.abi,
        address: merchandiseContractAddress,
        eventName: "Transfer",
        args: {
          tokenId: tokenId,
        },
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
        strict: true,
      })
    ).reverse();

    let productTraceability = [] as Array<ProductTraceability>;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      if (log.args.to === ADDRESS_1 || log.args.tokenId !== tokenId) {
        continue;
      }

      if (log.args.from === ADDRESS_0) {
        const parentIds = (await readContract({
          address: merchandiseContractAddress,
          abi: merchandiseAbi.abi,
          functionName: "parentsOf",
          args: [tokenId],
        })) as [];

        if (parentIds.length != 0) {
          productTraceability.push({
            tokenId: tokenId,
            index: index,
            type: ProductTraceabilityType.MINTED_FROM,
            owner: log.args.to,
            from: parentIds,
          } as ProductTraceability);

          for (let j = 0; j < parentIds.length; j++) {
            productTraceability = productTraceability.concat(
              await getProductTraceability(parentIds[j], index + 1)
            );
          }
        } else {
          productTraceability.push({
            tokenId: tokenId,
            index: index,
            type: ProductTraceabilityType.MINTED_WITH,
            owner: log.args.to,
            from: [],
          } as ProductTraceability);
        }
      } else {
        productTraceability.push({
          tokenId: tokenId,
          index: index,
          type: ProductTraceabilityType.TRANSPORT,
          owner: log.args.to,
          from: log.args.from,
        } as ProductTraceability);
      }
    }

    return productTraceability;
  };

  const mintNewTree = async (product: ProductFormData) => {
    const directoryCid = await nftstorage.storeDirectory([
      product.logo,
      product.document,
    ]);

    const productMetadata: Product = {
      name: product.name,
      description: product.description,
      type: product.type,
      image: formatIpfsUri(directoryCid, product.logo.name),
      external_url: formatIpfsUri(directoryCid, product.document.name),
      properties: {
        label_id: product.labelId,
        planting_date: new Date(),
        slaughter_date: new Date(),
      },
    };

    const productMetadataBase64 =
      "data:application/json;base64," +
      Buffer.from(JSON.stringify(productMetadata)).toString("base64");

    const { hash } = await writeContract({
      address: merchandiseContractAddress,
      abi: merchandiseAbi.abi,
      functionName: "mintWithLabel",
      args: [productMetadataBase64, product.labelId],
    });

    const data = await waitForTransaction({ hash });
    fetchproduts();
  };

  useEffect(() => {
    if (currentProduct) {
      fetchProductTraceability();
    }
  }, [currentProduct]);

  useEffect(() => {
    fetchproduts();
  }, [filterMyProduct]);

  return (
    <ProductContext.Provider
      value={{
        currentProduct,
        products,
        productTraceability,
        fetchingProducts,
        mintNewTree,
        setCurrentProduct,
        setFilterMyProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
