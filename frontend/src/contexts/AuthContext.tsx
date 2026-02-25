import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Login } from "../api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  avatar?: string;
  authToken: string; // Store the authentication token
  authRefreshToken: string; // Store the refresh token
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_token", user.authToken); // Store token for API calls
      localStorage.setItem("auth_refresh_token", user.authRefreshToken); // Store refresh token
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - accepts any email with password "password"
    const userData = await Login(email, password)
  try{ // Call the mock API function
    if (userData && userData.access_token) {
      console.log(userData)

      const loggedInUser = {
        email,
        name: userData.user.name,
        role: userData.user.role,
        id: userData.user.id,
        authRefreshToken: userData.refresh_token,
        authToken: userData.access_toke
      };
      setUser(loggedInUser);
      return true;
    }}catch(error){
      console.error("Login error:", error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Mock password change - just validate lengths
    if (currentPassword.length >= 6 && newPassword.length >= 6) {
      return true;
    }
    return false;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
