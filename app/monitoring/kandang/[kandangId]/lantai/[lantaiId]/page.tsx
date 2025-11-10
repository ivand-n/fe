"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
    if (typeof v.Int64 === "string") return parseFloat(v.Int64) || 0;
    if (typeof v.Float64 === "string") return parseFloat(v.Float64) || 0;
  }
  return 0;
};

export default function LantaiMonitoringPage() {
  const { kandangId, lantaiId } = useParams() as {
    kandangId: string;
    lantaiId: string;
  };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [kandang, setKandang] = useState<any>(null);
  const [lantai, setLantai] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });
  const [selectedMetric, setSelectedMetric] = useState<string>("sisa_ayam");
  const [showInfo, setShowInfo] = useState(false);

  const metricOptions = [
    { value: "sisa_ayam", label: "Sisa Ayam" },
    { value: "deplesi", label: "Deplesi" },
    { value: "deplesi_persen", label: "Deplesi (%)" },
    { value: "dh", label: "Daya Hidup (%)" },
    { value: "bb_ekor", label: "BB/Ekor (Gr)" },
    { value: "gr_ekor_hari", label: "gr/Ekor/Hari" },
    { value: "konsumsi", label: "Konsumsi (Kg)" },
    { value: "cum_pakan", label: "Cum Pakan" },
    { value: "cum_kons_pakan", label: "Cum Konsumsi Pakan" },
    { value: "karung", label: "Karung" },
    { value: "dg", label: "DG (Gr)" },
    { value: "adg_pbbh", label: "ADG / PBBH" },
    { value: "tonase", label: "Tonase (Kg)" },
    { value: "fcr", label: "FCR" },
    { value: "ip", label: "IP" },
    { value: "ep", label: "EP (%)" },
  ];

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ?? localStorage.getItem("token") ?? "";
    const username =
      localStorage.getItem("user_name") ?? localStorage.getItem("name") ?? "";
    const email =
      localStorage.getItem("user_email") ?? localStorage.getItem("email") ?? "";
    const exp = localStorage.getItem("token_expiration");

    setUserInfo({ username, email });

    if (!token || !email || (exp && Date.now() > parseInt(exp, 10))) {
      localStorage.clear();
      router.push("/login");
      return;
    }

    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${kandangId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const kd = res.data;
        setKandang(kd);
        const lant =
          (kd.lantai || []).find(
            (l: AnyObj) =>
              `${l.id}` === lantaiId ||
              `${l.id_lantai}` === lantaiId ||
              `${l.id?.Int64}` === lantaiId
          ) || null;
        setLantai(lant);
      })
      .catch(() => {
        setKandang(null);
        setLantai(null);
      })
      .finally(() => setLoading(false));
  }, [kandangId, lantaiId, router]);

  console.log("data", kandang, lantai);
  const monit = useMemo(
    () =>
      Array.isArray(lantai?.monit)
        ? [...lantai.monit].sort(
            (a: AnyObj, b: AnyObj) => num(a.umur) - num(b.umur)
          )
        : [],
    [lantai]
  );

  const latest = monit.length ? monit[monit.length - 1] : null;

  const chartData = useMemo(() => {
    return {
      labels: monit.map((m: AnyObj) => `Umur ${num(m.umur)}`),
      datasets: [
        {
          label:
            metricOptions.find((m) => m.value === selectedMetric)?.label ||
            selectedMetric,
          data: monit.map((m: AnyObj) => num(m[selectedMetric])),
          borderColor: "rgba(255,125,0,0.9)",
          backgroundColor: "rgba(255,125,0,0.25)",
          tension: 0.25,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [monit, selectedMetric]);

  const summaryCards = [
    {
      label: "Sisa Ayam",
      value: latest ? num(latest.sisa_ayam).toLocaleString("id-ID") : "-",
      color: "bg-emerald-500",
    },
    {
      label: "Deplesi (%)",
      value: latest ? num(latest.deplesi_persen).toFixed(2) : "-",
      color: "bg-red-500",
    },
    {
      label: "FCR",
      value: latest ? num(latest.fcr).toFixed(2) : "-",
      color: "bg-indigo-500",
    },
    {
      label: "IP",
      value: latest ? num(latest.ip).toFixed(0) : "-",
      color: "bg-orange-500",
    },
  ];

  const HandlePanenLantai = (id_lantai: string) => {
    if (confirm("Yakin ingin melakukan panen pada lantai ini?")) {
      try {
        const token =
          localStorage.getItem("auth_token") ?? localStorage.getItem("token");
        if (!token) {
          alert("Token tidak ditemukan. Silakan login kembali.");
          router.push("/login");
          return;
        }
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/csv/${kandangId}/${id_lantai}?token=${token}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Error saat panen lantai:", err);
        alert("Gagal melakukan panen!");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!lantai || !kandang) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600">
            Data lantai tidak ditemukan atau belum ada.
          </p>
          <button
            onClick={() => router.push("/monitoring")}
            className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
          >
            Kembali ke Monitoring
          </button>
        </div>
      </div>
    );
  }

  const isActive =
    kandang.status === 0 ||
    kandang.status?.Int64 === 0 ||
    kandang.status === false;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Kandang {kandang.nama} • Lantai {lantai.no_lantai}
            </h1>
            <p className="text-sm text-gray-500">
              Jenis DOC:{" "}
              <span className="font-medium text-gray-700">
                {lantai.jenis_doc || "-"}
              </span>{" "}
              • Populasi Awal:{" "}
              <span className="font-medium text-gray-700">
                {num(lantai.populasi).toLocaleString("id-ID")}
              </span>{" "}
              • Masuk:{" "}
              <span className="font-medium text-gray-700">
                {lantai.tgl_masuk
                  ? new Date(lantai.tgl_masuk).toLocaleDateString("id-ID")
                  : "-"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActive && (
              <>
                <button
                  onClick={() =>
                    router.push(
                      `/monitoring/form/monit?id_kandang=${kandang.id}&id_lantai=${lantai.id}`
                    )
                  }
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                >
                  + Monitoring
                </button>
                <button
                  onClick={() =>
                    latest &&
                    router.push(
                      `/monitoring/form/penjarangan?id_kandang=${
                        kandang.id
                      }&id_lantai=${lantai.id}&id_monit=${
                        latest.id_monit || latest.id
                      }&umur=${latest.umur}&bbekor=${latest.bb_ekor}`
                    )
                  }
                  disabled={!latest}
                  className={`px-3 py-2 rounded text-xs font-medium ${
                    latest
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  + Penjarangan
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/monitoring/form/ovk?id_kandang=${kandang.id}&id_lantai=${lantai.id}`
                    )
                  }
                  className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                >
                  + OVK
                </button>
                <button
                  onClick={() => HandlePanenLantai(lantaiId)}
                  className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                >
                  Panen Lantai
                </button>
              </>
            )}
            <button
              onClick={() => setShowInfo(true)}
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium"
            >
              Info
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {summaryCards.map((c) => (
            <div
              key={c.label}
              className={`${c.color} rounded-lg shadow p-4 text-white`}
            >
              <p className="text-xs uppercase tracking-wide">{c.label}</p>
              <p className="text-xl font-semibold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { k: "bb_ekor", label: "BB/Ekor (Gr)" },
            { k: "adg_pbbh", label: "ADG/PBBH" },
            { k: "tonase", label: "Tonase (Kg)" },
            { k: "gr_ekor_hari", label: "gr/Ekor/Hari" },
            { k: "cum_kons_pakan", label: "Cum Kons Pakan" },
            { k: "ep", label: "EP (%)" },
          ].map((m) => (
            <div
              key={m.k}
              className="bg-gray-50 border rounded-lg p-3 text-center"
            >
              <p className="text-[11px] text-gray-500">{m.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {latest
                  ? num(latest[m.k]).toFixed(m.k === "tonase" ? 2 : 2)
                  : "-"}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-8 bg-white border rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Tren{" "}
              {metricOptions.find((m) => m.value === selectedMetric)?.label}
            </h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {metricOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-72 p-4">
            {monit.length ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  interaction: { mode: "index", intersect: false },
                  scales: {
                    x: {
                      grid: { color: "rgba(0,0,0,0.06)" },
                      ticks: { color: "#374151" },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.06)" },
                      ticks: { color: "#374151" },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada data monitoring
              </div>
            )}
          </div>
        </div>

        {/* Table Monitoring */}
        <div className="mt-8 bg-white border rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Riwayat Monitoring
            </h2>
          </div>
          <div className="overflow-x-auto">
            {monit.length ? (
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Umur",
                      "Tanggal",
                      "Mati",
                      "Culing",
                      "Deplesi",
                      "Sisa Ayam",
                      "Deplesi (%)",
                      "Daya Hidup (%)",
                      "Konsumsi (Kg)",
                      "Cum Pakan",
                      "gr/Ekor/Hari",
                      "Cum Kons Pakan",
                      "Karung",
                      "Berat/Ekor (Gr)",
                      "DG (Gr)",
                      "ADG/PBBH",
                      "Tonase (Kg)",
                      "FCR",
                      "IP",
                      "EP (%)",
                      isActive ? "Aksi" : "",
                    ].map(
                      (h) =>
                        h && (
                          <th
                            key={h}
                            className="px-2 py-2 border-b font-medium text-[11px] md:text-xs text-left"
                          >
                            {h}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody className="text-black">
                  {monit.map((m: AnyObj, idx: number) => {
                    const isLatest = idx === monit.length - 1;
                    return (
                      <tr
                        key={m.id_monit || m.id || idx}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-2 py-1 border-b">{num(m.umur)}</td>
                        <td className="px-2 py-1 border-b">
                          {m.date
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: "Asia/Jakarta",
                              }).format(new Date(m.date))
                            : "-"}
                        </td>
                        <td className="px-2 py-1 border-b">{num(m.mati)}</td>
                        <td className="px-2 py-1 border-b">{num(m.culing)}</td>
                        <td className="px-2 py-1 border-b">{num(m.deplesi)}</td>
                        <td className="px-2 py-1 border-b">
                          {num(m.sisa_ayam)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.deplesi_persen).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.dh).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.konsumsi)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.cum_pakan)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.gr_ekor_hari).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.cum_kons_pakan).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">{num(m.karung)}</td>
                        <td className="px-2 py-1 border-b">{num(m.bb_ekor)}</td>
                        <td className="px-2 py-1 border-b">{num(m.dg)}</td>
                        <td className="px-2 py-1 border-b">
                          {num(m.adg_pbbh).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.tonase).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.fcr).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.ip).toFixed(0)}
                        </td>
                        <td className="px-2 py-1 border-b">
                          {num(m.ep).toFixed(2)}
                        </td>
                        {isActive && (
                          <td className="px-2 py-1 border-b">
                            {isLatest && monit.length > 1 && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Yakin ingin menghapus monitoring terbaru?"
                                    )
                                  ) {
                                    const token =
                                      localStorage.getItem("auth_token") ??
                                      localStorage.getItem("token");
                                    axios
                                      .delete(
                                        `${
                                          process.env.NEXT_PUBLIC_API_BASE_URL
                                        }/api/data/${lantai.id}/${
                                          m.id_monit || m.id
                                        }`,
                                        {
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                          },
                                        }
                                      )
                                      .then(() =>
                                        router.refresh
                                          ? router.refresh()
                                          : location.reload()
                                      )
                                      .catch(() =>
                                        alert("Gagal menghapus data.")
                                      );
                                  }
                                }}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                Belum ada data monitoring.
              </div>
            )}
          </div>
        </div>

        {/* OVK & Penjarangan (ringkas) */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">
                Data OVK (Obat/Vaksin/Kimia)
              </h3>
            </div>
            <div className="p-4 overflow-x-auto">
              {Array.isArray(lantai.ovk) && lantai.ovk.length > 0 ? (
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-2 py-2 text-left">Tanggal</th>
                      <th className="px-2 py-2 text-left">Nama</th>
                      <th className="px-2 py-2 text-left">Jenis</th>
                      <th className="px-2 py-2 text-left">Dosis</th>
                      {isActive && (
                        <th className="px-2 py-2 text-left">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {lantai.ovk.map((o: AnyObj, i: number) => (
                      <tr key={o.id || i} className="hover:bg-gray-50 text-black">
                        <td className="px-2 py-1">
                          {o.date
                            ? new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "medium",
                              }).format(new Date(o.date))
                            : "-"}
                        </td>
                        <td className="px-2 py-1">{o.nama}</td>
                        <td className="px-2 py-1">{o.jenis}</td>
                        <td className="px-2 py-1">
                          {o.dosis} {o.jenis_dosis}
                        </td>
                        {isActive && (
                          <td className="px-2 py-1 space-x-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/monitoring/form/ovk?id_kandang=${kandang.id}&id_lantai=${lantai.id}&id_ovk=${o.id}`
                                )
                              }
                              className="text-xs text-yellow-600 hover:underline"
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Hapus data OVK ini?")) {
                                  const token =
                                    localStorage.getItem("auth_token") ??
                                    localStorage.getItem("token");
                                  axios
                                    .delete(
                                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${kandang.id}/${o.id}`,
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    )
                                    .then(() =>
                                      router.refresh
                                        ? router.refresh()
                                        : location.reload()
                                    )
                                    .catch(() => alert("Gagal menghapus OVK."));
                                }
                              }}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-xs">Belum ada data OVK.</p>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800 text-sm">
                Data Penjarangan
              </h3>
            </div>
            <div className="p-4 overflow-x-auto">
              {Array.isArray(lantai.penjarangan) &&
              lantai.penjarangan.length > 0 ? (
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="px-2 py-2 text-left">Tanggal</th>
                      <th className="px-2 py-2 text-left">DO</th>
                      <th className="px-2 py-2 text-left">Pembeli</th>
                      <th className="px-2 py-2 text-left">Ekor</th>
                      <th className="px-2 py-2 text-left">Kg</th>
                      <th className="px-2 py-2 text-left">BW</th>
                      <th className="px-2 py-2 text-left">Umur</th>
                      <th className="px-2 py-2 text-left">Rerata Umur</th>
                      {isActive && (
                        <th className="px-2 py-2 text-left">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {lantai.penjarangan.map((p: AnyObj, i: number) => {
                      const umurLatest = latest ? num(latest.umur) : null;
                      const allowDelete = umurLatest === num(p.umur);
                      return (
                        <tr key={p.id || i} className="hover:bg-gray-50 text-black">
                          <td className="px-2 py-1">
                            {p.date
                              ? new Intl.DateTimeFormat("id-ID", {
                                  dateStyle: "medium",
                                }).format(new Date(p.date))
                              : "-"}
                          </td>
                          <td className="px-2 py-1">{p.no}</td>
                          <td className="px-2 py-1">{p.nama}</td>
                          <td className="px-2 py-1">{p.ekor}</td>
                          <td className="px-2 py-1">{p.kg}</td>
                          <td className="px-2 py-1">{p.bw}</td>
                          <td className="px-2 py-1">{p.umur}</td>
                          <td className="px-2 py-1">{p.rerata}</td>
                          {isActive && (
                            <td className="px-2 py-1">
                              {allowDelete && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm("Hapus data penjarangan ini?")
                                    ) {
                                      const token =
                                        localStorage.getItem("auth_token") ??
                                        localStorage.getItem("token");
                                      axios
                                        .delete(
                                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/penjarangan/${lantai.id}/${p.id}`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          }
                                        )
                                        .then(() =>
                                          router.refresh
                                            ? router.refresh()
                                            : location.reload()
                                        )
                                        .catch(() =>
                                          alert(
                                            "Gagal menghapus data penjarangan."
                                          )
                                        );
                                    }
                                  }}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-xs">
                  Belum ada data penjarangan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Keterangan Istilah
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-gray-700">
              <li>
                <span className="font-semibold">Deplesi:</span> Penyusutan
                populasi (mati + culling).
              </li>
              <li>
                <span className="font-semibold">FCR:</span> Efisiensi konversi
                pakan (lebih rendah lebih baik).
              </li>
              <li>
                <span className="font-semibold">IP:</span> Indeks performa
                produksi (target 300–350+).
              </li>
              <li>
                <span className="font-semibold">ADG/PBBH:</span> Pertambahan
                bobot harian (gram).
              </li>
              <li>
                <span className="font-semibold">EP:</span> Efisiensi produksi.
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
