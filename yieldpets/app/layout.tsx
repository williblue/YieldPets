import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers/AppProvider';
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
          {children}
          <ToastContainer />
          <ConfettiCanvas />
        </AppProvider>
      </body>
    </html>
  );
}
