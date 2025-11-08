'use client';

import dynamic from "next/dynamic";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const MapClient = dynamic(() => import("./components/MapClient"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <main className="p-8" id="home">
        <div className="mt-10 mb-10 text-6xl text-black text-center">
          Solusi Kemudahan Beternak.
        </div>
        <section className="relative mx-auto w-3/5 h-[60vh] z-10 -mb-80 border-2 border-black rounded-lg overflow-hidden">
          <Image
            src="/1.jpeg"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <p className="mt-4 text-white max-w-2xl text-center">
              Platform untuk memudahkan manajemen ternak dan monitoring.
            </p>
            <div className="mt-6">
              <button className="px-6 py-3 bg-orange-400 text-white rounded-lg shadow-md hover:bg-orange-300">
                Mulai Sekarang
              </button>
            </div>
          </div>
        </section>
        <div className="w-full h-80 bg-orange-400 rounded-lg"></div>

        {/* benefit */}
        <div
          id="produk"
          className="text-black border-t border-gray-300 text-xl hover:underline font-bold mt-40"
        >
          Keunggulan
        </div>
        <div className="mt-10 flex flex-cols-3 gap-40 justify-center items-center">
          <div className="w-60 h-36 bg-white flex flex-col items-center p-4 rounded-lg">
            <img src="/easy.png" alt="" height={50} width={50} />
            <div className="text-black text-md font-bold mt-2">Easy</div>
            <div className="text-black text-sm mt-1">
              Antarmuka yang user-friendly untuk semua kalangan peternak.
            </div>
          </div>
          <div className="w-60 h-36 bg-white flex flex-col items-center p-4 rounded-lg">
            <img src="/accurate.png" alt="" height={50} width={50} />
            <div className="text-black text-md font-bold mt-2">Accurate</div>
            <div className="text-black text-sm mt-1">
              Data akurat untuk pengambilan keputusan yang tepat.
            </div>
          </div>
          <div className="w-60 h-36 bg-white flex flex-col items-center p-4 rounded-lg">
            <img src="/visual.png" alt="" height={50} width={50} />
            <div className="text-black text-md font-bold mt-2">Visual</div>
            <div className="text-black text-sm mt-1">
              Grafik dan laporan visual untuk pemantauan mudah.
            </div>
          </div>
        </div>

        {/* Tentang kami */}
        <div id="tentang-kami" className="mt-40 w-full">
          <div className="mx-auto p-4 h-60 bg-orange-400 rounded-xl">
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-white text-xl font-bold">Tentang Kami</h1>
              <p className="text-white text-md text-justify mt-2 max-w-4xl">
                Chick-A adalah platform inovatif yang dirancang untuk memudahkan
                peternak dalam mengelola dan memantau kesehatan ternak mereka.
                Dengan antarmuka yang user-friendly, data yang akurat, dan
                laporan visual yang informatif, Chick-A membantu peternak
                membuat keputusan yang tepat untuk meningkatkan produktivitas
                dan kesejahteraan ternak mereka. Berawal dari penelitian bersama
                pascasarjana Peternakan, Teknik Elektro, dan Informatika
                Universitas Jenderal Soedirman. Lahirlah inovasi yang terus
                menerus dikembangkan demi kemajuan peternakan di Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* perbandingan produk */}
        <div className="mt-10 bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold text-black text-center mb-6">
            Perbandingan Chick-A dan Chick-A PRO
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse w-full text-left text-black">
              <thead>
                <tr className="bg-white">
                  <th className="border border-white px-4 py-2">Fitur</th>
                  <th className="border border-white px-4 py-2 text-center">
                    Chick-A
                  </th>
                  <th className="border border-white px-4 py-2 text-center">
                    Chick-A PRO
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    no: 1,
                    fitur: "Daily monitoring",
                    chickA: true,
                    chickAPro: true,
                  },
                  {
                    no: 2,
                    fitur: "Otomatisasi Data",
                    chickA: true,
                    chickAPro: true,
                  },
                  {
                    no: 3,
                    fitur: "Kalkulasi hingga panen",
                    chickA: true,
                    chickAPro: true,
                  },
                  {
                    no: 4,
                    fitur: "Export data ke CSV",
                    chickA: true,
                    chickAPro: true,
                  },
                  {
                    no: 5,
                    fitur: "Integrasi Sapronak",
                    chickA: true,
                    chickAPro: true,
                  },
                  {
                    no: 6,
                    fitur: "Monitoring kandang via website",
                    chickA: false,
                    chickAPro: true,
                  },
                  {
                    no: 7,
                    fitur: "Konsultasikan ayam dengan dokter",
                    chickA: false,
                    chickAPro: true,
                  },
                ].map((row, index) => (
                  <tr key={index} className={"bg-white hover:bg-orange-300"}>
                    <td className=" border-white px-4 py-2">{row.fitur}</td>
                    <td className=" border-white px-4 py-2 text-center">
                      {row.chickA ? (
                        <span className="text-green-500 font-bold text-xl">
                          ✔
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-xl">
                          ✘
                        </span>
                      )}
                    </td>
                    <td className=" border-[#b45a00] px-4 py-2 text-center">
                      {row.chickAPro ? (
                        <span className="text-green-500 font-bold text-xl">
                          ✔
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-xl">
                          ✘
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="justify-center items-center flex">
            <a href="https://wa.me/6281222220000" className="mt-6 w-1/2 bg-orange-400 hover:bg-orange-300 p-4 rounded-lg text-center text-white font-bold">
              Hubungi kami
            </a>
          </div>
        </div>

        {/* Kolaborasi */}
        <div className="text-black text-md font-bold text-center underline mt-40">
          Kolaborasi dengan
        </div>
        <div className="w-full mt-10 flex justify-center gap-8">
          <div className="">
            <Image
              src="/teknik.png"
              alt="Logo 1"
              width={75}
              height={75}
              className="object-contain"
            />
          </div>
          <div className="">
            <Image
              src="/fapet.png"
              alt="Logo 2"
              width={150}
              height={75}
              className="object-contain"
            />
          </div>
        </div>

        {/* location */}
        <div className="mt-40 w-full">
          <div className="mx-auto p-4 h-60 bg-orange-400 rounded-xl">
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-white text-xl font-bold">Inovasi Oleh</h1>
              <h1 className="text-white text-2xl font-bold mt-2">
                Tim Inovasi Teknologi Peternakan
              </h1>
              <h1 className="text-white text-xl font-bold mt-2">
                Universitas Jenderal Soedirman
              </h1>
            </div>
          </div>
          <div className="h-24 mx-auto rounded-t-xl flex items-center justify-center">
            <h1 className="text-black text-lg font-bold">Lokasi Chick-A</h1>
          </div>
          <div className="mx-auto p-4 h-[400px] rounded-xl">
            <div className="grid grid-cols-2 gap-4 h-92">
              <MapClient />
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl p-4">
                <h1 className="text-black text-xl font-bold">
                  Chick-A Farm House
                </h1>
                <p className="text-black text-md text-justify mt-2">
                  Chick-A Farm House Fakultas Peternakan Universitas Jenderal
                  Soedirman
                </p>
                <p className="text-black text-md text-justify mt-2">
                  Jl. Raya Jendral Sudirman No.KM 5, Karangwangkal, Kec.
                  Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah 53122
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
// ...existing code...
