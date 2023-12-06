import { LabelStatus, useLabels } from "@/context/LabelContext";
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
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Link,
  ListItem,
  Spacer,
  Tag,
  Textarea,
  UnorderedList,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Address } from "viem";

type CertifierFormData = {
  productor: Address;
};

const LabelDetails: FC = () => {
  const toast = useToast();
  const { wrappeWithGateway } = useNftStorage();
  const {
    currentLabel,
    isOwnerLabel,
    isContractOwner,
    certifiedAddresses,
    setCurrentLabel,
    allowRevokeLabel,
    certifyAddress,
    revokeAddress,
  } = useLabels();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    resetField,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CertifierFormData>();

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
      clearLabel();
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

  const handleCertifyAddress = handleSubmit(async (data) => {
    setLoading(true);
    try {
      resetField("productor");
      await certifyAddress(data.productor, currentLabel!);
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
  });

  const handleRevokeAddress = async (productor: Address) => {
    setLoading(true);
    try {
      await revokeAddress(productor, currentLabel!);
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

  const tagColor = () => {
    switch (currentLabel?.status) {
      case LabelStatus.SUBMITED:
        return "gray";
      case LabelStatus.ALLOWED:
        return "green";
      case LabelStatus.REVOKED:
        return "orange";
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={clearLabel} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <Box style={loading ? { pointerEvents: "none", opacity: 0.4 } : {}}>
          <DrawerCloseButton />
          <DrawerHeader>
            Label details{" "}
            <Tag colorScheme={tagColor()}>{currentLabel?.status}</Tag>
          </DrawerHeader>

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
                <>
                  <form id="certify-form" onSubmit={handleCertifyAddress}>
                    <FormControl>
                      <FormLabel>Certified Productors</FormLabel>
                      <UnorderedList maxH={180} overflow={"auto"}>
                        {certifiedAddresses.map((address) => (
                          <ListItem key={address} maxW={500}>
                            <Flex>
                              {address}
                              {isOwnerLabel && (
                                <>
                                  <Spacer />{" "}
                                  <Button
                                    variant="link"
                                    size="xs"
                                    pr={4}
                                    onClick={(e) =>
                                      handleRevokeAddress(address)
                                    }
                                  >
                                    revoke
                                  </Button>
                                </>
                              )}
                            </Flex>
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </FormControl>
                    {isOwnerLabel && (
                      <HStack>
                        <Button
                          type="submit"
                          isLoading={loading}
                          loadingText="Adding"
                          form="certify-form"
                          colorScheme="blue"
                        >
                          Add
                        </Button>
                        <Input
                          type="text"
                          placeholder="Enter productor address"
                          {...register("productor", {
                            required: true,
                          })}
                        />
                      </HStack>
                    )}
                  </form>
                </>
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
