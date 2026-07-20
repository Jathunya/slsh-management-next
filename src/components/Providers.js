"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SplashScreen } from "@/components/shared/SplashScreen";

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, retry: 1 },
        },
      })
  );
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  );
}
