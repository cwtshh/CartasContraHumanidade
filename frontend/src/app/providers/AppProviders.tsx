import { queryClient } from "@/shared/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider, toastQueue } from "@heroui/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastProvider queue={toastQueue} placement="top" />
    </QueryClientProvider>
  );
}
