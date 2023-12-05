"use client";

import AddLabel from "@/components/AddLabel";
import DisconnectedCard from "@/components/DisconnectedCard";
import { LabelProvider } from "@/context/labelContext";
import { Card, CardBody, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Label() {
  const { address, isDisconnected } = useAccount(); // TODO: Handle isDisconnected and redirects

  return (
    <div>
      <LabelProvider>
        {isDisconnected ? (
          <DisconnectedCard />
        ) : (
          <>
            <p>Labels</p>
            <AddLabel />
          </>
        )}
      </LabelProvider>
    </div>
  );
}
