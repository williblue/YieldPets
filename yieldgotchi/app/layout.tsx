import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers/AppProvider';
import { TopNav } from '@/components/layout/TopNav';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfettiCanvas } from '@/components/ui/Confetti';
import './globals.css';

export const metadata: Metadata = {
  title: 'YieldGotchi | Grow Your Guardian',
  description: 'A Tamagotchi-style NFT vault guardian that grows with your deposits',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-vault-bg text-white antialiased">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
              {children}
            </main>
            <footer className="border-t border-vault-border py-4 mt-auto">
              <div className="container mx-auto px-4 max-w-6xl">
                <p className="text-center text-vault-muted text-sm">
                  YieldGotchi — Your guardian awaits 🛡️
                </p>
              </div>
            </footer>
          </div>
          <ToastContainer />
          <ConfettiCanvas />
        </AppProvider>
      </body>
    </html>
  );
}
