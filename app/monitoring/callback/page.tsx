"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const picture = searchParams.get("picture");

    if (token) {
      // Simpan token ke localStorage atau cookie
      const expirationTime = Date.now() + 6 * 60 * 60 * 1000; // 6 jam
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_name", name || "");
        localStorage.setItem("user_email", email || "");
        localStorage.setItem("user_picture", picture || "");
        localStorage.setItem("token_expiration", expirationTime.toString());

      // Redirect ke dashboard/monitoring setelah simpan token
      router.push("/monitoring");
    } else {
      // Jika tidak ada token, redirect ke login
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Memproses login...</p>
      </div>
    </div>
  );
}
