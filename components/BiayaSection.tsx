"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HasilKalkulator } from "@/lib/kalkulatorPakan";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface BiayaSectionProps {
  hasil: HasilKalkulator;
  jumlahAyam: number;
}

function formatRp(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-b border-border last:border-b-0 ${
        bold ? "font-semibold" : ""
      }`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "text-foreground text-base" : "text-foreground/80"}`}>
        {value}
      </span>
    </div>
  );
}

export default function BiayaSection({ hasil, jumlahAyam }: BiayaSectionProps) {
  const statusIcon =
    hasil.statusBiaya === "efisien" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : hasil.statusBiaya === "normal" ? (
      <AlertCircle className="w-5 h-5 text-amber-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );

  const statusText =
    hasil.statusBiaya === "efisien"
      ? "Biaya Sangat Efisien"
      : hasil.statusBiaya === "normal"
      ? "Biaya Normal"
      : "Biaya Melebihi Target";

  const statusColor =
    hasil.statusBiaya === "efisien"
      ? "bg-green-50 border-green-200 text-green-700"
      : hasil.statusBiaya === "normal"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-red-50 border-red-200 text-red-700";

  // Bar chart for cost comparison
  const efisienMax = 22000;
  const normalMax = 26000;
  const actual = hasil.biayaPerEkorSampaiPanen;
  const maxBar = Math.max(actual * 1.1, 30000);
  const widthEfisien = (efisienMax / maxBar) * 100;
  const widthNormal = (normalMax / maxBar) * 100;
  const widthActual = (actual / maxBar) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Banner */}
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${statusColor}`}
      >
        {statusIcon}
        <div>
          <p className="font-semibold text-sm">{statusText}</p>
          <p className="text-xs opacity-80">
            {hasil.statusBiaya === "efisien"
              ? "Biaya per ekor Rp 18.000 – 22.000 (sangat hemat)"
              : hasil.statusBiaya === "normal"
              ? "Biaya per ekor Rp 22.000 – 26.000 (masih wajar)"
              : "Biaya per ekor melebihi Rp 26.000 (perlu optimasi)"}
          </p>
        </div>
      </div>

      {/* Rincian Biaya */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Rincian Biaya Pakan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-0">
          <Row
            label="Biaya per kg pakan"
            value={`${formatRp(hasil.biayaPerKgPakan)}/kg`}
          />
          <Row
            label="Biaya per ekor sampai panen"
            value={formatRp(hasil.biayaPerEkorSampaiPanen)}
            bold
          />
          <Row
            label={`Total biaya (${jumlahAyam} ekor)`}
            value={formatRp(hasil.totalBiayaPakan)}
            bold
          />
        </CardContent>
      </Card>

      {/* Visualisasi Perbandingan */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Perbandingan Target Biaya/Ekor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex flex-col gap-4">
          {/* Efisien */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600 font-medium">Sangat Efisien</span>
              <span className="text-muted-foreground">{formatRp(efisienMax)}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${widthEfisien}%` }}
              />
            </div>
          </div>
          {/* Normal */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-amber-600 font-medium">Normal</span>
              <span className="text-muted-foreground">{formatRp(normalMax)}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${widthNormal}%` }}
              />
            </div>
          </div>
          {/* Aktual */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span
                className={`font-medium ${
                  hasil.statusBiaya === "efisien"
                    ? "text-green-600"
                    : hasil.statusBiaya === "normal"
                    ? "text-amber-600"
                    : "text-red-500"
                }`}
              >
                Aktual Anda
              </span>
              <span className="text-muted-foreground font-semibold">
                {formatRp(actual)}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  hasil.statusBiaya === "efisien"
                    ? "bg-green-500"
                    : hasil.statusBiaya === "normal"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${widthActual}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
