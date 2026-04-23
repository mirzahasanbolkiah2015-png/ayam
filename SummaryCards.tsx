"use client";

import { type HasilKalkulator } from "@/lib/kalkulatorPakan";
import {
  Wheat,
  TrendingUp,
  Banknote,
  Activity,
} from "lucide-react";

interface SummaryCardsProps {
  hasil: HasilKalkulator;
}

function formatRp(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryCards({ hasil }: SummaryCardsProps) {
  const fcrColor =
    hasil.statusFCR === "sangat_efisien"
      ? "text-green-600"
      : hasil.statusFCR === "normal"
      ? "text-amber-600"
      : "text-red-500";

  const fcrBg =
    hasil.statusFCR === "sangat_efisien"
      ? "bg-green-50"
      : hasil.statusFCR === "normal"
      ? "bg-amber-50"
      : "bg-red-50";

  const fcrBorder =
    hasil.statusFCR === "sangat_efisien"
      ? "border-green-200"
      : hasil.statusFCR === "normal"
      ? "border-amber-200"
      : "border-red-200";

  const biayaColor =
    hasil.statusBiaya === "efisien"
      ? "text-green-600"
      : hasil.statusBiaya === "normal"
      ? "text-amber-600"
      : "text-red-500";

  const biayaBg =
    hasil.statusBiaya === "efisien"
      ? "bg-green-50"
      : hasil.statusBiaya === "normal"
      ? "bg-amber-50"
      : "bg-red-50";

  const biayaBorder =
    hasil.statusBiaya === "efisien"
      ? "border-green-200"
      : hasil.statusBiaya === "normal"
      ? "border-amber-200"
      : "border-red-200";

  const tumbuhColor =
    hasil.statusPertumbuhan === "ideal"
      ? "text-green-600"
      : hasil.statusPertumbuhan === "lebih"
      ? "text-blue-600"
      : "text-red-500";

  const tumbuhBg =
    hasil.statusPertumbuhan === "ideal"
      ? "bg-green-50"
      : hasil.statusPertumbuhan === "lebih"
      ? "bg-blue-50"
      : "bg-red-50";

  const tumbuhBorder =
    hasil.statusPertumbuhan === "ideal"
      ? "border-green-200"
      : hasil.statusPertumbuhan === "lebih"
      ? "border-blue-200"
      : "border-red-200";

  const cards = [
    {
      icon: <Wheat className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-200",
      label: "Pakan Harian",
      value: `${(hasil.totalPakanHarian / 1000).toFixed(2)} kg`,
      sub: `${hasil.pakanPerEkorPerHari}g/ekor`,
      subColor: "text-amber-600",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      bg: fcrBg,
      border: fcrBorder,
      label: "Nilai FCR",
      value: hasil.fcr.toFixed(2),
      sub:
        hasil.statusFCR === "sangat_efisien"
          ? "Sangat Efisien"
          : hasil.statusFCR === "normal"
          ? "Normal"
          : "Boros",
      subColor: fcrColor,
      iconColor: fcrColor,
    },
    {
      icon: <Banknote className="w-5 h-5" />,
      bg: biayaBg,
      border: biayaBorder,
      label: "Biaya/Ekor",
      value: formatRp(hasil.biayaPerEkorSampaiPanen),
      sub:
        hasil.statusBiaya === "efisien"
          ? "Efisien"
          : hasil.statusBiaya === "normal"
          ? "Normal"
          : "Melebihi Target",
      subColor: biayaColor,
      iconColor: biayaColor,
    },
    {
      icon: <Activity className="w-5 h-5" />,
      bg: tumbuhBg,
      border: tumbuhBorder,
      label: "Pertumbuhan",
      value: `${hasil.selisihBobot > 0 ? "+" : ""}${hasil.selisihBobot}g`,
      sub:
        hasil.statusPertumbuhan === "ideal"
          ? "Sesuai Target"
          : hasil.statusPertumbuhan === "lebih"
          ? "Di Atas Target"
          : "Di Bawah Target",
      subColor: tumbuhColor,
      iconColor: tumbuhColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`rounded-xl border ${card.border} ${card.bg} p-3.5 flex flex-col gap-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </span>
            <span className={card.iconColor ?? ""}>{card.icon}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground tabular-nums leading-none">
              {card.value}
            </p>
            <p className={`text-xs font-medium mt-1 ${card.subColor}`}>
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
