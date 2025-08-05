"use client";

import React from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { useNotification } from "@/components/ui/notification";

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { notificationElements } = useNotification();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
      <Footer />
      {notificationElements}
    </div>
  );
};