"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

type AnyObj = any;

type Kandang = {
  id: number;
  nama: string;
  alamat: string;
  tingkat: number | null;
  status: number | null; // 0=Aktif, 1=Panen
  lantai?: AnyObj[]; // biarkan fleksibel, akan dinormalisasi dengan num()
};

type UserInfo = {
  username: string;
  email: string;
  picture: string;
};

const num = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof v === "object") {
    if (typeof v.Int64 === "number") return v.Int64;
    if (typeof v.Int64 === "string") return parseFloat(v.Int64) || 0;
    if (typeof v.Float64 === "number") return v.Float64;
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

export default function KandangPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: "",
    email: "",
    picture: "",
  });
  const [data, setData] = useState<Kandang[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<string>("");

  // Tampilkan alert dari query
  useEffect(() => {
    const success = searchParams.get("success");
    if (success) {
      setAlertType(success);
      setShowAlert(true);
      const t = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

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
    const exp = localStorage.getItem("token_expiration");

    setUserInfo({ username: name, email, picture });

    if (!token || !email || (exp && Date.now() > parseInt(exp, 10))) {
      localStorage.clear();
      router.push("/login");
      return;
    }

    console.log("Fetching kandang data for email:", email);
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/index?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Pastikan array
        const arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : res.data
          ? [res.data]
          : [];
        setData(arr as Kandang[]);
      })
      .catch((err) => {
        console.error("Fetch /api/index error:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  console.log("Kandang data:", data);
  const totalKandang = data ? data.length : 0;
  const statusLabel = (s: number | null) =>
    num(s) === 0 ? "Aktif" : num(s) === 1 ? "Panen" : "—";
  const statusColor = (s: number | null) =>
    num(s) === 0
      ? "bg-green-500"
      : num(s) === 1
      ? "bg-amber-500"
      : "bg-gray-400";

  const totalLantai = (k: Kandang) => (k.lantai || []).length;

  // Empty / loading states
  if (loading) {
    return (
      <div className="flex flex-col md:flex-row bg-white min-h-svh">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col md:flex-row bg-white min-h-svh">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm text-center">
            <p className="mb-4 text-gray-700 text-sm md:text-base">
              Belum ada data kandang.
            </p>
            <button
              onClick={() => router.push("/monitoring/inisiasi")}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Inisiasi Kandang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-white min-h-svh">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Kandang</h1>
            <p className="text-sm text-gray-600 mt-1">
              Selamat Datang,{" "}
              <span className="font-semibold">{userInfo.username || "-"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/monitoring/inisiasi"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              + Inisiasi Kandang
            </Link>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div
            className={`mt-4 px-4 py-3 rounded shadow text-white text-sm font-medium ${
              alertType === "editkandang"
                ? "bg-yellow-500"
                : alertType === "hapuskandang"
                ? "bg-red-600"
                : "bg-green-600"
            }`}
          >
            {alertType === "editkandang"
              ? "Kandang berhasil diubah."
              : alertType === "hapuskandang"
              ? "Kandang berhasil dihapus."
              : "Kandang berhasil ditambahkan."}
          </div>
        )}

        {/* Summary bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-[11px] uppercase text-gray-500">Total Kandang</p>
            <p className="text-xl font-semibold text-gray-800">
              {totalKandang}
            </p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-[11px] uppercase text-gray-500">Total Lantai</p>
            <p className="text-xl font-semibold text-gray-800">
              {data.reduce((t, k) => t + totalLantai(k), 0)}
            </p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-[11px] uppercase text-gray-500">Kandang Aktif</p>
            <p className="text-xl font-semibold text-gray-800">
              {data.filter((k) => num(k.status) === 0).length}
            </p>
          </div>
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-[11px] uppercase text-gray-500">Kandang Panen</p>
            <p className="text-xl font-semibold text-gray-800">
              {data.filter((k) => num(k.status) === 1).length}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((k) => {
            const floors = (k.lantai || []).map((l: AnyObj, idx: number) => {
              const id =
                l.id_lantai ?? l.id ?? l.id?.Int64 ?? l.ID ?? l.ID?.Int64 ?? 0;
              const labelNum = num(l.no_lantai) || idx + 1;
              const latest = latestByUmur(
                Array.isArray(l.monit) ? l.monit : []
              );
              const sisa = num(latest?.sisa_ayam);
              const fallbackPop = num(l.populasi);
              const count = sisa || fallbackPop || 0;
              return {
                id: num(id),
                label: `Lantai ${labelNum}`,
                count,
              };
            });

            return (
              <div
                key={k.id}
                className="group rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                <div className="h-32 bg-gray-200 relative">
                  <Image
                    src="/1.jpeg"
                    alt="Kandang"
                    fill
                    className="object-cover"
                    sizes="300px"
                    priority={false}
                  />
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium text-white ${statusColor(
                      k.status
                    )}`}
                  >
                    {statusLabel(k.status)}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {k.nama}
                  </h2>
                  <div className="mt-1 text-xs text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Alamat:</span>{" "}
                      {k.alamat || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Tingkat:</span>{" "}
                      {k.tingkat ?? "-"}
                    </p>
                    <p>
                      <span className="font-medium">Total Lantai:</span>{" "}
                      {floors.length}
                    </p>
                  </div>

                  {/* Daftar lantai dalam card (scroll-wrap) */}
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-500 mb-2">Lantai:</p>
                    {floors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {floors.map((f) => (
                          <Link
                            key={f.id}
                            href={`/monitoring/kandang/${k.id}/lantai/${f.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition"
                            title={`${
                              f.label
                            } • Sisa/Populasi: ${f.count.toLocaleString(
                              "id-ID"
                            )}`}
                          >
                            <span className="font-medium">{f.label}</span>
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                              {f.count.toLocaleString("id-ID")}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Belum ada lantai.
                      </div>
                    )}
                  </div>

                  {/* Aksi kandang */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/monitoring/inisiasi?edit=${k.id}`}
                      className="flex-1 min-w-[110px] text-center px-3 py-2 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium"
                    >
                      Ubah Kandang
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Hapus kandang ini?")) {
                          const token =
                            localStorage.getItem("auth_token") ??
                            localStorage.getItem("token");
                          axios
                            .delete(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${k.id}`,
                              { headers: { Authorization: `Bearer ${token}` } }
                            )
                            .then(() =>
                              router.push(
                                "/monitoring/kandang?success=hapuskandang"
                              )
                            )
                            .catch(() => alert("Gagal menghapus kandang."));
                        }
                      }}
                      className="flex-1 min-w-[110px] text-center px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                    >
                      Hapus Kandang
                    </button>
                  </div>

                  {/* Aksi lantai (hanya saat status aktif) */}
                  {num(k.status) === 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/monitoring/form/lantai?tambah=1&id_kandang=${k.id}`}
                        className="flex-1 min-w-[110px] text-center px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                      >
                        Tambah Lantai
                      </Link>
                      <Link
                        href={`/monitoring/form/lantai?ubah=1&id_kandang=${k.id}`}
                        className="flex-1 min-w-[110px] text-center px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                      >
                        Ubah Lantai
                      </Link>
                      <Link
                        href={`/monitoring/form/lantai?hapus=1&id_kandang=${k.id}`}
                        className="flex-1 min-w-[110px] text-center px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                      >
                        Hapus Lantai
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-[11px] text-gray-400">
          Tip: Ketuk badge lantai untuk membuka detail dan monitoring per
          lantai.
        </p>
      </div>
    </div>
  );
}
