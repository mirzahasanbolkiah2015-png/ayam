"use client";

import { useState, useMemo, useEffect } from "react";
import InputForm from "@/components/InputForm";
import SummaryCards from "@/components/SummaryCards";
import PakanFCRSection from "@/components/PakanFCRSection";
import BiayaSection from "@/components/BiayaSection";
import PertumbuhanSection from "@/components/PertumbuhanSection";
import PeringatanSection from "@/components/PeringatanSection";
import DynamicFeedBuilder, { DEFAULT_BAHAN } from "@/components/DynamicFeedBuilder";
import Dashboard from "@/components/Dashboard";
import { hitung, type InputData, type BahanPakan } from "@/lib/kalkulatorPakan";
import {
  Wheat,
  Calculator,
  Banknote,
  TrendingUp,
  Bell,
  ChevronRight,
  Bird,
  FlaskConical,
  LayoutDashboard,
} from "lucide-react";

const LS_KEY = "kalkulator-pakan-ayam-kub-v1";

const DEFAULT_INPUT: InputData = {
  jumlahAyam: 100,
  umurMinggu: 6,
  bobotRataRata: 550,
  pakanPerEkorPerHari: 55,
  jenismaggot: "kering",
  komposisi: { jagung: 55, maggot: 20, dedak: 18, azolla: 4, lainnya: 3 },
  harga: { jagung: 5000, maggot: 8000, dedak: 3000, azolla: 2000, lainnya: 1500 },
};

type Tab = "dashboard" | "input" | "pakan" | "biaya" | "tumbuh" | "peringatan" | "builder";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard",  label: "Home",    icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "input",      label: "Input",   icon: <Wheat className="w-4 h-4" /> },
  { key: "builder",    label: "Builder", icon: <FlaskConical className="w-4 h-4" /> },
  { key: "pakan",      label: "FCR",     icon: <Calculator className="w-4 h-4" /> },
  { key: "biaya",      label: "Biaya",   icon: <Banknote className="w-4 h-4" /> },
  { key: "tumbuh",     label: "Tumbuh",  icon: <TrendingUp className="w-4 h-4" /> },
  { key: "peringatan", label: "Notif",   icon: <Bell className="w-4 h-4" /> },
];

export default function Page() {
  const [inputData, setInputData] = useState<InputData>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUT;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return JSON.parse(saved) as InputData;
    } catch {}
    return DEFAULT_INPUT;
  });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [bahanList, setBahanList] = useState<BahanPakan[]>(DEFAULT_BAHAN);

  // Persist inputData to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(inputData));
    } catch {}
  }, [inputData]);

  const hasil = useMemo(() => {
    if (
      inputData.jumlahAyam > 0 &&
      inputData.umurMinggu > 0 &&
      inputData.pakanPerEkorPerHari > 0
    ) {
      return hitung(inputData);
    }
    return null;
  }, [inputData]);

  const peringatanCount = hasil?.peringatan.filter(
    (p) => p.level === "warning" || p.level === "danger"
  ).length ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Bird className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold leading-tight text-primary-foreground">
              Kalkulator Pakan Ayam KUB
            </h1>
            <p className="text-xs text-primary-foreground/70">
              {activeTab === "dashboard"
                ? "Ringkasan Peternakan"
                : activeTab === "input"
                ? "Input Data Ternak"
                : activeTab === "builder"
                ? "Dynamic Feed Builder"
                : activeTab === "pakan"
                ? "Pakan & FCR"
                : activeTab === "biaya"
                ? "Analisis Biaya"
                : activeTab === "tumbuh"
                ? "Estimasi Pertumbuhan"
                : "Peringatan & Rekomendasi"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-28">
        {/* Summary Cards – visible on analysis tabs only */}
        {hasil && activeTab !== "input" && activeTab !== "dashboard" && activeTab !== "builder" && (
          <div className="mb-4">
            <SummaryCards hasil={hasil} />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <Dashboard
            hasil={hasil}
            inputData={inputData}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "input" && (
          <div>
            <InputForm data={inputData} onChange={setInputData} />
            {hasil && (
              <button
                onClick={() => setActiveTab("pakan")}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm shadow-sm hover:bg-primary/90 transition-colors"
              >
                Lihat Hasil Kalkulasi
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {!hasil && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Isi data ternak untuk melihat hasil kalkulasi
              </div>
            )}
          </div>
        )}

        {activeTab === "builder" && (
          <DynamicFeedBuilder
            bahan={bahanList}
            onChange={setBahanList}
            jumlahAyam={inputData.jumlahAyam}
            umurMinggu={inputData.umurMinggu}
            bobotRataRata={inputData.bobotRataRata}
          />
        )}

        {activeTab === "pakan" && (
          <div>
            {hasil ? (
              <PakanFCRSection hasil={hasil} />
            ) : (
              <EmptyState onBack={() => setActiveTab("input")} />
            )}
          </div>
        )}

        {activeTab === "biaya" && (
          <div>
            {hasil ? (
              <BiayaSection hasil={hasil} jumlahAyam={inputData.jumlahAyam} />
            ) : (
              <EmptyState onBack={() => setActiveTab("input")} />
            )}
          </div>
        )}

        {activeTab === "tumbuh" && (
          <div>
            {hasil ? (
              <PertumbuhanSection
                hasil={hasil}
                umurMinggu={inputData.umurMinggu}
                bobotRataRata={inputData.bobotRataRata}
              />
            ) : (
              <EmptyState onBack={() => setActiveTab("input")} />
            )}
          </div>
        )}

        {activeTab === "peringatan" && (
          <div>
            {hasil ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Peringatan & Rekomendasi
                  </span>
                  {peringatanCount > 0 && (
                    <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 font-bold">
                      {peringatanCount}
                    </span>
                  )}
                </div>
                <PeringatanSection peringatan={hasil.peringatan} />
              </div>
            ) : (
              <EmptyState onBack={() => setActiveTab("input")} />
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border shadow-lg">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const showBadge =
              tab.key === "peringatan" && peringatanCount > 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-primary" />
                )}
                <span className="relative">
                  {tab.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
                      {peringatanCount}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Calculator className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">Data belum diisi</p>
        <p className="text-sm text-muted-foreground mt-1">
          Silakan isi data ternak terlebih dahulu
        </p>
      </div>
      <button
        onClick={onBack}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
      >
        Isi Data Sekarang
      </button>
    </div>
  );
}
