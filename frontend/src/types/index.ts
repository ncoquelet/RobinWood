import { LabelStatus } from "@/context/LabelContext";
import { ProductStatus } from "@/context/ProductContext";
import { IPFSUri } from "@/hooks/useNftStorage";
import { Address } from "viem";

type LabelProperties = {
  geographic_area: string;
};

export interface Label {
  id?: bigint;
  owner?: Address;
  submitedDate?: Date;
  status?: LabelStatus;
  name: string;
  description: string;
  image: IPFSUri;
  external_url: IPFSUri;
  properties: LabelProperties;
}

type DefaultProductProperties = {
  label_id?: bigint;
};

export type TreeProperties = DefaultProductProperties & {
  planting_date: Date;
  slaughter_date: Date;
  // classification: string;
  // geographic_area: string;
};
export type MerchandiseProperties = DefaultProductProperties & {
  type: string;
  // finishing: string;
  // density: string;
  // resistance: string;
  // dimension:string;
  // color:string;
};
export type ProductProperties = DefaultProductProperties & {
  design: string;
  category: string;
  // finishing: string;
};
export interface Product {
  id?: bigint;
  owner?: Address;
  status?: ProductStatus;
  type: string;
  name: string;
  description: string;
  creation_date?: Date;
  image: IPFSUri | File;
  external_url: IPFSUri;
  properties: TreeProperties | MerchandiseProperties | ProductProperties;
}
