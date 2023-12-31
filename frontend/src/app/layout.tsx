"use client";

import { Inter } from "next/font/google";

// Wagmi & RainbowKit
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { hardhat, polygonMumbai, sepolia } from "@wagmi/core/chains";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

// Styles
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import "./globals.css";

// Providers
import { LabelProvider } from "@/context/LabelContext";
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
                      <NotificationProvider>
                        <LabelProvider>{children}</LabelProvider>
                      </NotificationProvider>
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
