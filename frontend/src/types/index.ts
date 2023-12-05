import { LabelStatus } from "@/context/labelContext";
import { IPFSUri } from "@/hooks/useNftStorage";

type LabelProperties = {
  geographic_area: string;
};

export interface Label {
  id?: bigint;
  submitedDate?: Date;
  status?: LabelStatus;
  name: string;
  description: string;
  image: IPFSUri;
  external_url: IPFSUri;
  properties: LabelProperties;
}
