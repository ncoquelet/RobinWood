import {
  Card,
  CardBody,
  CardFooter,
  Center,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function DisconnectedCard() {
  return (
    <Center mt={200}>
      <Card
        maxW="xl"
        direction={{ base: "column", sm: "row" }}
        overflow="hidden"
        variant="outline"
      >
        <Image
          objectFit="cover"
          maxW={{ base: "100%", sm: "200px" }}
          src="/robinwood.png"
          alt="Caffe Latte"
        />

        <Stack>
          <CardBody>
            <Heading size="md">Connection Required</Heading>

            <Text py="2">
              Your wallet is not connected. Please click the button below to
              establish a connection.
            </Text>
          </CardBody>

          <CardFooter>
            <ConnectButton />
          </CardFooter>
        </Stack>
      </Card>
    </Center>
  );
}
