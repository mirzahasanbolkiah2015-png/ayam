"use client";

import { type HasilKalkulator, type InputData } from "@/lib/kalkulatorPakan";
import {
  Bird,
  Wheat,
  TrendingUp,
  Banknote,
  Activity,
  ArrowRight,
  Calculator,
  Scale,
  CalendarDays,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

interface DashboardProps {
  hasil: HasilKalkulator | null;
  inputData: InputData;
  onNavigate: (tab: "input" | "pakan" | "biaya" | "tumbuh" | "builder" | "peringatan") => void;
}

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

function formatRpCompact(v: number) {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
  return formatRp(v);
}

// ─── Stat Badge helper ───────────────────────────────────────────────────────
function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels: Record<string, { text: string; color: string; bg: string }>;
}) {
  const s = labels[status] ?? { text: status, color: "text-muted-foreground", bg: "bg-muted" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.color}`}>
      {s.text}
    </span>
  );
}

// ─── Main stat card ──────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  iconBg,
  valueSub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  iconBg: string;
  valueSub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
          {label}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        {valueSub && <p className="text-xs text-muted-foreground mt-0.5">{valueSub}</p>}
        {sub && <div className="mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Quick action button ─────────────────────────────────────────────────────
function QuickAction({
  label,
  desc,
  icon,
  onClick,
  variant = "default",
}: {
  label: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all active:scale-[0.98] w-full text-left ${
        variant === "primary"
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          variant === "primary" ? "bg-primary-foreground/20" : "bg-muted"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-none ${variant === "primary" ? "text-primary-foreground" : "text-foreground"}`}>
          {label}
        </p>
        <p className={`text-xs mt-0.5 ${variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {desc}
        </p>
      </div>
      <ArrowRight className={`w-4 h-4 flex-shrink-0 ${variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
    </button>
  );
}

