const GUEST_ID_KEY = "cch:guest-id";
const GUEST_NAME_KEY = "cch:guest-name";

export type GuestIdentity = {
  id: string;
  name: string;
};

export function getGuestIdentity(): GuestIdentity | null {
  const id = localStorage.getItem(GUEST_ID_KEY);
  const name = localStorage.getItem(GUEST_NAME_KEY);

  if (!id || !name) {
    return null;
  }

  return { id, name };
}

export function setGuestIdentity(name: string): GuestIdentity {
  const id = localStorage.getItem(GUEST_ID_KEY) ?? crypto.randomUUID();

  localStorage.setItem(GUEST_ID_KEY, id);
  localStorage.setItem(GUEST_NAME_KEY, name);

  return { id, name };
}

export function clearGuestIdentity(): void {
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
}
