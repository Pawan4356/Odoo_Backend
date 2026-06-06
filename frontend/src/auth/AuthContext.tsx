import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthSession, User, VendorProfile } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  vendorProfile: VendorProfile | null;
  vendorProfileComplete: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  setVendorProfile: (profile: VendorProfile) => void;
  markVendorProfileComplete: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "vb.session";
const VENDOR_PROFILE_KEY = "vb.vendorProfile";
const VENDOR_COMPLETE_KEY = "vb.vendorProfileComplete";

const readStored = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
};

const readVendorProfile = (): VendorProfile | null => {
  try {
    const raw = localStorage.getItem(VENDOR_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as VendorProfile) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(readStored);
  const [vendorProfile, setVendorProfileState] = useState<VendorProfile | null>(readVendorProfile);
  const [vendorProfileComplete, setVendorProfileComplete] = useState(
    () => localStorage.getItem(VENDOR_COMPLETE_KEY) === "true",
  );

  const login = (nextSession: AuthSession) => {
    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };
  const logout = () => {
    setSession(null);
    setVendorProfileState(null);
    setVendorProfileComplete(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VENDOR_PROFILE_KEY);
    localStorage.removeItem(VENDOR_COMPLETE_KEY);
  };

  const setVendorProfile = (profile: VendorProfile) => {
    setVendorProfileState(profile);
    setVendorProfileComplete(true);
    localStorage.setItem(VENDOR_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(VENDOR_COMPLETE_KEY, "true");
  };

  const markVendorProfileComplete = () => {
    setVendorProfileComplete(true);
    localStorage.setItem(VENDOR_COMPLETE_KEY, "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        vendorProfile,
        vendorProfileComplete,
        login,
        logout,
        setVendorProfile,
        markVendorProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
