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
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Switch,
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
    setCurrentLabel,
    setFilterMyLabel,
  } = useLabels();

  return (
    <div>
      {isDisconnected ? (
        <DisconnectedCard />
      ) : (
        <>
          <HStack spacing={4}>
            <Heading>Labels</Heading>
            <AddLabel />
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="filter-owner" mb="0">
                Filter my labels ?
              </FormLabel>
              <Switch
                id="filter-owner"
                onChange={(e) => setFilterMyLabel(e.target.checked)}
              />
            </FormControl>
          </HStack>
          <LabelTable
            name="Submitted labels"
            labelList={submitedlabels}
            loading={fetchingLabels}
            onRowClick={setCurrentLabel}
          />
          <LabelTable
            name="Allowed labels"
            labelList={allowedLabels}
            loading={fetchingLabels}
            onRowClick={setCurrentLabel}
          />
          <LabelTable
            name="Revoked labels"
            labelList={revokedLabels}
            loading={fetchingLabels}
            onRowClick={setCurrentLabel}
          />
          <LabelDetails />
        </>
      )}
    </div>
  );
}
