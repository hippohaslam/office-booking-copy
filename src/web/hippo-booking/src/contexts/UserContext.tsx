// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode; initialUser?: User | null }> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<User | null>(initialUser);

  function clearUser() {
    setUser(null);
    sessionStorage.removeItem("user");
  }

  return <UserContext.Provider value={{ user, setUser, clearUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
