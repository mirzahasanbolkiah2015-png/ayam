"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HasilKalkulator } from "@/lib/kalkulatorPakan";

interface PakanFCRSectionProps {
  hasil: HasilKalkulator;
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 border-b border-border last:border-b-0 ${
        bold ? "font-semibold" : ""
      }`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${bold ? "text-foreground" : "text-foreground/80"} tabular-nums`}>
        {value}
      </span>
    </div>
  );
}

function KomposisiBar({
  label,
  gram,
  persen,
  color,
}: {
  label: string;
  gram: number;
  persen: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {gram.toFixed(1)}g ({persen.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(persen, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function PakanFCRSection({ hasil }: PakanFCRSectionProps) {
  const { kebutuhanHarian: k, pakanPerEkorPerHari } = hasil;
  const total = pakanPerEkorPerHari || 1;

  const fcrGauge = Math.min((hasil.fcr / 3) * 100, 100);
  const fcrColor =
    hasil.statusFCR === "sangat_efisien"
      ? "#22c55e"
      : hasil.statusFCR === "normal"
      ? "#f59e0b"
      : "#ef4444";

  const fcrLabel =
    hasil.statusFCR === "sangat_efisien"
      ? "Sangat Efisien"
      : hasil.statusFCR === "normal"
      ? "Normal"
      : "Boros – Perlu Evaluasi";

  return (
    <div className="flex flex-col gap-4">
      {/* Kalkulator Pakan */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Kalkulator Pakan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-0">
          <Row
            label="Pakan per ekor / hari"
            value={`${hasil.pakanPerEkorPerHari.toFixed(0)} gram`}
          />
          <Row
            label="Total pakan harian"
            value={`${(hasil.totalPakanHarian / 1000).toFixed(2)} kg`}
          />
          <Row
            label="Total pakan sampai panen"
            value={`${hasil.totalPakanSampaiPanen.toFixed(1)} kg`}
            bold
          />
        </CardContent>
      </Card>

      {/* Komposisi Harian Per Ekor */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Komposisi Harian Per Ekor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-3">
          <KomposisiBar
            label="Jagung"
            gram={k.jagung}
            persen={(k.jagung / total) * 100}
            color="bg-amber-400"
          />
          <KomposisiBar
            label={`Maggot (${k.maggotLabel})`}
            gram={k.maggot}
            persen={(k.maggot / total) * 100}
            color="bg-green-500"
          />
          <KomposisiBar
            label="Dedak"
            gram={k.dedakRaw}
            persen={(k.dedakRaw / total) * 100}
            color="bg-orange-400"
          />
          <KomposisiBar
            label="Azolla"
            gram={k.azolla}
            persen={(k.azolla / total) * 100}
            color="bg-emerald-400"
          />
          <KomposisiBar
            label="Tambahan Alami"
            gram={k.lainnya}
            persen={(k.lainnya / total) * 100}
            color="bg-lime-400"
          />
          <div className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
            {k.maggotLabel === "segar" && (
              <p>Maggot segar: bobot aktual = {k.maggot.toFixed(1)}g (2.5x basis kering)</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FCR */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Feed Conversion Ratio (FCR)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-4">
          {/* Gauge visual */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
              {/* Color zones */}
              <div className="absolute inset-0 flex">
                <div className="h-full bg-green-200" style={{ width: "60%" }} />
                <div className="h-full bg-amber-200" style={{ width: "13%" }} />
                <div className="h-full bg-red-200" style={{ width: "27%" }} />
              </div>
              {/* Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 rounded-full"
                style={{
                  left: `${fcrGauge}%`,
                  backgroundColor: fcrColor,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
            <div className="flex w-full justify-between text-xs text-muted-foreground px-0.5">
              <span>0</span>
              <span>1.8</span>
              <span>2.2</span>
              <span>3+</span>
            </div>
          </div>

          <div className="text-center">
            <p
              className="text-4xl font-bold tabular-nums"
              style={{ color: fcrColor }}
            >
              {hasil.fcr.toFixed(2)}
            </p>
            <p className="text-sm font-medium mt-1" style={{ color: fcrColor }}>
              {fcrLabel}
            </p>
          </div>

          <div className="flex flex-col gap-0 bg-muted/40 rounded-xl overflow-hidden">
            <Row
              label="Total pakan terpakai"
              value={`${hasil.totalPakanTerpakai.toFixed(1)} kg`}
            />
            <Row
              label="Pertambahan bobot"
              value={`${hasil.pertambahanBobot.toFixed(1)} kg`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <span className="font-bold text-green-600">{"< 1.8"}</span>
              <span className="text-muted-foreground mt-0.5">Sangat Efisien</span>
            </div>
            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
              <span className="font-bold text-amber-600">1.8 – 2.2</span>
              <span className="text-muted-foreground mt-0.5">Normal</span>
            </div>
            <div className="flex flex-col items-center bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <span className="font-bold text-red-500">{"> 2.2"}</span>
              <span className="text-muted-foreground mt-0.5">Boros</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
