import { ProductProvider } from "@/context/ProductContext";
import React, { FC, PropsWithChildren } from "react";

const layout: FC<PropsWithChildren> = ({ children }) => {
  return <ProductProvider>{children}</ProductProvider>;
};

export default layout;
