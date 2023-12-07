"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, parseAbiItem } from "viem";
import { useAccount, useContractRead, usePublicClient } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

// hooks
import useBase64 from "@/hooks/useBase64";
import useNftStorage from "@/hooks/useNftStorage";

//types
import { Label } from "@/types";

// Abis
import labelAbi from "@/abi/Label.json";
import labelDeliveryAbi from "@/abi/LabelDelivery.json";
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
  isOwnerLabel: boolean;
  submitedlabels: Array<Label>;
  allowedLabels: Array<Label>;
  revokedLabels: Array<Label>;
  fetchingLabels: boolean;
  isContractOwner: boolean;
  certifiedAddresses: Array<Address>;
  productorLabels: Array<Label>;
  certifyAddress(productor: Address, label: Label): void;
  revokeAddress(productor: Address, label: Label): void;
  setCurrentLabel(label: Label | undefined): void;
  setFilterMyLabel(filter: boolean): void;
  submitNewLabel(label: LabelFormData): void;
  allowRevokeLabel(label: Label): void;
};

// label context
const LabelContext = createContext<LabelContextProps>({
  currentLabel: undefined,
  isOwnerLabel: false,
  submitedlabels: [] as Array<Label>,
  allowedLabels: [] as Array<Label>,
  revokedLabels: [] as Array<Label>,
  fetchingLabels: false,
  isContractOwner: false,
  certifiedAddresses: [] as Array<Address>,
  productorLabels: [] as Array<Label>,
  certifyAddress: () => {},
  revokeAddress: () => {},
  setCurrentLabel: () => {},
  setFilterMyLabel: () => {},
  submitNewLabel: () => {},
  allowRevokeLabel: () => {},
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
  const [fetchingLabels, setFetchingLabels] = useState(false);

  // properties
  const [isOwnerLabel, setIsOwnerLabel] = useState<boolean>(false);
  const [filterMyLabel, setFilterMyLabel] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<Label>();
  const [submitedlabels, setSubmitedlabels] = useState<Array<Label>>([]);
  const [allowedLabels, setAllowedLabels] = useState<Array<Label>>([]);
  const [revokedLabels, setRevokedLabels] = useState<Array<Label>>([]);
  const [productorLabels, setProductorLabels] = useState<Array<Label>>([]);
  const [certifiedAddresses, setCertifiedAddresses] = useState<Array<Address>>(
    []
  );

  // contract owner
  const { data: owner } = useContractRead({
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
          const metadataUri = await readContract({
            address: labelContractAddress,
            abi: labelAbi.abi,
            functionName: "tokenURI",
            args: [log.args.tokenId],
          });
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

      const labelbyStatusMap = allLabels
        .filter((label) => !filterMyLabel || label.owner === address)
        .reduce((acc, label) => {
          if (label.status) {
            const byStatus = acc.get(label.status) || [];
            acc.set(label.status, [...byStatus, label]);
          }
          return acc;
        }, new Map<LabelStatus, Array<Label>>());

      const allowedLabels = labelbyStatusMap.get(LabelStatus.ALLOWED) || [];
      setAllowedLabels(allowedLabels);
      setSubmitedlabels(labelbyStatusMap.get(LabelStatus.SUBMITED) || []);
      setRevokedLabels(labelbyStatusMap.get(LabelStatus.REVOKED) || []);
      // pas le temps je prends des raccourcis
      fetchMyLabels(allowedLabels);
    } finally {
      setFetchingLabels(false);
    }
  };

  const fetchLabelDelivery = async () => {
    console.log("fetch Labels delivery");
    const submitedLogs = await publicClient.getLogs({
      address: labelDeliveryContractAddress,
      event: parseAbiItem(
        "event Certified(address indexed actor, uint256 indexed labelId, bool certified)"
      ),

      fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
    });

    const certifiedAddrs = submitedLogs
      .filter((log) => log.args.labelId === currentLabel?.id)
      .reduce((acc, log) => {
        if (log.args.actor) {
          log.args.certified
            ? acc.set(log.args.actor, true)
            : acc.delete(log.args.actor);
        }
        return acc;
      }, new Map<Address, boolean>())
      .keys();
    setCertifiedAddresses(Array.from(certifiedAddrs));

    const isOwnerOfLabel = await readContract({
      address: labelContractAddress as Address,
      abi: labelAbi.abi,
      functionName: "isAllowed",
      args: [currentLabel?.id, address],
    });

    setIsOwnerLabel(isOwnerOfLabel == true);
  };

  const fetchMyLabels = async (allowedLabels: Array<Label>) => {
    console.log("fetch my labels");
    const submitedLogs = await publicClient.getLogs({
      address: labelDeliveryContractAddress,
      event: parseAbiItem(
        "event Certified(address indexed actor, uint256 indexed labelId, bool certified)"
      ),

      fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_FROM_BLOCK)),
    });

    const myLabelIds = submitedLogs
      .filter((log) => log.args.actor === address)

      .reduce((acc, log) => {
        if (log.args.labelId != undefined) {
          log.args.certified
            ? acc.set(log.args.labelId, true)
            : acc.delete(log.args.labelId);
        }
        return acc;
      }, new Map<bigint, boolean>())
      .keys();

    const labelMap = allowedLabels.reduce(
      (acc, label) => acc.set(label.id!, label),
      new Map<bigint, Label>()
    );

    const myLabels = Array.from(myLabelIds).map((labelId) =>
      labelMap.get(labelId)
    ) as Array<Label>;
    setProductorLabels(myLabels);
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
      address: labelContractAddress,
      abi: labelAbi.abi,
      functionName: "submitLabel",
      args: [labelMetadataBase64],
    });
    const data = await waitForTransaction({ hash });
    fetchLabels();
  };

  const allowRevokeLabel = async (label: Label) => {
    const { hash } = await writeContract({
      address: labelContractAddress,
      abi: labelAbi.abi,
      functionName: "allowLabel",
      args: [label.id, label.status !== LabelStatus.ALLOWED],
    });

    const data = await waitForTransaction({ hash });
    fetchLabels();
  };

  const certifyAddress = async (productor: Address, label: Label) => {
    const { hash } = await writeContract({
      address: labelDeliveryContractAddress,
      abi: labelDeliveryAbi.abi,
      functionName: "certify",
      args: [productor, label.id],
    });

    const data = await waitForTransaction({ hash });
    await fetchLabelDelivery();
  };

  const revokeAddress = async (productor: Address, label: Label) => {
    const { hash } = await writeContract({
      address: labelDeliveryContractAddress,
      abi: labelDeliveryAbi.abi,
      functionName: "revoke",
      args: [productor, label.id],
    });

    const data = await waitForTransaction({ hash });
    await fetchLabelDelivery();
  };

  useEffect(() => {
    fetchLabels();
  }, [filterMyLabel]);

  useEffect(() => {
    if (currentLabel) {
      fetchLabelDelivery();
    }
  }, [currentLabel]);

  return (
    <LabelContext.Provider
      value={{
        currentLabel,
        isOwnerLabel,
        setCurrentLabel,
        setFilterMyLabel,
        submitedlabels,
        allowedLabels,
        revokedLabels,
        fetchingLabels,
        isContractOwner,
        certifiedAddresses,
        productorLabels,
        certifyAddress,
        revokeAddress,
        allowRevokeLabel,
        submitNewLabel,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
};
