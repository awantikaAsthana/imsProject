import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Login, ChangePassword, VerifyToken, RefreshToken } from "../api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  avatar?: string;
  authToken: string;
  authRefreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER = "auth_user";
const STORAGE_TOKEN = "auth_token";
const STORAGE_REFRESH = "auth_refresh_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER);
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(true);

  // ---------------- STORAGE SYNC ----------------
  const saveUser = (user: User | null) => {
    if (!user) {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_REFRESH);
      setUser(null);
      return;
    }

    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN, user.authToken);
    localStorage.setItem(STORAGE_REFRESH, user.authRefreshToken);

    setUser(user);
  };

  // ---------------- AUTH INIT ----------------
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(STORAGE_TOKEN);
      const refresh = localStorage.getItem(STORAGE_REFRESH);

      if (!token || !refresh) {
        saveUser(null);
        setLoading(false);
        return;
      }

      const verify = await VerifyToken();

      if (verify.success) {
        setLoading(false);
        return;
      }

      const refreshed = await RefreshToken(refresh);

      if (!refreshed.success) {
        saveUser(null);
        setLoading(false);
        return;
      }

      setUser((prev) => {
        if (!prev) return null;

        const updated = {
          ...prev,
          authToken: refreshed.data.access_token,
        };

        localStorage.setItem(STORAGE_TOKEN, updated.authToken);
        localStorage.setItem(STORAGE_USER, JSON.stringify(updated));

        return updated;
      });

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await Login(email, password);

      if (!res?.success) return false;

      const userData = res.data;

      const loggedUser: User = {
        id: userData.user.id,
        name: userData.user.name,
        email,
        role: userData.user.role,
        authToken: userData.access_token,
        authRefreshToken: userData.refresh_token,
      };

      saveUser(loggedUser);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    saveUser(null);
  };

  // ---------------- UPDATE PROFILE ----------------
  const updateProfile = (data: Partial<User>) => {
    if (!user) return;

    const updated = { ...user, ...data };
    saveUser(updated);
  };

  // ---------------- CHANGE PASSWORD ----------------
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      const res = await ChangePassword(currentPassword, newPassword);
      return !!res?.success;
    } catch {
      return false;
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
