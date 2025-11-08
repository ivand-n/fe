'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "backdrop-blur bg-white/60 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-3 text-sm items-center h-24">
          <div className="flex items-center gap-2 justify-self-start">
            <span className="font-semibold text-black">Chick-A</span>
          </div>

          <div className="justify-self-center inline-flex space-x-2">
            <a
              href="#home"
              className="px-4 py-2 rounded-md text-black font-bold hover:text-gray-600 focus:outline-none focus:ring-2"
            >
              Home
            </a>
            <a
              href="#produk"
              className="px-4 py-2 rounded-md text-black font-bold hover:text-gray-600 focus:outline-none focus:ring-2"
            >
              Produk
            </a>
            <a
              href="#tentang-kami"
              className="px-4 py-2 rounded-md text-black font-bold hover:text-gray-600 focus:outline-none focus:ring-2"
            >
              Tentang Kami
            </a>
            <Link
              href="/articles"
              className="px-4 py-2 rounded-md text-black font-bold hover:text-gray-600 focus:outline-none focus:ring-2"
            >
              Artikel
            </Link>
          </div>

          <div className="justify-self-end">
            <Link href="/login" className="px-4 py-2 rounded-2xl border bg-orange-400 text-white hover:bg-orange-300">
              Monitoring
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}