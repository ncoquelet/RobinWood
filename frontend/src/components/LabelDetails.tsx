import useNftStorage from "@/hooks/useNftStorage";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import {
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
} from "@chakra-ui/react";
import React, { FC, useEffect } from "react";

interface LabelDetailsParams {
  label?: Label;
}

const LabelDetails: FC<LabelDetailsParams> = ({ label }) => {
  const { wrappeWithGateway } = useNftStorage();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (label) {
      onOpen();
    }
  }, [label]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Label details</DrawerHeader>

        {label && (
          <DrawerBody>
            <FormControl>
              <FormLabel>Label name</FormLabel>
              <Input type="text" value={label.name} readOnly={true} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea value={label.description} size="sm" readOnly={true} />
            </FormControl>
            <FormControl>
              <FormLabel>Geographical area</FormLabel>
              <Input value={label.properties.geographic_area} readOnly={true} />
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
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LabelDetails;
