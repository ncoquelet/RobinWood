import { ProductProvider } from "@/context/ProductContext";
import { FC, PropsWithChildren } from "react";

const layout: FC<PropsWithChildren> = ({ children }) => {
  return <ProductProvider>{children}</ProductProvider>;
};

export default layout;
