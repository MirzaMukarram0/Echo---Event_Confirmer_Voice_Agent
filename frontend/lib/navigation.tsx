"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ScenarioType } from "./types";

export type View =
  | "overview"
  | `scenario/${ScenarioType}`
  | "monitor"
  | "logs"
  | "settings";

interface NavigationContextType {
  activeView: View;
  setView: (view: View) => void;
  activeCallId: string | null;
  setActiveCallId: (id: string | null) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setViewInternal] = useState<View>("overview");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore active call from localStorage on mount if it exists
  useEffect(() => {
    const savedCallId = localStorage.getItem("active_call_id");
    if (savedCallId) {
      setActiveCallId(savedCallId);
    }
  }, []);

  const setView = (view: View) => {
    setViewInternal(view);
  };

  const handleSetActiveCallId = (id: string | null) => {
    setActiveCallId(id);
    if (id) {
      localStorage.setItem("active_call_id", id);
      setViewInternal("monitor"); // Auto-navigate to live monitor when a call starts
    } else {
      localStorage.removeItem("active_call_id");
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeView,
        setView,
        activeCallId,
        setActiveCallId: handleSetActiveCallId,
        isSidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
