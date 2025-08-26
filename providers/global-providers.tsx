"use client";
import { FC } from "react";
import NextTopLoader from "nextjs-toploader";
import AuthProvider from "./auth-provider";
import I18nProvider from "./i18n-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toaster";

interface IProps {
  children: React.ReactNode;
}

const GlobalProvider: FC<IProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <I18nProvider>{children}</I18nProvider>
      </AuthProvider>
      <NextTopLoader color="#2299DD" showSpinner={false} zIndex={1600} />
      <Toaster />
    </ThemeProvider>
  );
};

export default GlobalProvider;
