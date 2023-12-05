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

// Abis
import labelAbi from "@/abi/Label.json";
import { useAccount, useContractRead, usePublicClient } from "wagmi";
import useNftStorage from "@/hooks/useNftStorage";
import useBase64 from "@/hooks/useBase64";
import { Label } from "@/types";
const labelContractAddress = process.env.NEXT_PUBLIC_CONTRACT_LABEL as Address;
const labelDeliveryContractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_LABELDELIVERY as Address;

export enum LabelStatus {
  SUBMITED = "SUBMITED",
  ALLOWED = "ALLOWED",
  REVOKED = "REVOKED",
}

export type LabelFormData = {
  name: string;
  description: string;
  geoArea: string;
  logo: File;
  document: File;
};

type LabelContextProps = {
  currentLabel?: Label;
  submitedlabels: Array<Label>;
  allowedLabels: Array<Label>;
  revokedLabels: Array<Label>;
  fetchingLabels: boolean;
  isContractOwner: boolean;
  setCurrentLabel(label: Label | undefined): void;
  submitNewLabel(label: LabelFormData): void;
  allowRevokeLabel(label: Label): void;
  refreshLabels(): void;
};

// proposalcontext
const LabelContext = createContext<LabelContextProps>({
  currentLabel: undefined,
  submitedlabels: [] as Array<Label>,
  allowedLabels: [] as Array<Label>,
  revokedLabels: [] as Array<Label>,
  fetchingLabels: false,
  isContractOwner: false,
  setCurrentLabel: () => {},
  submitNewLabel: () => {},
  allowRevokeLabel: () => {},
  refreshLabels: () => {},
});

export function useLabels() {
  return useContext(LabelContext);
}

export const LabelProvider = ({ children }: PropsWithChildren) => {
  // connection + utils
  const publicClient = usePublicClient();
  const { address } = useAccount(); // TODO: Handle isDisconnected and redirects
  const { nftstorage, formatIpfsUri } = useNftStorage();
  const { fromBase64Uri, toBase64Uri } = useBase64();

  // refresh
  const [refresh, setRefresh] = useState(true);
  const [fetchingLabels, setFetchingLabels] = useState(false);

  // properties
  const [currentLabel, setCurrentLabel] = useState<Label>();
  const [submitedlabels, setSubmitedlabels] = useState<Array<Label>>([]);
  const [allowedLabels, setAllowedLabels] = useState<Array<Label>>([]);
  const [revokedLabels, setRevokedLabels] = useState<Array<Label>>([]);

  // contract owner
  const {
    data: owner,
    isLoading: isLoadingOwner,
    refetch,
  } = useContractRead({
    address: labelContractAddress as Address,
    abi: labelAbi.abi,
    functionName: "owner",
  });

  const isContractOwner = address! && address === owner; // Is the current user the owner of the contract ?

  // fetch

  const fetchLabels = async () => {
    setFetchingLabels(true);
    try {
      console.log("fetch Labels");
      const submitedLogs = await publicClient.getLogs({
        address: labelContractAddress,
        event: parseAbiItem(
          "event LabelSubmitted(address indexed owner, uint256 tokenId)"
        ),
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
      });

      const allLabels = await Promise.all(
        submitedLogs.map(async (log) => {
          const metadataUri = (await readContract({
            address: labelContractAddress,
            abi: labelAbi.abi,
            functionName: "tokenURI",
            args: [log.args.tokenId],
          })) as string;
          const block = await publicClient.getBlock({
            blockHash: log.blockHash,
          });
          const metadata = fromBase64Uri(metadataUri) as Label;
          metadata.id = log.args.tokenId;
          metadata.owner = log.args.owner;
          metadata.status = LabelStatus.SUBMITED;
          metadata.submitedDate = new Date(Number(block.timestamp) * 1000);

          return metadata;
        })
      );

      const labelMap = allLabels.reduce(
        (acc, label) => acc.set(label.id!, label),
        new Map<bigint, Label>()
      );

      const allowedLogs = await publicClient.getLogs({
        address: labelContractAddress,
        event: parseAbiItem(
          "event LabelAllowed(uint256 indexed tokenId, bool indexed allowed)"
        ),
        fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
      });

      allowedLogs.forEach((log) => {
        const labelId: bigint = log.args.tokenId as bigint;
        labelMap.get(labelId)!.status = log.args.allowed
          ? LabelStatus.ALLOWED
          : LabelStatus.REVOKED;
      });

      const labelbyStatusMap = allLabels.reduce((acc, label) => {
        if (label.status) {
          const byStatus = acc.get(label.status) || [];
          acc.set(label.status, [...byStatus, label]);
        }
        return acc;
      }, new Map<LabelStatus, Array<Label>>());

      const allowedLabels = labelbyStatusMap.get(LabelStatus.ALLOWED);
      if (allowedLabels) {
        setAllowedLabels(allowedLabels);
      }
      const submitedLabels = labelbyStatusMap.get(LabelStatus.SUBMITED);
      if (submitedLabels) {
        setSubmitedlabels(submitedLabels);
      }
      const revokedLabels = labelbyStatusMap.get(LabelStatus.REVOKED);
      if (revokedLabels) {
        setRevokedLabels(revokedLabels);
      }
    } finally {
      setFetchingLabels(false);
      setRefresh(false);
    }
  };

  const fetchLabelDelivery = () => {};

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
      address: labelContractAddress,
      abi: labelAbi.abi,
      functionName: "submitLabel",
      args: [labelMetadataBase64],
    });
    const data = await waitForTransaction({ hash });
  };

  const allowRevokeLabel = async (label: Label) => {
    const { hash } = await writeContract({
      address: labelContractAddress,
      abi: labelAbi.abi,
      functionName: "allowLabel",
      args: [label.id, label.status !== LabelStatus.ALLOWED],
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
        currentLabel,
        setCurrentLabel,
        submitedlabels,
        allowedLabels,
        revokedLabels,
        fetchingLabels,
        isContractOwner,
        refreshLabels,
        allowRevokeLabel,
        submitNewLabel,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
};
