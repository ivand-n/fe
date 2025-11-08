import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ...existing code...
// Server Component - fetch data langsung
async function getArticles() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles`,
      {
        cache: "no-store", // atau 'force-cache' untuk caching
      }
    );
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  
  // Ambil 3 artikel terbaru untuk featured
  const featuredArticles = articles.sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-black mb-8">Artikel</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.length > 0 ? (
                articles.map((article: any) => (
                  <article
                    key={article.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-2 text-sm">
                      {new Date(article.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.body?.substring(0, 150)}...
                    </p>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-orange-400 hover:underline"
                    >
                      Baca selengkapnya →
                    </Link>
                  </article>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada artikel tersedia.</p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="p-6 bg-orange-100 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-black">
                  Artikel Terbaru
                </h2>
                <div className="space-y-4">
                  {featuredArticles.length > 0 ? (
                    featuredArticles.map((article: any) => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="block bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-xs mb-2">
                          {new Date(article.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {article.body?.substring(0, 80)}...
                        </p>
                        <span className="text-orange-400 text-sm hover:underline">
                          Baca →
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Belum ada artikel unggulan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}