import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YieldPets",
  description: "Your virtual pet room",
};

export const viewport: Viewport = {
  width: 428,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/cloud_bg_mobile.png" />
        <link rel="preload" as="image" href="/Subject.png" />
        <link rel="preload" as="image" href="/iso_room.png" />
        <link rel="preload" as="image" href="/happy_face.png" />
        <link rel="preload" as="image" href="/piggy_bank.png" />
        <link rel="preload" as="image" href="/yieldpets_logo.png" />
        <link rel="preload" as="image" href="/egg_without_bush.png" />
      </head>
      <body className={nunito.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
