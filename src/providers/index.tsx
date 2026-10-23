"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

import { persistor, store } from "../redux/store";
import ChatProvider from "../context/chatContext";
import { SocketProvider } from "../context/socketProvider";
import { CallProvider } from "../context/callContext";
import { IsConnectedProvider } from "../context/isConnectProvider";
import AuthCookieHydrator from "../components/providers/authCookieHydrator";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <Provider store={store}>
        <Toaster />
        <IsConnectedProvider>
          <ChatProvider>
            <SocketProvider>
              <CallProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <AuthCookieHydrator />
                  <NextThemesProvider
                    {...themeProps}
                    attribute="class"
                    defaultTheme="system"
                  >
                    {children}
                  </NextThemesProvider>
                </PersistGate>
              </CallProvider>
            </SocketProvider>
          </ChatProvider>
        </IsConnectedProvider>
      </Provider>
    </NextUIProvider>
  );
}
