"use client";

import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

// hooks
import useBase64 from "@/hooks/useBase64";
import useNftStorage from "@/hooks/useNftStorage";

// Abis
import { ProductFormData } from "@/components/products/AddProduct";
import { Product } from "@/types";

import merchandiseAbi from "@/abi/Merchandise.json";
const merchandiseContractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_MERCHANDISE as Address;

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
  const [refresh, setRefresh] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  // properties
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [products, setProducts] = useState<Array<Product>>([]);
  const [filterMyProduct, setFilterMyProduct] = useState(false);

  const fetchproduts = () => {};

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
