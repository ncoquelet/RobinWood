"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, parseAbiItem } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

// hooks
import useBase64 from "@/hooks/useBase64";
import useNftStorage from "@/hooks/useNftStorage";

// types
import { ProductFormData } from "@/components/products/AddProduct";
import { Product } from "@/types";

// Abis
import merchandiseAbi from "@/abi/Merchandise.json";
const merchandiseContractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_MERCHANDISE as Address;

export enum ProductStatus {
  MINTED = "MINTED",
  BURNED = "BURNED",
}

type ProductContextProps = {
  currentProduct?: Product;
  fetchingProducts: boolean;
  products: Array<Product>;
  setCurrentProduct(product: Product): void;
  setFilterMyProduct(filter: boolean): void;
  mintNewTree(product: ProductFormData): void;
};

// product context
const ProductContext = createContext<ProductContextProps>({
  currentProduct: undefined,
  fetchingProducts: false,
  products: [] as Array<Product>,
  setCurrentProduct: () => {},
  setFilterMyProduct: () => {},
  mintNewTree: () => {},
});

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

    // const productMetadataCid = await nftstorage.storeBlob(
    //   new Blob([JSON.stringify(productMetadata)])
    // );

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
    fetchproduts();
  }, [filterMyProduct]);

  return (
    <ProductContext.Provider
      value={{
        currentProduct,
        products,
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
