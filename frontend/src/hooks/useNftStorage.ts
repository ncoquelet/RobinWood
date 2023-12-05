import { CIDString, NFTStorage } from "nft.storage";

const useNftStorage = () => {
  const formatIpfsUri = (cid: CIDString): IPFSUri => {
    return `ipfs://${cid}`;
  };

  const nftstorage = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFTSTORAGE_KEY as string,
  });

  return { nftstorage, formatIpfsUri };
};

export default useNftStorage;
