type IPFSUri = `ipfs://${string}`;

type LabelProperties = {
  geographic_area: string;
};

type Label = {
  name: string;
  description: string;
  image: IPFSUri;
  external_url: IPFSUri;
  properties: LabelProperties;
};
