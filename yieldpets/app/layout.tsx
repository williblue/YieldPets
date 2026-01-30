import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers/AppProvider';
import { TopHUD } from '@/components/layout/TopHUD';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfettiCanvas } from '@/components/ui/Confetti';
import './globals.css';

export const metadata: Metadata = {
  title: 'YieldPets | Grow Your Guardian',
  description: 'A Tamagotchi-style NFT vault guardian that grows with your deposits',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-pastel-sky text-pastel-text antialiased">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <TopHUD />
            <main className="flex-1 container mx-auto px-4 pt-20 pb-24 max-w-lg">
              {children}
            </main>
            <BottomNav />
          </div>
          <ToastContainer />
          <ConfettiCanvas />
        </AppProvider>
      </body>
    </html>
  );
}
