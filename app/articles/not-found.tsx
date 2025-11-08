import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Artikel tidak ditemukan</p>
        <a
          href="/articles"
          className="inline-block px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
        >
          Kembali ke Artikel
        </a>
      </main>
      <Footer />
    </div>
  );
}
