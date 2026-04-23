"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HasilKalkulator } from "@/lib/kalkulatorPakan";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PertumbuhanSectionProps {
  hasil: HasilKalkulator;
  umurMinggu: number;
  bobotRataRata: number;
}

const TARGET_PERTUMBUHAN = [
  { minggu: 4, bobot: 300 },
  { minggu: 6, bobot: 600 },
  { minggu: 8, bobot: 900 },
  { minggu: 10, bobot: 1050 },
];

export default function PertumbuhanSection({
  hasil,
  umurMinggu,
  bobotRataRata,
}: PertumbuhanSectionProps) {
  const statusIcon =
    hasil.statusPertumbuhan === "ideal" ? (
      <Minus className="w-5 h-5 text-green-500" />
    ) : hasil.statusPertumbuhan === "lebih" ? (
      <TrendingUp className="w-5 h-5 text-blue-500" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-500" />
    );

  const statusText =
    hasil.statusPertumbuhan === "ideal"
      ? "Pertumbuhan Sesuai Target"
      : hasil.statusPertumbuhan === "lebih"
      ? "Pertumbuhan Di Atas Target"
      : "Pertumbuhan Di Bawah Target";

  const statusColor =
    hasil.statusPertumbuhan === "ideal"
      ? "bg-green-50 border-green-200 text-green-700"
      : hasil.statusPertumbuhan === "lebih"
      ? "bg-blue-50 border-blue-200 text-blue-700"
      : "bg-red-50 border-red-200 text-red-700";

  return (
    <div className="flex flex-col gap-4">
      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${statusColor}`}>
        {statusIcon}
        <div>
          <p className="font-semibold text-sm">{statusText}</p>
          <p className="text-xs opacity-80">
            Bobot saat ini {bobotRataRata}g, target minggu ke-{umurMinggu}:{" "}
            {hasil.bobotIdeal}g
          </p>
        </div>
      </div>

      {/* Bobot saat ini vs ideal */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Bobot Saat Ini vs Target
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-16 rounded-t-lg bg-primary/80"
                  style={{
                    height: `${Math.max(20, (bobotRataRata / 1200) * 100)}px`,
                    minHeight: "20px",
                    maxHeight: "100px",
                  }}
                />
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {bobotRataRata}g
              </span>
              <span className="text-xs text-muted-foreground">Aktual</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-16 rounded-t-lg bg-amber-400/80"
                  style={{
                    height: `${Math.max(20, (hasil.bobotIdeal / 1200) * 100)}px`,
                    minHeight: "20px",
                    maxHeight: "100px",
                  }}
                />
              </div>
              <span className="text-sm font-bold text-amber-600 tabular-nums">
                {hasil.bobotIdeal}g
              </span>
              <span className="text-xs text-muted-foreground">Target</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="h-[100px] flex items-end justify-center w-full pb-0">
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    hasil.selisihBobot > 0
                      ? "text-blue-500"
                      : hasil.selisihBobot === 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {hasil.selisihBobot > 0 ? "+" : ""}
                  {hasil.selisihBobot}g
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Selisih</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Target Pertumbuhan */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Standar Target Pertumbuhan KUB
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-border">
            <div className="grid grid-cols-3 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Umur</span>
              <span className="text-center">Target</span>
              <span className="text-right">Status</span>
            </div>
            {TARGET_PERTUMBUHAN.map((t) => {
              const isCurrent = umurMinggu <= t.minggu &&
                (t.minggu === TARGET_PERTUMBUHAN[0].minggu ||
                  umurMinggu > TARGET_PERTUMBUHAN[TARGET_PERTUMBUHAN.indexOf(t) - 1]?.minggu);
              const isActive = t.minggu === Math.ceil(umurMinggu / 2) * 2 || 
                (umurMinggu <= 4 && t.minggu === 4) ||
                (umurMinggu > 4 && umurMinggu <= 6 && t.minggu === 6) ||
                (umurMinggu > 6 && umurMinggu <= 8 && t.minggu === 8) ||
                (umurMinggu > 8 && t.minggu === 10);
              
              return (
                <div
                  key={t.minggu}
                  className={`grid grid-cols-3 px-4 py-3 border-t border-border text-sm ${
                    isActive ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <span className="text-foreground">
                    Minggu {t.minggu}
                    {isActive && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded px-1">
                        aktif
                      </span>
                    )}
                  </span>
                  <span className="text-center text-muted-foreground tabular-nums">
                    {t.bobot === 1050 ? "1.000–1.100g" : `${t.bobot}g`}
                  </span>
                  <div className="flex justify-end">
                    {isActive ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          hasil.statusPertumbuhan === "ideal"
                            ? "bg-green-100 text-green-600"
                            : hasil.statusPertumbuhan === "lebih"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {hasil.statusPertumbuhan === "ideal"
                          ? "Ideal"
                          : hasil.statusPertumbuhan === "lebih"
                          ? "Lebih"
                          : "Kurang"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">–</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
