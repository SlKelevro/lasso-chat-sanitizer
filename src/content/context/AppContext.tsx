import { createContext, useContext } from "react";
import * as React from "react";

type AppContextValue = HTMLElement | ShadowRoot;
interface Props {
  children: React.ReactNode;
  portalRoot: AppContextValue;
}

const AppContext = createContext<AppContextValue | null>(null);

function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useUIContext must be used within AppContext.Provider");
  }

  return context;
}

function AppContextProvider({ portalRoot, children }: Props) {
  return <AppContext.Provider value={portalRoot}>{children}</AppContext.Provider>;
}

export { AppContextProvider, useApp };
