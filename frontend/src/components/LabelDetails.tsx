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

const LabelDetails: FC = () => {
  const toast = useToast();
  const { wrappeWithGateway } = useNftStorage();
  const { currentLabel, isContractOwner, setCurrentLabel, allowRevokeLabel } =
    useLabels();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const clearLabel = () => {
    setCurrentLabel(undefined);
    onClose();
  };

  useEffect(() => {
    if (currentLabel) {
      onOpen();
    }
  }, [currentLabel]);

  const handleAllowRevokeLabel = async () => {
    setLoading(true);
    try {
      await allowRevokeLabel(currentLabel!);
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

          {currentLabel && (
            <DrawerBody>
              <FormControl>
                <FormLabel>Label name</FormLabel>
                <Input type="text" value={currentLabel.name} readOnly={true} />
              </FormControl>
              <FormControl>
                <FormLabel>Owner</FormLabel>
                <Input value={currentLabel.owner} size="sm" readOnly={true} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={currentLabel.description}
                  size="sm"
                  readOnly={true}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Geographical area</FormLabel>
                <Input
                  value={currentLabel.properties.geographic_area}
                  readOnly={true}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Logo</FormLabel>
                <Image
                  src={wrappeWithGateway(currentLabel.image)}
                  width={150}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Label Document</FormLabel>
                <Link
                  href={wrappeWithGateway(currentLabel.external_url)}
                  isExternal={true}
                >
                  {currentLabel.external_url} <ExternalLinkIcon mx="2px" />
                </Link>
              </FormControl>
              {currentLabel.status === LabelStatus.ALLOWED && (
                <FormControl>
                  <FormLabel>Certified Productors</FormLabel>
                  <Textarea size="sm" readOnly={true}>
                    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
                  </Textarea>
                </FormControl>
              )}
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
                  currentLabel?.status !== LabelStatus.ALLOWED
                    ? "green"
                    : "orange"
                }
                onClick={handleAllowRevokeLabel}
              >
                {currentLabel?.status !== LabelStatus.ALLOWED
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
