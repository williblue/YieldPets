'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative w-screen min-h-[100svh] overflow-hidden">
      {/* Fixed Full-Screen Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: "url('/yieldpets_landing_page.png')",
        }}
      />

      {/* Hero Content - Centered Stack */}
      <div className="w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4">
        {/* Logo with Float Animation */}
        <div className="mb-6 sm:mb-8 animate-float">
          <Image
            src="/yieldpets_logo_transparent.png"
            alt="YieldPets"
            width={500}
            height={250}
            priority
            className="w-72 sm:w-96 md:w-[28rem] h-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-8 sm:mb-10 max-w-md leading-snug">
          A companion that grows with your savings.
        </p>

        {/* CTA Button */}
        <Link href="/mint">
          <button className="group relative px-9 py-3.5 sm:px-11 sm:py-4 bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-blue-300/80">
            <span className="relative z-10 font-nunito btn-text-outline">
              Hatch your pet
            </span>
            {/* Glossy overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-60 pointer-events-none" />
          </button>
        </Link>
      </div>
    </div>
  );
}
