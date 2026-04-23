"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getRekomendasiKomposisi,
  getPakanRekomendasiPerEkor,
  type InputData,
  type KomposisiPakan,
  type HargaBahan,
} from "@/lib/kalkulatorPakan";
import { Sparkles, RefreshCw } from "lucide-react";

interface InputFormProps {
  data: InputData;
  onChange: (data: InputData) => void;
}

function FieldRow({
  label,
  satuan,
  value,
  min,
  onChange,
  placeholder,
}: {
  label: string;
  satuan?: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min ?? 0}
          value={value === 0 ? "" : value}
          placeholder={placeholder ?? "0"}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="bg-card border-border focus:border-primary focus:ring-primary/20"
        />
        {satuan && (
          <span className="text-muted-foreground text-sm whitespace-nowrap min-w-[3rem]">
            {satuan}
          </span>
        )}
      </div>
    </div>
  );
}

export default function InputForm({ data, onChange }: InputFormProps) {
  const totalKomposisi =
    data.komposisi.jagung +
    data.komposisi.maggot +
    data.komposisi.dedak +
    data.komposisi.azolla +
    data.komposisi.lainnya;

  const komposisiOK = Math.abs(totalKomposisi - 100) < 0.1;

  function update(patch: Partial<InputData>) {
    onChange({ ...data, ...patch });
  }

  function updateKomposisi(patch: Partial<KomposisiPakan>) {
    onChange({ ...data, komposisi: { ...data.komposisi, ...patch } });
  }

  function updateHarga(patch: Partial<HargaBahan>) {
    onChange({ ...data, harga: { ...data.harga, ...patch } });
  }

  function terapkanRekomendasi() {
    const rek = getRekomendasiKomposisi(data.umurMinggu);
    const pakanRek = getPakanRekomendasiPerEkor(data.umurMinggu);
    onChange({
      ...data,
      komposisi: rek,
      pakanPerEkorPerHari: pakanRek,
    });
  }

  // Auto-terapkan rekomendasi saat umur berubah jika komposisi masih default
  useEffect(() => {
    if (data.umurMinggu > 0) {
      const rek = getRekomendasiKomposisi(data.umurMinggu);
      const pakanRek = getPakanRekomendasiPerEkor(data.umurMinggu);
      onChange({
        ...data,
        komposisi: rek,
        pakanPerEkorPerHari: pakanRek,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.umurMinggu]);

  return (
    <div className="flex flex-col gap-4">
      {/* Data Ternak */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              1
            </span>
            Data Ternak
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
          <FieldRow
            label="Jumlah Ayam"
            satuan="ekor"
            value={data.jumlahAyam}
            min={1}
            onChange={(v) => update({ jumlahAyam: v })}
            placeholder="100"
          />
          <FieldRow
            label="Umur Ayam"
            satuan="minggu"
            value={data.umurMinggu}
            min={1}
            onChange={(v) => update({ umurMinggu: v })}
            placeholder="6"
          />
          <FieldRow
            label="Bobot Rata-rata"
            satuan="gram"
            value={data.bobotRataRata}
            onChange={(v) => update({ bobotRataRata: v })}
            placeholder="500"
          />
          <FieldRow
            label="Pakan/Ekor/Hari"
            satuan="gram"
            value={data.pakanPerEkorPerHari}
            onChange={(v) => update({ pakanPerEkorPerHari: v })}
            placeholder="55"
          />
          {/* Jenis Maggot */}
          <div className="col-span-2 flex flex-col gap-1">
            <Label className="text-sm font-medium text-foreground">
              Jenis Maggot
            </Label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ jenismaggot: "kering" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  data.jenismaggot === "kering"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                Maggot Kering
              </button>
              <button
                onClick={() => update({ jenismaggot: "segar" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  data.jenismaggot === "segar"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                Maggot Segar
              </button>
            </div>
            {data.jenismaggot === "segar" && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-2 py-1 mt-1">
                Maggot segar: berat = 2.5x maggot kering
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Komposisi Pakan */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                2
              </span>
              Komposisi Pakan (%)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={terapkanRekomendasi}
              className="text-xs gap-1 h-7 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Sparkles className="w-3 h-3" />
              Otomatis
            </Button>
          </div>
          {/* Total indicator */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  komposisiOK
                    ? "bg-primary"
                    : totalKomposisi > 100
                    ? "bg-destructive"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(totalKomposisi, 100)}%` }}
              />
            </div>
            <span
              className={`text-xs font-medium tabular-nums ${
                komposisiOK
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {totalKomposisi.toFixed(1)}%
            </span>
          </div>
          {!komposisiOK && (
            <p className="text-xs text-destructive mt-1">
              Total harus 100%. Saat ini: {totalKomposisi.toFixed(1)}%
            </p>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
          <FieldRow
            label="Jagung"
            satuan="%"
            value={data.komposisi.jagung}
            onChange={(v) => updateKomposisi({ jagung: v })}
            placeholder="50"
          />
          <FieldRow
            label="Maggot"
            satuan="%"
            value={data.komposisi.maggot}
            onChange={(v) => updateKomposisi({ maggot: v })}
            placeholder="25"
          />
          <FieldRow
            label="Dedak"
            satuan="%"
            value={data.komposisi.dedak}
            onChange={(v) => updateKomposisi({ dedak: v })}
            placeholder="15"
          />
          <FieldRow
            label="Azolla"
            satuan="%"
            value={data.komposisi.azolla}
            onChange={(v) => updateKomposisi({ azolla: v })}
            placeholder="5"
          />
          <div className="col-span-2">
            <FieldRow
              label="Tambahan Alami (daun kelor, pepaya, dll)"
              satuan="%"
              value={data.komposisi.lainnya}
              onChange={(v) => updateKomposisi({ lainnya: v })}
              placeholder="5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Harga Bahan */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              3
            </span>
            Harga Bahan (Rp/kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3">
          <FieldRow
            label="Jagung"
            satuan="Rp/kg"
            value={data.harga.jagung}
            onChange={(v) => updateHarga({ jagung: v })}
            placeholder="5000"
          />
          <FieldRow
            label={`Maggot (${data.jenismaggot})`}
            satuan="Rp/kg"
            value={data.harga.maggot}
            onChange={(v) => updateHarga({ maggot: v })}
            placeholder="8000"
          />
          <FieldRow
            label="Dedak"
            satuan="Rp/kg"
            value={data.harga.dedak}
            onChange={(v) => updateHarga({ dedak: v })}
            placeholder="3000"
          />
          <FieldRow
            label="Azolla"
            satuan="Rp/kg"
            value={data.harga.azolla}
            onChange={(v) => updateHarga({ azolla: v })}
            placeholder="2000"
          />
          <div className="col-span-2">
            <FieldRow
              label="Tambahan Alami"
              satuan="Rp/kg"
              value={data.harga.lainnya}
              onChange={(v) => updateHarga({ lainnya: v })}
              placeholder="1500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <button
        onClick={() =>
          onChange({
            jumlahAyam: 0,
            umurMinggu: 0,
            bobotRataRata: 0,
            pakanPerEkorPerHari: 0,
            jenismaggot: "kering",
            komposisi: { jagung: 50, maggot: 25, dedak: 15, azolla: 5, lainnya: 5 },
            harga: { jagung: 5000, maggot: 8000, dedak: 3000, azolla: 2000, lainnya: 1500 },
          })
        }
        className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset semua data
      </button>
    </div>
  );
}
