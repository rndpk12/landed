export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  role?: string;
  avatarUrl?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}
