import { ProductTraceabilityType, useProducts } from "@/context/ProductContext";
import useNftStorage from "@/hooks/useNftStorage";
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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useDisclosure,
} from "@chakra-ui/react";
import { FC, useEffect } from "react";

const ProductDetails: FC = () => {
  const { wrappeWithGateway } = useNftStorage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentProduct, productTraceability, setCurrentProduct } =
    useProducts();

  const clearProduct = () => {
    setCurrentProduct(undefined);
    onClose();
  };

  useEffect(() => {
    if (currentProduct) {
      onOpen();
    }
  }, [currentProduct]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={clearProduct} size="xl">
      <DrawerOverlay />
      <DrawerContent>
        <Box>
          <DrawerCloseButton />
          <DrawerHeader>{currentProduct?.name} details</DrawerHeader>

          {currentProduct && (
            <DrawerBody>
              <Stepper
                index={productTraceability.length}
                orientation="vertical"
                gap="0px"
              >
                {productTraceability.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator ml={10 * step.index}>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>

                    <Box flexShrink="0" h={45}>
                      {step.type === ProductTraceabilityType.TRANSPORT && (
                        <>
                          <StepTitle>Tranfered to : {step.owner}</StepTitle>
                          <StepDescription></StepDescription>
                        </>
                      )}
                      {step.type === ProductTraceabilityType.MINTED_FROM && (
                        <>
                          <StepTitle>
                            Created from : {step.from.toString()}
                          </StepTitle>
                          <StepDescription></StepDescription>
                        </>
                      )}
                      {step.type === ProductTraceabilityType.MINTED_WITH && (
                        <>
                          <StepTitle>Created by : {step.owner}</StepTitle>
                          <StepDescription></StepDescription>
                        </>
                      )}
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </DrawerBody>
          )}

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={clearProduct}>
              Close
            </Button>
          </DrawerFooter>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default ProductDetails;
