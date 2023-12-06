"use client";

import { Product } from "@/types";
import { PropsWithChildren, createContext, useContext, useState } from "react";

export type ProductFormData = {
  name: string;
  description: string;
  type: string;
  label: bigint;
  logo: File;
  document: File;
};

type ProductContextProps = {
  currentProduct?: Product;
  fetchingProducts: boolean;
  products: Array<Product>;
  setCurrentProduct(product: Product): void;
  setFilterMyProduct(filter: boolean): void;
  mintNewTree(product: Product): void;
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
  // refresh
  const [refresh, setRefresh] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  // properties
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [products, setProducts] = useState<Array<Product>>([]);
  const [filterMyProduct, setFilterMyProduct] = useState(false);

  const mintNewTree = (product) => {};

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
