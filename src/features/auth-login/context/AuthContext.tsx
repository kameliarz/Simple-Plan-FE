import { createContext, useContext, useState, type ReactNode } from "react";

import type { LoginUser } from "../types/auth-login.types";

import { clearAuth, getToken, getUser, saveAuth } from "../services/authStorage";

interface AuthContextValue {
  user: LoginUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    if (savedToken && savedUser) {
      return {
        token: savedToken,
        user: savedUser,
      };
    }

    return {
      token: null,
      user: null,
    };
  });

  const login = (newToken: string, newUser: LoginUser) => {
    saveAuth(newToken, newUser);
    setAuth({
      token: newToken,
      user: newUser,
    });
  };

  const logout = () => {
    clearAuth();
    setAuth({
      token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
