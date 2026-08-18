export type UserRole = "USER" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};
