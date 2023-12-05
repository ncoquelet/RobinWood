"use client";

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
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import FileUpload from "./UI/FileUpload";
import { useForm } from "react-hook-form";
import { LabelFormData, useLabels } from "@/context/labelContext";

const AddLabel: FC = () => {
  const { addNewLabel } = useLabels();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const firstField = React.useRef<HTMLInputElement>(null);
  const [loading, setloading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LabelFormData>();

  const handleFormSubmit = handleSubmit(async (data) => {
    setloading(true);
    try {
      await addNewLabel(data);
      reset();
      onClose();
    } catch (e) {
      console.log("error " + e);
    } finally {
      setloading(false);
    }
  });

  const beforeOnClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={onOpen}>
        New Label
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={beforeOnClose}
        closeOnOverlayClick={false}
        initialFocusRef={firstField}
        finalFocusRef={btnRef}
        size="xl"
      >
        <DrawerOverlay />
        <DrawerContent>
          <Box style={loading ? { pointerEvents: "none", opacity: 0.4 } : {}}>
            <DrawerCloseButton />
            <DrawerHeader>Submit a new label</DrawerHeader>

            <DrawerBody>
              <form id="new-label-form" onSubmit={handleFormSubmit}>
                <FormControl isRequired>
                  <FormLabel>Label name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter you label name"
                    {...register("name", {
                      required: true,
                    })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Describe your label"
                    size="sm"
                    {...register("description", {
                      required: true,
                    })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Geographical area</FormLabel>
                  <Select
                    placeholder="Select a zone"
                    {...register("geoArea", {
                      required: true,
                    })}
                  >
                    <option value="europe">Europe</option>
                    <option value="world">World</option>
                    <option value="north_america">North America</option>
                    <option value="south_america">South America</option>
                    <option value="asia">Asia</option>
                    <option value="africa">Africa</option>
                  </Select>
                </FormControl>
                <FileUpload
                  name="logo"
                  acceptedFileTypes="image/"
                  placeholder="Select label logo"
                  isRequired={true}
                  control={control}
                >
                  Logo
                </FileUpload>
                <FileUpload
                  name="document"
                  acceptedFileTypes="application/msword, application/pdf"
                  placeholder="Select label document ..."
                  isRequired={true}
                  control={control}
                >
                  Label Document
                </FileUpload>
              </form>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={beforeOnClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                loadingText="Submitting"
                form="new-label-form"
                colorScheme="blue"
              >
                Submit
              </Button>
            </DrawerFooter>
          </Box>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddLabel;
