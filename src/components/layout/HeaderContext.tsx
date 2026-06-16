import React, { createContext, useContext, useState, useEffect } from "react";

export interface HeaderConfig {
  id?: string;
  show: boolean;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
  transparent?: boolean;
}

interface HeaderContextType {
  config: HeaderConfig;
  setConfig: React.Dispatch<React.SetStateAction<HeaderConfig>>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({ show: false });

  return <HeaderContext.Provider value={{ config, setConfig }}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}

export function useHeaderSetup(newConfig: Partial<HeaderConfig>, deps: unknown[] = []) {
  const { setConfig } = useHeader();

  useEffect(() => {
    const configId = Math.random().toString(36).substr(2, 9);

    setConfig({
      id: configId,
      show: true,
      title: newConfig.title,
      subtitle: newConfig.subtitle,
      right: newConfig.right,
      back: newConfig.back ?? false,
      transparent: newConfig.transparent ?? false,
    });

    return () => {
      setConfig((prev) => {
        if (prev.id === configId) {
          return { show: false };
        }
        return prev;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
