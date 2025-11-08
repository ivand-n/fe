"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

type AnyObj = any;

const num = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "object") {
    if (typeof v.Int64 === "number") return v.Int64;
    if (typeof v.Float64 === "number") return v.Float64;
    // Beberapa encoder memaparkan {Int64: "123", Valid: true}
    if (typeof v.Int64 === "string") return parseFloat(v.Int64) || 0;
    if (typeof v.Float64 === "string") return parseFloat(v.Float64) || 0;
  }
  return 0;
};

const latestByUmur = (arr: AnyObj[]) =>
  (arr || []).reduce(
    (latest: AnyObj | null, curr: AnyObj) =>
      num(curr?.umur) > num(latest?.umur) ? curr : latest,
    null as AnyObj | null
  );

export default function MonitoringPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Data dari backend
  const [data, setData] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{
    username: string;
    email: string;
    picture: string;
  }>({
    username: "",
    email: "",
    picture: "",
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const [isDeplesiModalOpen, setIsDeplesiModalOpen] = useState(false);
  const [deplesiModalData, setDeplesiModalData] = useState<any[]>([]);
  const [isPersentaseModalOpen, setIsPersentaseModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Selection states
  const [selectedLantai, setSelectedLantai] = useState<number | null>(null);
  const [selectedMonit, setSelectedMonit] = useState<any>(null);
  const [selectedKandang, setSelectedKandang] = useState<number | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ?? localStorage.getItem("token") ?? "";
    const name =
      localStorage.getItem("user_name") ?? localStorage.getItem("name") ?? "";
    const email =
      localStorage.getItem("user_email") ?? localStorage.getItem("email") ?? "";
    const picture =
      localStorage.getItem("user_picture") ??
      localStorage.getItem("picture") ??
      "";
    const tokenExpiration = localStorage.getItem("token_expiration");

    setUserInfo({ username: name, email, picture });

    if (
      !token ||
      (tokenExpiration && Date.now() > parseInt(tokenExpiration, 10)) ||
      !email
    ) {
      localStorage.clear();
      router.push("/login");
      return;
    }

    setIsLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/index?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("API data ->", res.data);
        setData(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching monitoring data:", err);
        setData([]);
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  // Util: total sisa ayam terbaru
    const getTotalSisaAyam = (rows: any[]) =>
      rows.reduce((total, kandang) => {
        const lantaiArr = kandang.lantai || [];
        const totalPerKandang = lantaiArr.reduce(
          (lantaiTotal: number, l: AnyObj) => {
            const monit = Array.isArray(l?.monit) ? l.monit : [];
            if (monit.length === 0) return lantaiTotal + num(l?.populasi);
            const latest = latestByUmur(monit);
            const sisa = num(latest?.sisa_ayam);
            return lantaiTotal + (sisa || num(l?.populasi)); // fallback bila sisa_ayam belum dihitung
          },
          0
        );
        return total + totalPerKandang;
      }, 0);

    const getTotalDeplesi = (rows: any[]) =>
      rows.reduce((total, kandang) => {
        const lantaiArr = kandang.lantai || [];
        const totalPerKandang = lantaiArr.reduce(
          (lantaiTotal: number, l: AnyObj) => {
            const monit = Array.isArray(l?.monit) ? l.monit : [];
            if (monit.length === 0) return lantaiTotal;
            const latest = latestByUmur(monit);
            return lantaiTotal + num(latest?.deplesi);
          },
          0
        );
        return total + totalPerKandang;
      }, 0);

    const getTotalPopulasiAwal = (rows: any[]) =>
      rows.reduce((total, kandang) => {
        const lantaiArr = kandang.lantai || [];
        const totalPerKandang = lantaiArr.reduce(
          (lantaiTotal: number, l: AnyObj) => lantaiTotal + num(l?.populasi),
          0
        );
        return total + totalPerKandang;
      }, 0);

  const filteredData = useMemo(
    () =>
      selectedKandang ? data.filter((k) => k.id === selectedKandang) : data,
    [data, selectedKandang]
  );

  const totalSisaAyam = useMemo(
    () => getTotalSisaAyam(filteredData),
    [filteredData]
  );
  const totalDeplesi = useMemo(
    () => getTotalDeplesi(filteredData),
    [filteredData]
  );
  const totalPopulasiAwal = useMemo(
    () => getTotalPopulasiAwal(filteredData),
    [filteredData]
  );
  const persenSisaAyamHidup =
    totalPopulasiAwal > 0 ? (totalSisaAyam / totalPopulasiAwal) * 100 : 0;

  const getBackgroundColor = (percentage: number) => {
    if (percentage <= 0) return "hsl(0,100%,50%)";
    if (percentage >= 100) return "hsl(120,100%,50%)";
    const hue = Math.round((percentage / 100) * 120); // 0..120
    return `hsl(${hue},100%,50%)`;
  };

  // Chart labels (unique umur, sorted)
  const chartLabels = useMemo(() => {
    const labels = Array.from(
      new Set(
        filteredData.flatMap((k) =>
          (k.lantai || []).flatMap((l: AnyObj) =>
            (l.monit || []).map((m: AnyObj) => num(m.umur))
          )
        )
      )
    )
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
      .map((n) => `Umur ${n}`);
    return labels;
  }, [filteredData]);

  const sisaAyamChartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: filteredData.flatMap((k) =>
        (k.lantai || []).map((l: AnyObj) => ({
          label: `Lantai ${num(l.no_lantai)} - ${k.nama}`,
          data: (l.monit || [])
            .sort((a: AnyObj, b: AnyObj) => num(a.umur) - num(b.umur))
            .map((m: AnyObj) => num(m.sisa_ayam)),
          borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, 1)`,
          backgroundColor: `rgba(${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, 0.2)`,
          fill: false,
          tension: 0.2,
        }))
      ),
    }),
    [chartLabels, filteredData]
  );

  const deplesiChartData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: filteredData.flatMap((k) =>
        (k.lantai || []).map((l: AnyObj) => ({
          label: `Lantai ${num(l.no_lantai)} - ${k.nama}`,
          data: (l.monit || [])
            .sort((a: AnyObj, b: AnyObj) => num(a.umur) - num(b.umur))
            .map((m: AnyObj) => num(m.deplesi)),
          borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, 1)`,
          backgroundColor: `rgba(${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, 0.2)`,
          fill: false,
          tension: 0.2,
        }))
      ),
    }),
    [chartLabels, filteredData]
  );

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  // Handlers
  const handleOpenModal = () => {
    const sisaAyamPerLantai = filteredData.flatMap((k) =>
      (k.lantai || []).map((l: AnyObj) => {
        const latest =
          (l.monit || []).length > 0
            ? (l.monit as AnyObj[]).reduce(
                (latest: AnyObj | null, curr: AnyObj) =>
                  curr.umur.Int64 > (latest?.umur.Int64 || 0) ? curr : latest,
                null
              )
            : null;
        return {
          nama: k.nama,
          lantai: l.no_lantai?.Int64 ?? "Tidak diketahui",
          sisaAyam: latest
            ? latest.sisa_ayam?.Int64 ?? 0
            : l.populasi?.Int64 ?? 0,
        };
      })
    );
    setModalData(sisaAyamPerLantai);
    setIsModalOpen(true);
  };
  const handleOpenDeplesiModal = () => {
    const deplesiPerLantai = filteredData.flatMap((k) =>
      (k.lantai || []).map((l: AnyObj) => {
        const latest =
          (l.monit || []).length > 0
            ? (l.monit as AnyObj[]).reduce(
                (latest: AnyObj | null, curr: AnyObj) =>
                  curr.umur.Int64 > (latest?.umur.Int64 || 0) ? curr : latest,
                null
              )
            : null;
        return {
          nama: k.nama,
          lantai: l.no_lantai?.Int64 ?? "Tidak diketahui",
          deplesi: latest?.deplesi?.Int64 ?? 0,
        };
      })
    );
    setDeplesiModalData(deplesiPerLantai);
    setIsDeplesiModalOpen(true);
  };

  const handleLantaiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lantaiId = parseInt(event.target.value, 10);
    setSelectedLantai(isNaN(lantaiId) ? null : lantaiId);
    const lantai = data
      .flatMap((k: AnyObj) => k.lantai || [])
      .find((l: AnyObj) => l.id?.Int64 === lantaiId);
    if (lantai && (lantai.monit || []).length > 0) {
      const latest = (lantai.monit as AnyObj[]).reduce(
        (latest: AnyObj | null, curr: AnyObj) =>
          curr.umur.Int64 > (latest?.umur.Int64 || 0) ? curr : latest,
        null
      );
      setSelectedMonit(latest);
    } else {
      setSelectedMonit(null);
    }
  };

  const handleKandangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const kandangId = parseInt(event.target.value, 10);
    setSelectedKandang(isNaN(kandangId) ? null : kandangId);
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col md:flex-row bg-white min-h-svh">
        <Sidebar />
        <div className="flex flex-1 md:ml-64 mt-10 container mx-auto p-4">
          <div className="mx-auto bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <p className="mb-4 text-lg text-gray-700">
              Belum ada data kandang.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push("/monitoring/inisiasi")}
            >
              Inisiasi Kandang
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendered with data:", data);
  return (
    <div className="flex flex-col md:flex-row bg-white min-h-svh">
      <Sidebar />
      <div className="container mx-auto p-4">
        <div className="h-20 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">
              Monitoring Chick-A
            </h1>
            <svg
              className="text-blue-400 ml-2 w-7 h-7 cursor-pointer hover:text-blue-700"
              onClick={() => setIsInfoModalOpen(true)}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-black">
              Selamat Datang, {userInfo.username}!
            </h2>
          </div>
        </div>

        {/* Filter Kandang */}
        <div className="mt-8">
          <form className="max-w-sm mx-auto mb-4">
            <label
              htmlFor="kandang"
              className="block mb-2 text-sm font-semibold text-gray-900"
            >
              Pilih Kandang
            </label>
            <select
              id="kandang"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleKandangChange}
              defaultValue=""
            >
              <option value="">Semua Kandang</option>
              {data.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </form>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md">
              <p className="text-xl md:text-2xl font-bold text-black">
                {filteredData.length} Kandang
              </p>
            </div>
            <div
              className="bg-green-500 p-4 rounded-lg shadow-md cursor-pointer"
              onClick={handleOpenModal}
            >
              <h3 className="text-md md:text-lg font-semibold text-black">
                Sisa Ayam
              </h3>
              <p className="text-xl md:text-2xl font-bold text-black">
                {totalSisaAyam} Ekor
              </p>
            </div>
            <div
              className="bg-red-500 p-4 rounded-lg shadow-md cursor-pointer"
              onClick={handleOpenDeplesiModal}
            >
              <h3 className="text-md md:text-lg font-semibold text-black">
                Deplesi
              </h3>
              <p className="text-xl md:text-2xl font-bold text-black">
                {totalDeplesi} Ekor
              </p>
            </div>
            <div
              className="p-4 rounded-lg shadow-md cursor-pointer"
              style={{
                backgroundColor: getBackgroundColor(persenSisaAyamHidup),
              }}
              onClick={() => setIsPersentaseModalOpen(true)}
            >
              <h3 className="text-md md:text-lg font-semibold text-black">
                Presentase Ayam Hidup
              </h3>
              <p className="text-xl md:text-2xl font-bold text-black">
                {persenSisaAyamHidup.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="text-xl font-bold text-black mb-4">
              Grafik Sisa Ayam
            </h2>
            <h2 className="text-xl font-bold text-black mb-4">
              Grafik Deplesi
            </h2>
            <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md mb-8">
              <div className="h-72">
                <Line
                  data={sisaAyamChartData as any}
                  options={chartOptions as any}
                />
              </div>
            </div>
            <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md mb-8">
              <div className="h-72">
                <Line
                  data={deplesiChartData as any}
                  options={chartOptions as any}
                />
              </div>
            </div>
          </div>

          {/* Select Lantai */}
          <form className="max-w-sm mx-auto">
            <label
              htmlFor="lantai"
              className="block mb-2 text-sm font-semibold text-gray-900"
            >
              Pilih Lantai untuk dipantau
            </label>
            <select
              id="lantai"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={handleLantaiChange}
              defaultValue=""
            >
              <option value="">Pilih Lantai</option>
              {data.flatMap((k) =>
                (k.lantai || []).map((l: AnyObj) => (
                  <option key={l.id?.Int64} value={l.id?.Int64}>
                    Lantai {l.no_lantai?.Int64}, kandang {k.nama}
                  </option>
                ))
              )}
            </select>
          </form>

          {/* Spotlight */}
          {selectedMonit ? (
            <div className="container mx-auto mt-4 shadow-md rounded-lg p-4 bg-white">
              <div className="flex items-center text-lg font-semibold text-black mb-4">
                Spotlight Lantai
                <svg
                  className="text-blue-400 ml-2 w-5 h-5 cursor-pointer hover:text-blue-700"
                  onClick={() => setIsInfoModalOpen(true)}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-black">
                <div>
                  <h3 className="text-md font-semibold">IP</h3>
                  <p className="text-sm">{selectedMonit.ip?.Float64}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">FCR</h3>
                  <p className="text-sm">{selectedMonit.fcr?.Float64}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">ADG/PBBH</h3>
                  <p className="text-sm">{selectedMonit.adg_pbbh?.Float64}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">Deplesi</h3>
                  <p className="text-sm">
                    {selectedMonit.deplesi_persen?.Float64}%
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">
                    Konsumsi / Ekor / Hari
                  </h3>
                  <p className="text-sm">
                    {selectedMonit.gr_ekor_hari?.Float64}
                  </p>
                </div>
                <div>
                  <h3 className="text-md font-semibold">
                    Total Konsumsi rata-rata
                  </h3>
                  <p className="text-sm">
                    {selectedMonit.cum_kons_pakan?.Float64}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              Pilih lantai untuk melihat data monit terbaru.
            </p>
          )}
        </div>
      </div>

      {/* Modal Sisa Ayam */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg text-black font-bold mb-4">
              Detail Sisa Ayam per Lantai
            </h2>
            <ul className="space-y-2">
              {modalData.map((item, idx) => (
                <li key={idx} className="flex justify-between text-black">
                  <span>
                    Lantai {item.lantai} {item.nama}
                  </span>
                  <span>{item.sisaAyam} Ekor</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Deplesi */}
      {isDeplesiModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg text-black font-bold mb-4">
              Detail Deplesi per Lantai
            </h2>
            <ul className="space-y-2">
              {deplesiModalData.map((item, idx) => (
                <li key={idx} className="flex text-black justify-between">
                  <span>
                    Lantai {item.lantai} {item.nama}
                  </span>
                  <span>{item.deplesi} Ekor</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsDeplesiModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Persentase */}
      {isPersentaseModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg text-black font-bold mb-4">
              Persentase Ayam Hidup
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-xl text-black font-bold">90%</p>
              <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(108,100%,50%)]" />
              <p className="text-xl text-black font-bold">70%</p>
              <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(84,100%,50%)]" />
              <p className="text-xl text-black font-bold">50%</p>
              <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(60,100%,50%)]" />
            </div>
            <p className="text-xl text-black font-normal mt-2">
              Pertahankan kesehatan ayam kalian yaa
            </p>
            <button
              onClick={() => setIsPersentaseModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Info */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex justify-center items-start md:items-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg text-black font-bold mb-4">Keterangan</h2>
            <div className="grid grid-cols-2 gap-2 text-black">
              <p className="text-sm md:text-md font-semibold">Deplesi</p>
              <p className="text-xs md:text-sm text-justify">
                Deplesi ayam adalah penyusutan populasi karena kematian dan
                culling.
              </p>
              <p className="text-sm md:text-md font-semibold">
                FCR (Feed Conversion Ratio)
              </p>
              <p className="text-xs md:text-sm text-justify">
                Rasio pakan terhadap bobot badan. Semakin rendah FCR semakin
                efisien.
              </p>
              <p className="text-sm md:text-md font-semibold">
                IP (Indeks Performance)
              </p>
              <p className="text-xs md:text-sm text-justify">
                Indeks kinerja produksi. Ideal 300–350, makin tinggi makin baik.
              </p>
              <p className="text-sm md:text-md font-semibold">ADG/PBBH</p>
              <p className="text-xs md:text-sm text-justify">
                Pertambahan berat harian rata-rata; lebih tinggi menandakan
                pertumbuhan optimal.
              </p>
            </div>
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
