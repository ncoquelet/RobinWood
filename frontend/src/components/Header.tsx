"use client";

import NextLink from "next/link";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <Flex mx={8} my={5}>
      <HStack>
        <Image
          borderRadius="full"
          border="3px solid #8fd14f"
          boxSize="50px"
          objectFit="cover"
          src="/robinwood.png"
          alt="RobinWood"
        />
        <Heading color="#8fd14f" fontFamily='"Bangers variant0", Tofu'>
          RobinWood
        </Heading>
      </HStack>
      <HStack spacing="24px" ml={8}>
        <Link as={NextLink} href="/">
          Home
        </Link>
        <Link as={NextLink} href="/label">
          Labels
        </Link>
        <Link as={NextLink} href="/product">
          Products
        </Link>
      </HStack>
      <Spacer />
      <ConnectButton />
    </Flex>
  );
}
