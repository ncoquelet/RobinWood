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
  Input,
  Select,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import FileUpload from "../UI/FileUpload";
import { useForm } from "react-hook-form";
import { ProductFormData, useProducts } from "@/context/ProductContext";
import { useLabels } from "@/context/LabelContext";

const AddProduct: FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const firstField = React.useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>();

  const [loading, setloading] = useState(false);

  const { productorLabels } = useLabels();
  const { mintNewTree } = useProducts();

  const handleFormSubmit = handleSubmit(async (data) => {
    setloading(true);
    try {
      //await mintNewTree(data);
      reset();
      onClose();
    } catch (err) {
      console.log("error " + err);
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
        });
      }
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
        New Product
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
            <DrawerHeader>Mint a new product</DrawerHeader>

            <DrawerBody>
              <form id="new-product-form" onSubmit={handleFormSubmit}>
                <FormControl isRequired>
                  <FormLabel>Product name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter you product name"
                    {...register("name", {
                      required: true,
                    })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Describe your product"
                    size="sm"
                    {...register("description", {
                      required: true,
                    })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select
                    placeholder="Select a product type"
                    {...register("type", {
                      required: true,
                    })}
                  >
                    <option value="tree">Tree</option>
                    <option value="merch">Merchandise</option>
                    <option value="product">Product</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Label</FormLabel>
                  <Select
                    placeholder="Associate a label"
                    {...register("label", {
                      required: false,
                    })}
                  >
                    {productorLabels.map((label) => (
                      <option key={label.id} value={Number(label.id)}>
                        {label.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FileUpload
                  name="logo"
                  acceptedFileTypes="image/*"
                  placeholder="Select product logo"
                  isRequired={true}
                  control={control}
                >
                  Logo
                </FileUpload>
                <FileUpload
                  name="document"
                  acceptedFileTypes="application/msword, application/pdf"
                  placeholder="Select product document ..."
                  isRequired={true}
                  control={control}
                >
                  Product Document
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
                form="new-product-form"
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

export default AddProduct;
