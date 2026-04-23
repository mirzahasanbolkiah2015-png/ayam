"use client";

import { useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  hitungDynamic,
  type BahanPakan,
  type TipeBahan,
} from "@/lib/kalkulatorPakan";
import {
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  FlaskConical,
  Wheat,
  Leaf,
  Info,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const TIPE_OPTIONS: { value: TipeBahan; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "energi",   label: "Energi",   icon: <Wheat className="w-3 h-3" />,       color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "protein",  label: "Protein",  icon: <FlaskConical className="w-3 h-3" />, color: "text-green-600 bg-green-50 border-green-200" },
  { value: "tambahan", label: "Tambahan", icon: <Leaf className="w-3 h-3" />,         color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

const TIPE_COLOR_BAR: Record<TipeBahan, string> = {
  energi:   "bg-amber-400",
  protein:  "bg-green-500",
  tambahan: "bg-emerald-400",
};

// ─── Default bahan ────────────────────────────────────────────────────────────

export const DEFAULT_BAHAN: BahanPakan[] = [
  { id: uid(), nama: "Jagung",  jumlahGram: 30, hargaPerKg: 5000, tipe: "energi" },
  { id: uid(), nama: "Maggot",  jumlahGram: 12, hargaPerKg: 8000, tipe: "protein" },
  { id: uid(), nama: "Dedak",   jumlahGram: 10, hargaPerKg: 3000, tipe: "energi" },
  { id: uid(), nama: "Azolla",  jumlahGram: 2,  hargaPerKg: 2000, tipe: "tambahan" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TipeBadge({ tipe }: { tipe: TipeBahan }) {
  const opt = TIPE_OPTIONS.find((o) => o.value === tipe)!;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${opt.color}`}
    >
      {opt.icon}
      {opt.label}
    </span>
  );
}

function FCRGauge({ fcr, status }: { fcr: number; status: string }) {
  const fcrColor =
    status === "sangat_efisien" ? "#22c55e" : status === "normal" ? "#f59e0b" : "#ef4444";
  const fcrGauge = Math.min((fcr / 3) * 100, 100);
  const fcrLabel =
    status === "sangat_efisien" ? "Sangat Efisien" : status === "normal" ? "Normal" : "Boros – Perlu Evaluasi";

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="h-full bg-green-200" style={{ width: "60%" }} />
          <div className="h-full bg-amber-200" style={{ width: "13%" }} />
          <div className="h-full bg-red-200"   style={{ width: "27%" }} />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 rounded-full shadow"
          style={{ left: `${fcrGauge}%`, backgroundColor: fcrColor, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex w-full justify-between text-[10px] text-muted-foreground">
        <span>0</span><span>1.8</span><span>2.2</span><span>3+</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-bold tabular-nums" style={{ color: fcrColor }}>
          {fcr.toFixed(2)}
        </span>
        <span className="text-xs font-semibold" style={{ color: fcrColor }}>{fcrLabel}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DynamicFeedBuilderProps {
  bahan: BahanPakan[];
  onChange: (bahan: BahanPakan[]) => void;
  jumlahAyam: number;
  umurMinggu: number;
  bobotRataRata: number;
}

export default function DynamicFeedBuilder({
  bahan,
  onChange,
  jumlahAyam,
  umurMinggu,
  bobotRataRata,
}: DynamicFeedBuilderProps) {
  const nameRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const hasil = useMemo(
    () => hitungDynamic(bahan, jumlahAyam, umurMinggu, bobotRataRata),
    [bahan, jumlahAyam, umurMinggu, bobotRataRata]
  );

  // ── Mutation helpers ────────────────────────────────────────────────────────

  function updateBahan(id: string, patch: Partial<BahanPakan>) {
    onChange(bahan.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function addBahan() {
    const newItem: BahanPakan = {
      id: uid(),
      nama: "Bahan Baru",
      jumlahGram: 0,
      hargaPerKg: 0,
      tipe: "tambahan",
    };
    onChange([...bahan, newItem]);
    // focus name field after render
    setTimeout(() => {
      nameRefs.current[newItem.id]?.focus();
      nameRefs.current[newItem.id]?.select();
    }, 50);
  }

  function removeBahan(id: string) {
    onChange(bahan.filter((b) => b.id !== id));
  }

  function resetDefault() {
    onChange(DEFAULT_BAHAN.map((b) => ({ ...b, id: uid() })));
  }

  const sisaMinggu = Math.max(0, 10 - umurMinggu);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* Info bar */}
      <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-2.5">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          Edit nama, jumlah, harga tiap bahan secara bebas.
          Semua hasil dihitung <span className="font-semibold text-primary">real-time</span> — FCR, biaya, dan peringatan otomatis diperbarui.
        </p>
      </div>

      {/* ── Tabel bahan ───────────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Daftar Bahan Pakan
            </CardTitle>
            <button
              onClick={resetDefault}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset default
            </button>
          </div>
          {/* Column headers */}
          <div className="mt-3 grid grid-cols-[1fr_68px_80px_28px] gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
            <span>Bahan</span>
            <span className="text-right">Gram/ekor</span>
            <span className="text-right">Rp/kg</span>
            <span />
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-2 flex flex-col gap-0">
          {bahan.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Belum ada bahan. Tambah bahan di bawah.</p>
            </div>
          )}

          {bahan.map((b, idx) => {
            const persenData = hasil.persenPerBahan.find((p) => p.id === b.id);
            const persen = persenData?.persen ?? 0;
            const biayaHarian = persenData?.biayaHarian ?? 0;
            const barColor = TIPE_COLOR_BAR[b.tipe];

            return (
              <div key={b.id} className="flex flex-col gap-1.5 py-3 border-b border-border last:border-b-0">
                {/* Row 1: inputs */}
                <div className="grid grid-cols-[1fr_68px_80px_28px] gap-1.5 items-center">
                  {/* Nama */}
                  <input
                    ref={(el) => { nameRefs.current[b.id] = el; }}
                    type="text"
                    value={b.nama}
                    onChange={(e) => updateBahan(b.id, { nama: e.target.value })}
                    className="text-sm font-medium text-foreground bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none py-0.5 w-full truncate"
                    placeholder="Nama bahan"
                    maxLength={30}
                  />
                  {/* Gram */}
                  <Input
                    type="number"
                    min={0}
                    value={b.jumlahGram === 0 ? "" : b.jumlahGram}
                    onChange={(e) =>
                      updateBahan(b.id, { jumlahGram: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="h-7 text-xs text-right px-2 tabular-nums"
                    placeholder="0"
                  />
                  {/* Harga */}
                  <Input
                    type="number"
                    min={0}
                    value={b.hargaPerKg === 0 ? "" : b.hargaPerKg}
                    onChange={(e) =>
                      updateBahan(b.id, { hargaPerKg: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="h-7 text-xs text-right px-2 tabular-nums"
                    placeholder="0"
                  />
                  {/* Hapus */}
                  <button
                    onClick={() => removeBahan(b.id)}
                    disabled={bahan.length <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Hapus bahan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Row 2: tipe selector + bar + info */}
                <div className="flex items-center gap-2">
                  {/* Tipe selector */}
                  <div className="flex gap-1">
                    {TIPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateBahan(b.id, { tipe: opt.value })}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-all ${
                          b.tipe === opt.value ? opt.color : "text-muted-foreground bg-muted/50 border-border/50"
                        }`}
                      >
                        {opt.icon}{opt.label}
                      </button>
                    ))}
                    {/* Maggot segar toggle — only when protein */}
                    {b.tipe === "protein" && b.nama.toLowerCase().includes("maggot") && (
                      <button
                        onClick={() => updateBahan(b.id, { isMaggotSegar: !b.isMaggotSegar })}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-all ${
                          b.isMaggotSegar
                            ? "text-blue-600 bg-blue-50 border-blue-200"
                            : "text-muted-foreground bg-muted/50 border-border/50"
                        }`}
                      >
                        {b.isMaggotSegar ? "Segar" : "Kering"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 3: % bar + cost */}
                {b.jumlahGram > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(persen, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground w-10 text-right">
                        {persen.toFixed(1)}%
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground w-16 text-right">
                        {formatRp(biayaHarian * jumlahAyam)}/hr
                      </span>
                    </div>
                    {b.isMaggotSegar && (
                      <p className="text-[10px] text-blue-600">
                        Segar dikonversi ke kering: {(b.jumlahGram / 2.5).toFixed(1)}g efektif
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>

        {/* Tambah bahan */}
        <div className="px-4 pb-4">
          <button
            onClick={addBahan}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Bahan
          </button>
        </div>
      </Card>

      {/* ── Ringkasan Real-time ────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Hasil Real-time
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {jumlahAyam} ekor · Sisa {sisaMinggu} minggu sampai panen
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-4">

          {/* Top stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatBox
              label="Total Pakan/Ekor/Hari"
              value={`${hasil.totalGramPerEkor.toFixed(1)} g`}
              sub={`${(hasil.totalGramSemua / 1000).toFixed(2)} kg total`}
              color="amber"
            />
            <StatBox
              label="Biaya/Ekor/Hari"
              value={formatRp(hasil.biayaPerEkorPerHari)}
              sub={`${formatRp(hasil.biayaSememuaPerHari)} total`}
              color="blue"
            />
            <StatBox
              label="Biaya/kg Pakan"
              value={formatRp(hasil.biayaPerKgPakan)}
              sub="rata-rata tertimbang"
              color="purple"
            />
            <StatBox
              label="Biaya/Ekor Panen"
              value={formatRp(hasil.biayaPerEkorSampaiPanen)}
              sub={formatRp(hasil.totalBiayaSampaiPanen) + " total"}
              color={
                hasil.biayaPerEkorSampaiPanen <= 22000
                  ? "green"
                  : hasil.biayaPerEkorSampaiPanen <= 26000
                  ? "amber"
                  : "red"
              }
            />
          </div>

          {/* Target biaya bar */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Biaya/Ekor vs Target
            </p>
            <BiayaBar label="Sangat Efisien" target={22000} actual={hasil.biayaPerEkorSampaiPanen} color="bg-green-400" />
            <BiayaBar label="Normal"         target={26000} actual={hasil.biayaPerEkorSampaiPanen} color="bg-amber-400" />
            <BiayaBar label="Aktual"         target={hasil.biayaPerEkorSampaiPanen} actual={hasil.biayaPerEkorSampaiPanen}
              color={
                hasil.biayaPerEkorSampaiPanen <= 22000 ? "bg-green-500" :
                hasil.biayaPerEkorSampaiPanen <= 26000 ? "bg-amber-500" : "bg-red-500"
              }
              isActual
            />
          </div>

          {/* FCR */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Feed Conversion Ratio (FCR)
            </p>
            <FCRGauge fcr={hasil.fcr} status={hasil.statusFCR} />
          </div>

          {/* Legenda tipe */}
          <div className="flex gap-2">
            {TIPE_OPTIONS.map((opt) => {
              const total = bahan.filter((b) => b.tipe === opt.value).reduce((s, b) => s + b.jumlahGram, 0);
              const persen = hasil.totalGramPerEkor > 0 ? (total / hasil.totalGramPerEkor) * 100 : 0;
              return (
                <div key={opt.value} className={`flex-1 rounded-lg border px-2 py-2 text-center ${opt.color}`}>
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-sm font-bold tabular-nums">{persen.toFixed(0)}%</p>
                  <p className="text-[10px] opacity-70">{total.toFixed(0)}g</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Peringatan ────────────────────────────────────────────────────────── */}
      {hasil.peringatan.length > 0 && (
        <div className="flex flex-col gap-2">
          {hasil.peringatan.map((msg, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Semua oke */}
      {hasil.peringatan.length === 0 && hasil.totalGramPerEkor > 0 && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3.5 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-800 leading-relaxed font-medium">
            Komposisi ransum terlihat optimal. FCR &amp; protein dalam batas wajar.
          </p>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-start gap-2 px-1">
        <TrendingDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Tip: Coba ganti bahan dengan yang lebih murah lalu bandingkan biaya dan FCR secara langsung untuk menemukan komposisi paling efisien.
        </p>
      </div>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; sub: string }> = {
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  sub: "text-amber-500"  },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  sub: "text-green-500"  },
  red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    sub: "text-red-500"    },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   sub: "text-blue-500"   },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", sub: "text-purple-500" },
};

function StatBox({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.amber;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} px-3 py-2.5 flex flex-col gap-1`}>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
        {label}
      </p>
      <p className={`text-base font-bold tabular-nums leading-tight ${c.text}`}>{value}</p>
      <p className={`text-[10px] ${c.sub} leading-none`}>{sub}</p>
    </div>
  );
}

function BiayaBar({
  label,
  target,
  actual,
  color,
  isActual = false,
}: {
  label: string;
  target: number;
  actual: number;
  color: string;
  isActual?: boolean;
}) {
  const maxVal = Math.max(actual * 1.15, 30000);
  const width = Math.min((target / maxVal) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <span className={isActual ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
        <span className="text-muted-foreground tabular-nums">{formatRp(target)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
