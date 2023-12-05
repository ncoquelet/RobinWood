import { CIDString, NFTStorage } from "nft.storage";

const HTTP_GATEWAY = "https://nftstorage.link/ipfs/";
export type IPFSUri = `ipfs://${string}`;

const useNftStorage = () => {
  const formatIpfsUri = (cid: CIDString, filename?: string): IPFSUri => {
    if (filename) {
      cid = `${cid}/${filename}`;
    }
    return `ipfs://${cid}`;
  };

  const wrappeWithGateway = (ipfsUri: IPFSUri): string => {
    return HTTP_GATEWAY + ipfsUri.replace("ipfs://", "");
  };

  const nftstorage = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFTSTORAGE_KEY as string,
  });

  return { nftstorage, formatIpfsUri, wrappeWithGateway };
};

export default useNftStorage;
