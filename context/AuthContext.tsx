"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type User = { name: string; email: string; role: Role; password?: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  signup: (userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();


  // ---------- SIGNUP ----------
 const signup = async (userData: User) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Signup failed");
    }

    // Redirect after success
    router.push("/login");
  } catch (error: any) {
    console.error("Signup Error:", error);
    throw new Error(error.message || "Signup failed. Please try again.");
  }
};

  // ---------- LOGIN ----------
  const login = async (email: string, password: string, role: Role) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid credentials");
      }

      const foundUser = result.user;

      setUser({
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      });

      handleRedirect(foundUser.role);
    } catch (error: any) {
      console.error("Login Error:", error);
      throw new Error(error.message || "Failed to login. Please try again.");
    }
  };

  // ---------- REDIRECT ----------
  const handleRedirect = (role: Role) => {
    if (role === "EMPLOYEE") router.push("/employee");
    else if (role === "MANAGER") router.push("/manager");
    else if (role === "ADMIN") router.push("/admin");
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------- HOOK ----------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Provider");
  return context;
};
