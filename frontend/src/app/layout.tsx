"use client";

import { Inter } from "next/font/google";

// Wagmi & RainbowKit
import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectButton,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { hardhat, sepolia, polygonMumbai } from "@wagmi/core/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";

// Styles
import "./globals.css";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";

// Providers
import NotificationProvider from "@/context/NotificationContext";
import { NextIntlClientProvider } from "next-intl";

const inter = Inter({ subsets: ["latin"] });
const timeZone = "Europe/Paris";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { chains, publicClient } = configureChains(
    [sepolia, hardhat, polygonMumbai],
    [
      alchemyProvider({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY as string,
      }),
      publicProvider(),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: "RobinWood",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY as string,
    chains,
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="">
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} modalSize="compact">
              <CacheProvider>
                <ChakraProvider
                  toastOptions={{ defaultOptions: { isClosable: true } }}
                >
                  <NextIntlClientProvider locale="en" timeZone={timeZone}>
                    <main className="">
                      <div className=""></div>
                      <NotificationProvider>{children}</NotificationProvider>
                    </main>
                  </NextIntlClientProvider>
                </ChakraProvider>
              </CacheProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </div>
      </body>
    </html>
  );
}
