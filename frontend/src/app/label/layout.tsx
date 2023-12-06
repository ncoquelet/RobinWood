import { LabelProvider } from "@/context/LabelContext";
import React, { FC, PropsWithChildren } from "react";

const layout: FC<PropsWithChildren> = ({ children }) => {
  return <LabelProvider>{children}</LabelProvider>;
};

export default layout;
