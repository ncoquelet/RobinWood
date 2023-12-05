import { CIDString, NFTStorage } from "nft.storage";

const truncateRegex = /^([a-zA-Z0-9]{4})[a-zA-Z0-9]{51}([a-zA-Z0-9]{4}.*)$/;

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

  const truncateCid = (ipfsUri: IPFSUri): string => {
    const cid = ipfsUri.replace("ipfs://", "");

    const match = cid.match(truncateRegex);
    if (!match) return ipfsUri;
    return `${match[1]}…${match[2]}`;
  };

  const nftstorage = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFTSTORAGE_KEY as string,
  });

  return { nftstorage, formatIpfsUri, wrappeWithGateway, truncateCid };
};

export default useNftStorage;
