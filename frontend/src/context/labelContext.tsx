"use client";

import { PropsWithChildren, createContext, useContext, useState } from "react";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { Address } from "viem";
import { NFTStorage } from "nft.storage";

// Abis
import labelAbi from "@/abi/Label.json";
import { useAccount } from "wagmi";
import useNftStorage from "@/hooks/useNftStorage";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LABEL as Address;

export type LabelFormData = {
  name: string;
  description: string;
  geoArea: string;
  logo: File;
  document: File;
};

type LabelContextProps = {
  labels: Array<Label>;
  addNewLabel(label: LabelFormData): void;
};

// proposalcontext
const LabelContext = createContext<LabelContextProps>({
  labels: [] as Array<Label>,
  addNewLabel: () => {},
});

export function useLabels() {
  return useContext(LabelContext);
}

export const LabelProvider = ({ children }: PropsWithChildren) => {
  const { address, isDisconnected } = useAccount(); // TODO: Handle isDisconnected and redirects
  const { nftstorage, formatIpfsUri } = useNftStorage();
  // properties
  const [labels, setLabels] = useState<Array<Label>>([]);

  /**
   * send a new proposal in the contract
   * @param description the description
   */
  const addNewLabel = async (label: LabelFormData) => {
    const labelImageCid = await nftstorage.storeBlob(label.logo);
    const labelDocumentCid = await nftstorage.storeBlob(label.document);

    const labelMetadata: Label = {
      name: label.name,
      description: label.description,
      image: formatIpfsUri(labelImageCid),
      external_url: formatIpfsUri(labelDocumentCid),
      properties: {
        geographic_area: label.geoArea,
      },
    };

    // const labelMetadataCid = await nftstorage.storeBlob(
    //   new Blob([JSON.stringify(labelMetadata)])
    // );

    const labelMetadataBase64 =
      " data:application/json;base64," + btoa(JSON.stringify(labelMetadata));

    const { hash } = await writeContract({
      address: contractAddress,
      abi: labelAbi.abi,
      functionName: "submitLabel",
      args: [labelMetadataBase64],
    });
    const data = await waitForTransaction({ hash });
  };

  return (
    <LabelContext.Provider value={{ labels, addNewLabel }}>
      {children}
    </LabelContext.Provider>
  );
};
