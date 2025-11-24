"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import axios from "axios";

type FormData = {
  nama: string;
  jenis: string;
  dosis: number | null;
  jenis_dosis: string;
  id_lantai: number | null;
};

function FormOvkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id_kandang = searchParams.get("id_kandang");
  const id_lantai = searchParams.get("id_lantai");
  const id_ovk = searchParams.get("id_ovk");

  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    picture: "",
  });

  const [formData, setFormData] = useState<FormData>({
    nama: "",
    jenis: "",
    dosis: null,
    jenis_dosis: "",
    id_lantai: id_lantai ? parseInt(id_lantai, 10) : null,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Auth check & prefill
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ?? localStorage.getItem("token") ?? "";
    const username =
      localStorage.getItem("user_name") ?? localStorage.getItem("name") ?? "";
    const email =
      localStorage.getItem("user_email") ?? localStorage.getItem("email") ?? "";
    const picture =
      localStorage.getItem("user_picture") ??
      localStorage.getItem("picture") ??
      "";
    const exp = localStorage.getItem("token_expiration");

    setUserInfo({ username, email, picture });

    if (!token || !email || (exp && Date.now() > parseInt(exp, 10))) {
      localStorage.clear();
      router.push("/login");
      return;
    }

    if (!id_lantai) {
      alert("ID lantai tidak ditemukan.");
      router.push("/monitoring");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      id_lantai: parseInt(id_lantai, 10),
    }));

    // Jika mode edit, ambil data OVK
    if (id_ovk) {
      setInitialLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_ovk}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data;
          setFormData({
            nama: data.nama ?? "",
            jenis: data.jenis ?? "",
            dosis: data.dosis ?? null,
            jenis_dosis: data.jenis_dosis ?? "",
            id_lantai: parseInt(id_lantai, 10),
          });
        })
        .catch((err) => {
          console.error("Error fetching OVK:", err);
          alert("Gagal mengambil data OVK.");
        })
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [id_lantai, id_ovk, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "dosis" ? (value === "" ? null : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi
    if (
      !formData.nama ||
      !formData.jenis ||
      !formData.dosis ||
      !formData.jenis_dosis
    ) {
      alert("Semua field harus diisi!");
      return;
    }

    if (!id_kandang || !id_lantai) {
      alert("ID kandang/lantai tidak valid.");
      return;
    }

    const token =
      localStorage.getItem("auth_token") ?? localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ada / kedaluwarsa");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (id_ovk) {
        // Update
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_lantai}/${id_ovk}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Tambah
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_lantai}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      router.push(
        `/monitoring/kandang/${id_kandang}/lantai/${id_lantai}?success=${
          id_ovk ? "editovk" : "tambahovk"
        }`
      );
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(
        error.response?.data?.error || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id_ovk ? "Ubah OVK" : "Tambah OVK"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Lantai: <span className="font-medium">{id_lantai}</span> •
              Kandang: <span className="font-medium">{id_kandang}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Pengguna</p>
            <p className="text-sm font-semibold text-gray-700 truncate">
              {userInfo.username || "-"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 bg-white border rounded-lg shadow p-6 max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nama"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Nama OVK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full rounded border px-3 py-2 text-sm text-black focus:ring-2 focus:ring-orange-400 focus:outline-none"
                required
                placeholder="Contoh: ND Lasota"
              />
            </div>

            <div>
              <label
                htmlFor="jenis"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Jenis OVK <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis"
                value={formData.jenis}
                onChange={handleInputChange}
                className="w-full rounded border px-3 py-2 text-sm text-black focus:ring-2 focus:ring-orange-400 focus:outline-none"
                required
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="Vaksin">Vaksin</option>
                <option value="Obat">Obat</option>
                <option value="Vitamin">Vitamin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dosis"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Dosis <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="dosis"
                value={formData.dosis ?? ""}
                onChange={handleInputChange}
                className="w-full rounded border px-3 py-2 text-sm text-black focus:ring-2 focus:ring-orange-400 focus:outline-none"
                required
                min={0}
                placeholder="Contoh: 500"
              />
            </div>

            <div>
              <label
                htmlFor="jenis_dosis"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Satuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jenis_dosis"
                value={formData.jenis_dosis}
                onChange={handleInputChange}
                className="w-full rounded border px-3 py-2 text-sm text-black focus:ring-2 focus:ring-orange-400 focus:outline-none"
                required
                placeholder="Contoh: ml, gram, ekor"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded text-sm font-medium text-white transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading
                  ? "Menyimpan..."
                  : id_ovk
                  ? "Update OVK"
                  : "Simpan OVK"}
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/monitoring/kandang/${id_kandang}/lantai/${id_lantai}`
                  )
                }
                className="px-5 py-2 rounded text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            💡 Panduan Pengisian:
          </h3>
          <ul className="text-xs text-blue-700 space-y-1 leading-relaxed">
            <li>
              • <strong>Nama OVK:</strong> Sesuai merek/jenis produk (ND, IB,
              Gumboro, dll)
            </li>
            <li>
              • <strong>Jenis:</strong> Pilih Vaksin, Obat, atau Vitamin
            </li>
            <li>
              • <strong>Dosis:</strong> Jumlah yang digunakan (bisa desimal)
            </li>
            <li>
              • <strong>Satuan:</strong> ml, gram, ekor, liter, dll
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function FormOvkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Memuat...</p>
            </div>
          </div>
        </div>
      }
    >
      <FormOvkContent />
    </Suspense>
  );
}
