// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   type ReactNode,
// } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import type { TeamRole } from "@/src/lib/types";
// import {
//   getCurrentUser,
//   setCurrentUser,
//   login as authLogin,
//   register as authRegister,
//   logout as authLogout,
//   type CurrentUser,
// } from "@/src/lib/auth-store";

// interface AuthContextType {
//   user: CurrentUser | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   switchRole: (role: TeamRole) => void;
//   login: (
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; error?: string }>;
//   register: (data: {
//     name: string;
//     email: string;
//     password: string;
//     department: string;
//   }) => Promise<{
//     success: boolean;
//     error?: string;
//   }>;
//   logout: () => void;
//   isAdmin: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<CurrentUser | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     const currentUser = getCurrentUser();
//     setUser(currentUser);
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     if (!isLoading) {
//       const isAuthPage = pathname === "/login" || pathname === "/register";
//       if (!user && !isAuthPage) {
//         router.push("/login");
//       } else if (user && isAuthPage) {
//         router.push("/dashboard");
//       }
//     }
//   }, [user, isLoading, pathname, router]);

//   const handleSwitchRole = (role: TeamRole) => {
//     if (user) {
//       const updated = { ...user, role };
//       setCurrentUser(updated);
//       setUser(updated);
//     }
//   };

//   const handleLogin = async (email: string, password: string) => {
//     const result = authLogin(email, password);
//     if (result.success && result.user) {
//       setUser(result.user);
//       router.push("/dashboard");
//     }
//     return result;
//   };

//   const handleRegister = async (data: {
//     name: string;
//     email: string;
//     password: string;
//     department: string;
//   }) => {
//     const result = authRegister(data);
//     if (result.success && result.user) {
//       setUser(result.user);
//       router.push("/dashboard");
//     }
//     return result;
//   };

//   const handleLogout = () => {
//     authLogout();
//     setUser(null);
//     router.push("/login");
//   };

//   const isAdmin = user?.role === "admin" || user?.role === "manager";
//   const isAuthenticated = !!user;

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         isAuthenticated,
//         switchRole: handleSwitchRole,
//         login: handleLogin,
//         register: handleRegister,
//         logout: handleLogout,
//         isAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }
