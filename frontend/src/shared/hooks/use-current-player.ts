import { useMemo } from "react";
import { useSession } from "@/features/auth";
import { getGuestIdentity } from "@/shared/lib/guest-identity";

export type CurrentPlayer = {
  id: string;
  name: string;
  isGuest: boolean;
};

export function useCurrentPlayer(): CurrentPlayer | null {
  const session = useSession();
  const guest = session.data ? null : getGuestIdentity();

  return useMemo<CurrentPlayer | null>(() => {
    if (session.data) {
      return {
        id: session.data.id,
        name: session.data.displayName,
        isGuest: false,
      };
    }

    if (guest) {
      return { id: guest.id, name: guest.name, isGuest: true };
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.id, session.data?.displayName, guest?.id, guest?.name]);
}
