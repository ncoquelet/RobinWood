"use client";

import { useAccount } from "wagmi";

import {
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Switch,
} from "@chakra-ui/react";

import DisconnectedCard from "@/components/DisconnectedCard";
import AddProduct from "@/components/products/AddProduct";
import ProductTable from "@/components/products/ProductTable";
import { useProducts } from "@/context/ProductContext";

export default function Product() {
  const { isDisconnected } = useAccount();
  const { products, fetchingProducts, setCurrentProduct, setFilterMyProduct } =
    useProducts();
  return (
    <div>
      <div>
        {isDisconnected ? (
          <DisconnectedCard />
        ) : (
          <>
            <HStack spacing={4}>
              <Heading>Products</Heading>
              <AddProduct />
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="filter-owner" mb="0">
                  Filter my products ?
                </FormLabel>
                <Switch
                  id="filter-owner"
                  onChange={(e) => setFilterMyProduct(e.target.checked)}
                />
              </FormControl>
            </HStack>
            <ProductTable
              name="Products"
              productList={products}
              loading={fetchingProducts}
              onRowClick={setCurrentProduct}
            />
          </>
        )}
      </div>
    </div>
  );
}
