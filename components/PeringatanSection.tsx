"use client";

import { type Peringatan } from "@/lib/kalkulatorPakan";
import { AlertTriangle, Info, XOctagon, CheckCircle2 } from "lucide-react";

interface PeringatanSectionProps {
  peringatan: Peringatan[];
}

export default function PeringatanSection({ peringatan }: PeringatanSectionProps) {
  if (peringatan.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400" />
        <p className="text-sm font-medium text-green-600">Semua indikator normal</p>
        <p className="text-xs text-muted-foreground">
          Tidak ada peringatan. Pertahankan komposisi dan manajemen pakan Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {peringatan.map((p, i) => {
        const isInfo = p.level === "info";
        const isDanger = p.level === "danger";
        const isWarning = p.level === "warning";

        const icon = isInfo ? (
          <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
        ) : isDanger ? (
          <XOctagon className="w-5 h-5 flex-shrink-0 text-red-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
        );

        const containerClass = isInfo
          ? "bg-blue-50 border-blue-200"
          : isDanger
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200";

        const titleClass = isInfo
          ? "text-blue-700"
          : isDanger
          ? "text-red-700"
          : "text-amber-700";

        const textClass = isInfo
          ? "text-blue-600"
          : isDanger
          ? "text-red-600"
          : "text-amber-600";

        const badge = isInfo ? (
          <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
            Info
          </span>
        ) : isDanger ? (
          <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
            Bahaya
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
            Peringatan
          </span>
        );

        return (
          <div
            key={i}
            className={`flex gap-3 rounded-xl border px-4 py-3.5 ${containerClass}`}
          >
            {icon}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${titleClass}`}>{p.judul}</p>
                {badge}
              </div>
              <p className={`text-xs leading-relaxed ${textClass}`}>{p.pesan}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
