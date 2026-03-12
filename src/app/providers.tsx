"use client";

import { FlowProvider } from "@onflow/kit";
import { MagicProvider } from "@/contexts/MagicProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { GameProvider } from "@/contexts/GameProvider";

const flowConfig = {
  accessNodeUrl:
    process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE ||
    "https://rest-mainnet.onflow.org",
  flowNetwork: (process.env.NEXT_PUBLIC_FLOW_NETWORK || "mainnet") as
    | "mainnet"
    | "testnet"
    | "emulator",
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FlowProvider config={flowConfig}>
      <MagicProvider>
        <AuthProvider>
          <GameProvider>{children}</GameProvider>
        </AuthProvider>
      </MagicProvider>
    </FlowProvider>
  );
}
