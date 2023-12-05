import { LabelStatus, useLabels } from "@/context/labelContext";
import useNftStorage from "@/hooks/useNftStorage";
import { Label } from "@/types";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Image,
  Input,
  Link,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";

interface LabelDetailsParams {
  label?: Label;
  onClose(): void;
}

const LabelDetails: FC<LabelDetailsParams> = ({ label, onClose }) => {
  const toast = useToast();
  const { wrappeWithGateway } = useNftStorage();
  const { isContractOwner, allowRevokeLabel } = useLabels();
  const { isOpen, onOpen, onClose: intClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const clearLabel = () => {
    intClose();
    onClose();
  };

  useEffect(() => {
    if (label) {
      onOpen();
    }
  }, [label]);

  const handleAllowRevokeLabel = async () => {
    setLoading(true);
    try {
      await allowRevokeLabel(label!);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={clearLabel} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <Box style={loading ? { pointerEvents: "none", opacity: 0.4 } : {}}>
          <DrawerCloseButton />
          <DrawerHeader>Label details</DrawerHeader>

          {label && (
            <DrawerBody>
              <FormControl>
                <FormLabel>Label name</FormLabel>
                <Input type="text" value={label.name} readOnly={true} />
              </FormControl>
              <FormControl>
                <FormLabel>Owner</FormLabel>
                <Input value={label.owner} size="sm" readOnly={true} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={label.description} size="sm" readOnly={true} />
              </FormControl>
              <FormControl>
                <FormLabel>Geographical area</FormLabel>
                <Input
                  value={label.properties.geographic_area}
                  readOnly={true}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Logo</FormLabel>
                <Image src={wrappeWithGateway(label.image)} width={150} />
              </FormControl>
              <FormControl>
                <FormLabel>Label Document</FormLabel>
                <Link
                  href={wrappeWithGateway(label.external_url)}
                  isExternal={true}
                >
                  {label.external_url} <ExternalLinkIcon mx="2px" />
                </Link>
              </FormControl>
            </DrawerBody>
          )}

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={clearLabel}>
              Close
            </Button>
            {isContractOwner && (
              <Button
                isLoading={loading}
                loadingText="Allowing"
                colorScheme={
                  label?.status !== LabelStatus.ALLOWED ? "green" : "orange"
                }
                onClick={handleAllowRevokeLabel}
              >
                {label?.status !== LabelStatus.ALLOWED
                  ? "Allow label"
                  : "Revoke label"}
              </Button>
            )}
          </DrawerFooter>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default LabelDetails;
