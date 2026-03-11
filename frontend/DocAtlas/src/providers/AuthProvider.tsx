import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { apiClient, getApiErrorMessage } from "@/lib/api";
import { auth } from "@/lib/firebase";

type AuthUser = {
  id: string;
  email: string;
  hospitalName: string;
  role: "admin";
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterHospitalInput = {
  hospitalName: string;
  email: string;
  password: string;
  websiteUrl: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  registerHospital: (input: RegisterHospitalInput) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapToAuthUser(input: {
  id: string;
  email: string;
  hospitalName: string;
  role?: string;
}): AuthUser {
  return {
    id: input.id,
    email: input.email,
    hospitalName: input.hospitalName,
    role: "admin",
  };
}

async function fetchCurrentProfile() {
  const response = await apiClient.get<{
    id: string;
    email: string;
    hospitalName: string;
    role: string;
  }>("/api/me");

  return response.data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await fetchCurrentProfile();
        setUser(
          mapToAuthUser({
            id: profile.id,
            email: profile.email,
            hospitalName: profile.hospitalName,
            role: profile.role,
          }),
        );
      } catch (error) {
        setUser(
          mapToAuthUser({
            id: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            hospitalName: "Hospital",
            role: "admin",
          }),
        );
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async ({ email, password }: LoginInput) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchCurrentProfile();
    setUser(
      mapToAuthUser({
        id: profile.id || credentials.user.uid,
        email: profile.email || credentials.user.email || "",
        hospitalName: profile.hospitalName || "Hospital",
        role: profile.role || "admin",
      }),
    );
  }, []);

  const registerHospital = useCallback(
    async ({ hospitalName, email, password, websiteUrl }: RegisterHospitalInput) => {
      try {
        await apiClient.post("/api/auth/register", {
          hospital_name: hospitalName,
          email,
          password,
          website_url: websiteUrl,
        });
        await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchCurrentProfile();
        setUser(
          mapToAuthUser({
            id: profile.id,
            email: profile.email,
            hospitalName: profile.hospitalName,
            role: profile.role,
          }),
        );
      } catch (error) {
        const message = getApiErrorMessage(error);
        throw new Error(
          message ?? (error instanceof Error ? error.message : "Register failed."),
        );
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      registerHospital,
      logout,
      getToken,
    }),
    [isLoading, login, logout, registerHospital, user, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export type { AuthUser, LoginInput, RegisterHospitalInput };
