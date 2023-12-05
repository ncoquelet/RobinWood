"use client";

import AddLabel from "@/components/AddLabel";
import DisconnectedCard from "@/components/DisconnectedCard";
import LabelDetails from "@/components/LabelDetails";
import LabelTable from "@/components/LabelTable";
import {
  LabelFormData,
  LabelProvider,
  useLabels,
} from "@/context/labelContext";
import { Label } from "@/types";
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Label() {
  const { address, isDisconnected } = useAccount(); // TODO: Handle isDisconnected and redirects
  const {
    submitedlabels,
    allowedLabels,
    revokedLabels,
    fetchingLabels,
    refreshLabels,
  } = useLabels();

  const [label, setLabel] = useState<Label>();

  const displayLabelDetails = (label: Label) => {
    setLabel(label);
  };

  const clearLabel = () => {
    setLabel(undefined);
  };

  return (
    <div>
      {isDisconnected ? (
        <DisconnectedCard />
      ) : (
        <>
          <HStack spacing={4}>
            <Heading>Labels</Heading>
            <AddLabel />
            <Button colorScheme="teal" variant="link" onClick={refreshLabels}>
              Refresh
            </Button>
          </HStack>
          <LabelTable
            name="Submitted labels"
            labelList={submitedlabels}
            loading={fetchingLabels}
            onRowClick={displayLabelDetails}
          />
          <LabelTable
            name="Allowed labels"
            labelList={allowedLabels}
            loading={fetchingLabels}
            onRowClick={displayLabelDetails}
          />
          <LabelTable
            name="Revoked labels"
            labelList={revokedLabels}
            loading={fetchingLabels}
            onRowClick={displayLabelDetails}
          />
          <LabelDetails label={label} onClose={clearLabel} />
        </>
      )}
    </div>
  );
}
