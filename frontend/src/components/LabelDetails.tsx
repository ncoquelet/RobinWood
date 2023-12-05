import useNftStorage from "@/hooks/useNftStorage";
import { Label } from "@/types";
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
  onClose(): void;
}

const LabelDetails: FC<LabelDetailsParams> = ({ label, onClose }) => {
  const { wrappeWithGateway } = useNftStorage();
  const { isOpen, onOpen, onClose: intClose } = useDisclosure();

  const clearLabel = () => {
    intClose();
    onClose();
  };

  useEffect(() => {
    if (label) {
      onOpen();
    }
  }, [label]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={clearLabel} size="xl">
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
          <Button variant="outline" mr={3} onClick={clearLabel}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LabelDetails;
