"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchTransaction,
  readContract,
  waitForTransaction,
  writeContract,
} from "wagmi/actions";
import { Address, parseAbiItem } from "viem";
import { NFTStorage } from "nft.storage";

// Abis
import labelAbi from "@/abi/Label.json";
import { useAccount, usePublicClient } from "wagmi";
import useNftStorage from "@/hooks/useNftStorage";
import useBase64 from "@/hooks/useBase64";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LABEL as Address;

export type LabelFormData = {
  name: string;
  description: string;
  geoArea: string;
  logo: File;
  document: File;
};

type LabelContextProps = {
  submitedlabels: Array<Label>;
  allowedLabels: Array<Label>;
  fetchingLabels: boolean;
  submitNewLabel(label: LabelFormData): void;
  refreshLabels(): void;
};

// proposalcontext
const LabelContext = createContext<LabelContextProps>({
  submitedlabels: [] as Array<Label>,
  allowedLabels: [] as Array<Label>,
  fetchingLabels: false,
  submitNewLabel: () => {},
  refreshLabels: () => {},
});

export function useLabels() {
  return useContext(LabelContext);
}

export const LabelProvider = ({ children }: PropsWithChildren) => {
  // connection + utils
  const publicClient = usePublicClient();
  const { address, isDisconnected } = useAccount(); // TODO: Handle isDisconnected and redirects
  const { nftstorage, formatIpfsUri } = useNftStorage();
  const { fromBase64Uri, toBase64Uri } = useBase64();

  // refresh
  const [refresh, setRefresh] = useState(false);
  const [fetchingLabels, setFetchingLabels] = useState(false);

  // properties
  const [submitedlabels, setSubmitedlabels] = useState<Array<Label>>([]);
  const [allowedLabels, setAllowedLabels] = useState<Array<Label>>([]);

  /**
   *
   */
  const fetchLabels = async () => {
    setFetchingLabels(true);
    try {
      console.log("fetch Labels");
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem(
          "event LabelSubmitted(address indexed owner, uint256 tokenId)"
        ),
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
      });
      setSubmitedlabels(
        await Promise.all(
          logs.map(async (log) => {
            const metadataUri = (await readContract({
              address: contractAddress,
              abi: labelAbi.abi,
              functionName: "tokenURI",
              args: [log.args.tokenId],
            })) as string;
            const block = await publicClient.getBlock({
              blockHash: log.blockHash,
            });
            const metadata = fromBase64Uri(metadataUri) as Label;
            metadata.id = log.args.tokenId;
            metadata.submitedDate = new Date(Number(block.timestamp) * 1000);
            console.log(metadata);

            return metadata;
          })
        )
      );
    } finally {
      setFetchingLabels(false);
      setRefresh(false);
    }
  };

  /**
   * submit a new label
   * @param label
   */
  const submitNewLabel = async (label: LabelFormData) => {
    const directoryCid = await nftstorage.storeDirectory([
      label.logo,
      label.document,
    ]);

    const labelMetadata: Label = {
      name: label.name,
      description: label.description,
      image: formatIpfsUri(directoryCid, label.logo.name),
      external_url: formatIpfsUri(directoryCid, label.document.name),
      properties: {
        geographic_area: label.geoArea,
      },
    };

    // const labelMetadataCid = await nftstorage.storeBlob(
    //   new Blob([JSON.stringify(labelMetadata)])
    // );

    const labelMetadataBase64 =
      "data:application/json;base64," +
      Buffer.from(JSON.stringify(labelMetadata)).toString("base64");

    const { hash } = await writeContract({
      address: contractAddress,
      abi: labelAbi.abi,
      functionName: "submitLabel",
      args: [labelMetadataBase64],
    });
    const data = await waitForTransaction({ hash });
  };

  useEffect(() => {
    if (refresh) {
      fetchLabels();
    }
  }, [refresh]);

  const refreshLabels = () => {
    setRefresh(true);
  };

  return (
    <LabelContext.Provider
      value={{
        submitedlabels,
        allowedLabels,
        fetchingLabels,
        refreshLabels,
        submitNewLabel,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
};
