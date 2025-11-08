'use client'
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { use, useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = () => {
        // Redirect ke backend untuk memulai OAuth2 dengan Google
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Jika token ada, redirect ke halaman monitoring
            router.push("/monitoring");
        }
    }, [router]);
    return (
      <div className="w-full min-h-screen bg-white">
        <Navbar />
        <main className="max-w-4xl h-96 mx-auto px-4 py-8 justify-center flex flex-col">
          <h1 className="text-3xl font-bold mb-4 text-black text-center">
            Masuk Monitoring Chick-A
          </h1>
          <div className="inline-flex justify-center rounded-md bg-green-500 hover:bg-green-600">
            <img src="google.png" alt="Google logo" height={50} width={50} />
            <button onClick={handleLogin} className="text-white py-2 px-4  ">
              Login dengan Google
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
}