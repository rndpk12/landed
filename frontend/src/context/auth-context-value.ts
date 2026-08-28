import { createContext } from 'react';
import type { LoginCredentials, RegisterPayload } from '../types/auth';
import type { User } from '../types/user';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signInWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  isAuthenticated: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