// ─── FCR Gauge ───────────────────────────────────────────────────────────────
function FCRGauge({ fcr, status }: { fcr: number; status: "sangat_efisien" | "normal" | "boros" }) {
  // Map FCR 1.0–3.0 to 0–100%
  const pct = Math.min(100, Math.max(0, ((fcr - 1.0) / 2.0) * 100));
  const color =
    status === "sangat_efisien" ? "#16a34a" : status === "normal" ? "#d97706" : "#dc2626";
  const label =
    status === "sangat_efisien" ? "Sangat Efisien" : status === "normal" ? "Normal" : "Boros";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>
          {fcr.toFixed(2)}
        </p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {label}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        {/* Gradient track: green → amber → red */}
        <div className="h-full w-full rounded-full" style={{
          background: "linear-gradient(to right, #16a34a 0%, #d97706 50%, #dc2626 100%)"
        }} />
      </div>
      {/* Needle */}
      <div className="relative h-0">
        <div
          className="absolute -top-4 w-3 h-3 rounded-full border-2 border-card shadow"
          style={{ left: `calc(${pct}% - 6px)`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
        <span>1.0 Efisien</span>
        <span>2.2 Normal</span>
        <span>3.0+ Boros</span>
      </div>
    </div>
  );
}

// ─── Growth status icon ───────────────────────────────────────────────────────
function GrowthIcon({ status }: { status: "ideal" | "lebih" | "kurang" }) {
  if (status === "lebih") return <ChevronUp className="w-4 h-4 text-blue-500" />;
  if (status === "kurang") return <ChevronDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-green-600" />;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard({ hasil, inputData, onNavigate }: DashboardProps) {
  // ── Empty state ────────────────────────────────────────────────────────────
  if (!hasil) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Bird className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Belum Ada Data</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Silakan isi data ternak terlebih dahulu untuk melihat ringkasan peternakan Anda.
          </p>
        </div>
        <button
          onClick={() => onNavigate("input")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm shadow-sm active:scale-95 transition-transform"
        >
          Mulai Input
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Growth status labels ───────────────────────────────────────────────────
  const growthLabels = {
    ideal: { text: "Sesuai Target", color: "text-green-700", bg: "bg-green-100" },
    lebih: { text: "Di Atas Target", color: "text-blue-700", bg: "bg-blue-100" },
    kurang: { text: "Di Bawah Target", color: "text-red-700", bg: "bg-red-100" },
  };

  const fcrLabels = {
    sangat_efisien: { text: "Sangat Efisien", color: "text-green-700", bg: "bg-green-100" },
    normal: { text: "Normal", color: "text-amber-700", bg: "bg-amber-100" },
    boros: { text: "Boros", color: "text-red-700", bg: "bg-red-100" },
  };

  const biayaLabels = {
    efisien: { text: "Efisien", color: "text-green-700", bg: "bg-green-100" },
    normal: { text: "Normal", color: "text-amber-700", bg: "bg-amber-100" },
    mahal: { text: "Melebihi Target", color: "text-red-700", bg: "bg-red-100" },
  };

  const peringatanDanger = hasil.peringatan.filter(
    (p) => p.level === "danger" || p.level === "warning"
  );

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* ── Hero greeting ──────────────────────────────────────────────────── */}
      <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
        <p className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-widest mb-1">
          Ringkasan Peternakan
        </p>
        <h2 className="text-xl font-bold leading-tight">
          {inputData.jumlahAyam} Ekor · Umur {inputData.umurMinggu} Minggu
        </h2>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Bobot rata-rata {inputData.bobotRataRata}g · Pakan {inputData.pakanPerEkorPerHari}g/ekor/hari
        </p>

        {/* Mini FCR strip */}
        <div className="mt-4 bg-primary-foreground/10 rounded-xl p-3">
          <FCRGauge fcr={hasil.fcr} status={hasil.statusFCR} />
        </div>
      </div>

      {/* ── Peringatan banner (if any) ────────────────────────────────────── */}
      {peringatanDanger.length > 0 && (
        <button
          onClick={() => onNavigate("peringatan")}
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 w-full text-left active:scale-[0.98] transition-transform"
        >
          <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-red-600" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700 leading-none">
              {peringatanDanger.length} Peringatan Aktif
            </p>
            <p className="text-xs text-red-500 mt-0.5 truncate">
              {peringatanDanger[0].pesan}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
        </button>
      )}

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Jumlah Ayam */}
        <StatCard
          icon={<Bird className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          label="Jumlah Ayam"
          value={`${inputData.jumlahAyam} ekor`}
          valueSub={`Umur ${inputData.umurMinggu} minggu`}
        />

        {/* Bobot */}
        <StatCard
          icon={<Scale className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-50"
          label="Rata-rata Bobot"
          value={`${inputData.bobotRataRata}g`}
          sub={
            <StatusBadge status={hasil.statusPertumbuhan} labels={growthLabels} />
          }
        />

        {/* Biaya Harian */}
        <StatCard
          icon={<Banknote className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-50"
          label="Biaya Pakan/Hari"
          value={formatRpCompact(hasil.biayaHarianTotal)}
          sub={
            <StatusBadge status={hasil.statusBiaya} labels={biayaLabels} />
          }
        />

        {/* Pertumbuhan */}
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
          label="Status Tumbuh"
          value={`${hasil.selisihBobot > 0 ? "+" : ""}${hasil.selisihBobot}g`}
          valueSub={`Target: ${hasil.targetBobot}g`}
          sub={
            <div className="flex items-center gap-1">
              <GrowthIcon status={hasil.statusPertumbuhan} />
              <StatusBadge status={hasil.statusPertumbuhan} labels={growthLabels} />
            </div>
          }
        />
      </div>

      {/* ── Estimasi sampai panen ─────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Estimasi Sampai Panen
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {Math.max(0, 10 - inputData.umurMinggu)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Minggu lagi</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {(hasil.totalPakanSampaiPanen / 1000).toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">kg pakan total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatRpCompact(hasil.totalBiayaSampaiPanen)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">total biaya</p>
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-0.5">
          Aksi Cepat
        </p>
        <QuickAction
          variant="primary"
          label="Input Data"
          desc="Perbarui data ternak & pakan"
          icon={<Wheat className="w-4 h-4 text-primary" />}
          onClick={() => onNavigate("input")}
        />
        <QuickAction
          label="Lihat FCR"
          desc="Analisa efisiensi pakan"
          icon={<Calculator className="w-4 h-4 text-muted-foreground" />}
          onClick={() => onNavigate("pakan")}
        />
        <QuickAction
          label="Hitung Biaya"
          desc="Rincian biaya pakan lengkap"
          icon={<Banknote className="w-4 h-4 text-muted-foreground" />}
          onClick={() => onNavigate("biaya")}
        />
      </div>
    </div>
  );
}
