"use client";

import { useAccount } from "wagmi";

import {
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Switch,
} from "@chakra-ui/react";

import DisconnectedCard from "@/components/DisconnectedCard";
import AddLabel from "@/components/labels/AddLabel";
import LabelDetails from "@/components/labels/LabelDetails";
import LabelTable from "@/components/labels/LabelTable";
import { useLabels } from "@/context/LabelContext";

export default function Label() {
  const { isDisconnected } = useAccount();
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
