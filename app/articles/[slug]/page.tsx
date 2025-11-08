import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";

// Fetch artikel berdasarkan slug
async function getArticle(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/${slug}`;
    console.log("Fetching article from:", url);

    const res = await fetch(url, {
      cache: "no-store",
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      console.error("API response not OK:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log("Article data received:", data);

    return data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <span>Oleh: {article.author || "Admin"}</span>
            <span>•</span>
            <span>
              {new Date(article.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Gambar featured (jika ada) */}
        {article.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Konten artikel */}
        <article className="prose prose-lg max-w-none">
          <div
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        </article>

        {/* Tombol kembali */}
        <div className="mt-12 pt-8 border-t">
          <a
            href="/articles"
            className="inline-flex items-center text-orange-400 hover:text-orange-500 font-semibold"
          >
            ← Kembali ke Artikel
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Generate metadata dinamis untuk SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  return {
    title: `${article.title} - Chick-A`,
    description: article.body.substring(0, 160),
  };
}
