import { Spinner } from "@heroui/react";

export function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}
