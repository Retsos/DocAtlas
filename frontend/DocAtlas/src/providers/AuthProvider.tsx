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
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

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

const USERS_COLLECTION = "users";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapToAuthUser(input: {
  uid: string;
  email: string | null;
  hospitalName?: string;
  role?: string;
}): AuthUser {
  // Normalize Firebase + Firestore payload into a stable app user model.
  return {
    id: input.uid,
    email: input.email ?? "",
    hospitalName: input.hospitalName ?? "Hospital",
    role: "admin",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

const getToken = useCallback(async () => {
  if (!auth.currentUser) return null;
  // Το true ζητάει force refresh αν χρειάζεται, αλλιώς φέρνει το cached
  return await auth.currentUser.getIdToken(true); 
}, []);


  useEffect(() => {
    // Keep auth state in sync with Firebase session lifecycle.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : null;

      // Enrich auth user with profile data stored in Firestore.
      setUser(
        mapToAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          hospitalName:
            typeof userData?.hospitalName === "string"
              ? userData.hospitalName
              : undefined,
          role: typeof userData?.role === "string" ? userData.role : undefined,
        }),
      );
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async ({ email, password }: LoginInput) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const token = await credentials.user.getIdToken(true);
    console.log("DocAtlas login JWT token:", token);
  }, []);
  const registerHospital = useCallback(
    async ({ hospitalName, email, password }: RegisterHospitalInput) => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Persist organization metadata for later role/scope checks.
      await setDoc(doc(db, USERS_COLLECTION, credentials.user.uid), {
        hospitalName,
        email,
        role: "admin",
        createdAt: serverTimestamp(),
      });
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
      getToken
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
