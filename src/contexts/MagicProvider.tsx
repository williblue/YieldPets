"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type MagicInstance = any;

interface MagicContextValue {
  magic: MagicInstance | null;
}

const MagicContext = createContext<MagicContextValue>({ magic: null });

export function MagicProvider({ children }: { children: ReactNode }) {
  const [magic, setMagic] = useState<MagicInstance | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { Magic } = await import("magic-sdk");
        const { FlowExtension } = await import("@magic-ext/flow");

        const m = new Magic(
          process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "",
          {
            extensions: [
              new FlowExtension({
                rpcUrl:
                  process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE ||
                  "https://rest-mainnet.onflow.org",
                network: (process.env.NEXT_PUBLIC_FLOW_NETWORK ||
                  "mainnet") as "mainnet",
              }),
            ],
          }
        );

        setMagic(m);
      } catch (err) {
        console.error("Failed to initialize Magic:", err);
      }
    })();
  }, []);

  return (
    <MagicContext.Provider value={{ magic }}>{children}</MagicContext.Provider>
  );
}

export function useMagic() {
  return useContext(MagicContext);
}
