"use client";

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

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LabelFormData>();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await addNewLabel(data);
      onClose();
    } catch (e) {
      console.log("error " + e);
    }
  });

  return (
    <>
      <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={onOpen}>
        New Label
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        closeOnOverlayClick={false}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
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
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="new-label-form" colorScheme="blue">
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddLabel;
