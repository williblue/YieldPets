"use client";

import { MagicProvider } from "@/contexts/MagicProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { GameProvider } from "@/contexts/GameProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MagicProvider>
      <AuthProvider>
        <GameProvider>{children}</GameProvider>
      </AuthProvider>
    </MagicProvider>
  );
}
