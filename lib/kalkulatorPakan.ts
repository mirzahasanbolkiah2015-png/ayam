// ─── Dynamic Feed Builder Types ───────────────────────────────────────────────

export type TipeBahan = "energi" | "protein" | "tambahan";

export interface BahanPakan {
  id: string;
  nama: string;
  jumlahGram: number;       // gram per ekor per hari
  hargaPerKg: number;       // Rp/kg
  tipe: TipeBahan;
  isMaggotSegar?: boolean;  // khusus maggot segar
}

export interface HasilDynamic {
  totalGramPerEkor: number;       // gram
  totalGramSemua: number;         // gram (semua ayam)
  biayaPerEkorPerHari: number;    // Rp
  biayaSememuaPerHari: number;    // Rp
  biayaPerEkorSampaiPanen: number;// Rp
  totalBiayaSampaiPanen: number;  // Rp
  biayaPerKgPakan: number;        // Rp/kg
  fcr: number;
  statusFCR: "sangat_efisien" | "normal" | "boros";
  persenPerBahan: { id: string; persen: number; biayaHarian: number; efektifGram: number }[];
  totalPersen: number;
  peringatan: string[];
}

export function hitungDynamic(
  bahan: BahanPakan[],
  jumlahAyam: number,
  umurMinggu: number,
  bobotRataRata: number // gram
): HasilDynamic {
  const sisaMinggu = Math.max(0, 10 - umurMinggu);
  const totalHari = sisaMinggu * 7;
  const bobotPanenTargetKg = 1.05;

  // Hitung efektif gram per ekor (maggot segar ÷ 2.5 untuk basis kering)
  const efektifGram = bahan.map((b) => ({
    id: b.id,
    gram: b.isMaggotSegar ? b.jumlahGram / 2.5 : b.jumlahGram,
  }));

  const totalGramPerEkor = bahan.reduce((s, b) => s + b.jumlahGram, 0);
  const totalGramSemua = totalGramPerEkor * jumlahAyam;

  // Biaya per ekor per hari
  const biayaPerEkorPerHari = bahan.reduce((s, b) => {
    const g = b.isMaggotSegar ? b.jumlahGram / 2.5 : b.jumlahGram;
    return s + (g / 1000) * b.hargaPerKg;
  }, 0);
  const biayaSememuaPerHari = biayaPerEkorPerHari * jumlahAyam;

  // Biaya per kg pakan (weighted)
  const biayaPerKgPakan =
    totalGramPerEkor > 0 ? (biayaPerEkorPerHari / (totalGramPerEkor / 1000)) : 0;

  // Biaya sampai panen
  const totalPakanPerEkorKg = (totalGramPerEkor / 1000) * totalHari;
  const biayaPerEkorSampaiPanen = biayaPerEkorPerHari * totalHari;
  const totalBiayaSampaiPanen = biayaPerEkorSampaiPanen * jumlahAyam;

  // FCR
  const totalPakanSemuaKg = totalPakanPerEkorKg * jumlahAyam;
  const bobotAwalKg = (bobotRataRata / 1000) * jumlahAyam;
  const bobotPanenKg = bobotPanenTargetKg * jumlahAyam;
  const pertambahanKg = Math.max(0.001, bobotPanenKg - bobotAwalKg);
  const fcr = totalPakanSemuaKg / pertambahanKg;
  const statusFCR: HasilDynamic["statusFCR"] =
    fcr < 1.8 ? "sangat_efisien" : fcr <= 2.2 ? "normal" : "boros";

  // Persentase per bahan
  const totalEfektif = efektifGram.reduce((s, e) => s + e.gram, 0) || 1;
  const persenPerBahan = bahan.map((b) => {
    const ef = efektifGram.find((e) => e.id === b.id)!;
    const biayaHarian = (ef.gram / 1000) * b.hargaPerKg;
    return {
      id: b.id,
      persen: (b.jumlahGram / (totalGramPerEkor || 1)) * 100,
      biayaHarian,
      efektifGram: ef.gram,
    };
  });

  const totalPersen = bahan.reduce((s, b) => s + b.jumlahGram, 0);

  // Validasi peringatan
  const peringatan: string[] = [];
  if (totalGramPerEkor === 0) peringatan.push("Belum ada bahan pakan yang diisi.");
  if (bahan.some((b) => b.jumlahGram < 0)) peringatan.push("Jumlah bahan tidak boleh negatif.");
  if (bahan.some((b) => b.hargaPerKg <= 0)) peringatan.push("Harga beberapa bahan belum diisi.");
  const proteinBahan = bahan.filter((b) => b.tipe === "protein");
  const totalProteinGram = proteinBahan.reduce((s, b) => s + b.jumlahGram, 0);
  const proteinPersen = totalGramPerEkor > 0 ? (totalProteinGram / totalGramPerEkor) * 100 : 0;
  if (proteinPersen < 18 && totalGramPerEkor > 0) {
    peringatan.push(`Protein hanya ${proteinPersen.toFixed(1)}% — di bawah 18%. Tambah bahan sumber protein.`);
  }
  if (statusFCR === "boros") {
    peringatan.push(`FCR ${fcr.toFixed(2)} terlalu tinggi (> 2.2). Evaluasi komposisi ransum.`);
  }

  return {
    totalGramPerEkor,
    totalGramSemua,
    biayaPerEkorPerHari,
    biayaSememuaPerHari,
    biayaPerEkorSampaiPanen,
    totalBiayaSampaiPanen,
    biayaPerKgPakan,
    fcr,
    statusFCR,
    persenPerBahan,
    totalPersen,
    peringatan,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputData {
  jumlahAyam: number;
  umurMinggu: number;
  bobotRataRata: number;       // gram
  pakanPerEkorPerHari: number; // gram
  jenismaggot: "kering" | "segar";
  // komposisi pakan (%)
  komposisi: KomposisiPakan;
  // harga bahan (Rp/kg)
  harga: HargaBahan;
}

export interface KomposisiPakan {
  jagung: number;
  maggot: number;
  dedak: number;
  azolla: number;
  lainnya: number;
}

export interface HargaBahan {
  jagung: number;
  maggot: number;
  dedak: number;
  azolla: number;
  lainnya: number;
}

export interface HasilKalkulator {
  // Pakan
  pakanPerEkorPerHari: number;      // gram
  totalPakanHarian: number;         // gram
  totalPakanSampaiPanen: number;    // kg

  // Komposisi harian (gram per ekor)
  kebutuhanHarian: KomposisiGram;

  // FCR
  pertambahanBobot: number;         // kg total
  totalPakanTerpakai: number;       // kg total
  fcr: number;
  statusFCR: "sangat_efisien" | "normal" | "boros";

  // Biaya
  biayaPerKgPakan: number;          // Rp
  biayaPerEkorSampaiPanen: number;  // Rp
  totalBiayaPakan: number;          // Rp
  totalBiayaSampaiPanen: number;    // alias totalBiayaPakan (Rp)
  biayaHarianTotal: number;         // Rp/hari seluruh ayam
  statusBiaya: "efisien" | "normal" | "mahal";

  // Pertumbuhan
  bobotIdeal: number;               // gram
  targetBobot: number;              // alias bobotIdeal (gram)
  selisihBobot: number;             // gram (+ = lebih, - = kurang)
  statusPertumbuhan: "lebih" | "ideal" | "kurang";

  // Peringatan
  peringatan: Peringatan[];
}

export interface KomposisiGram {
  jagung: number;
  maggot: number;
  dedakRaw: number;
  azolla: number;
  lainnya: number;
  maggotLabel: string; // "kering" | "segar"
}

export interface Peringatan {
  level: "warning" | "danger" | "info";
  judul: string;
  pesan: string;
}

// ─── Rekomendasi Komposisi ─────────────────────────────────────────────────────

export interface RekomendasiKomposisi {
  jagung: number;
  maggot: number;
  dedak: number;
  azolla: number;
  lainnya: number;
}

export function getRekomendasiKomposisi(umurMinggu: number): RekomendasiKomposisi {
  if (umurMinggu <= 4) {
    return { jagung: 50, maggot: 25, dedak: 15, azolla: 5, lainnya: 5 };
  } else if (umurMinggu <= 6) {
    return { jagung: 55, maggot: 20, dedak: 18, azolla: 4, lainnya: 3 };
  } else if (umurMinggu <= 8) {
    return { jagung: 60, maggot: 15, dedak: 20, azolla: 3, lainnya: 2 };
  } else {
    return { jagung: 62, maggot: 14, dedak: 20, azolla: 2, lainnya: 2 };
  }
}

// ─── Target Pertumbuhan ────────────────────────────────────────────────────────

export function getBobotIdeal(umurMinggu: number): number {
  if (umurMinggu <= 4) return 300;
  if (umurMinggu <= 6) return 600;
  if (umurMinggu <= 8) return 900;
  return 1050; // rata-rata 1000–1100
}

// ─── Rekomendasi Pakan Per Ekor (gram/hari) ────────────────────────────────────

export function getPakanRekomendasiPerEkor(umurMinggu: number): number {
  if (umurMinggu <= 2) return 15;
  if (umurMinggu <= 4) return 30;
  if (umurMinggu <= 6) return 55;
  if (umurMinggu <= 8) return 75;
  return 90;
}

// ─── Kalkulasi Utama ──────────────────────────────────────────────────────────

export function hitung(input: InputData): HasilKalkulator {
  const {
    jumlahAyam,
    umurMinggu,
    bobotRataRata,
    pakanPerEkorPerHari,
    jenismaggot,
    komposisi,
    harga,
  } = input;

  // ── 1. Pakan ──────────────────────────────────────────────────────────────
  const totalPakanHarianGram = pakanPerEkorPerHari * jumlahAyam;
  const sisaMingguSampaiPanen = Math.max(0, 10 - umurMinggu);
  const totalHariSampaiPanen = sisaMingguSampaiPanen * 7;
  const bobotPanenTargetKg = 1.05; // kg
  const totalPakanSampaiPanenKg =
    (pakanPerEkorPerHari / 1000) * jumlahAyam * totalHariSampaiPanen;

  // ── 2. Komposisi harian per ekor (gram) ──────────────────────────────────
  const totalPersen =
    komposisi.jagung +
    komposisi.maggot +
    komposisi.dedak +
    komposisi.azolla +
    komposisi.lainnya;
  const skala = totalPersen > 0 ? 100 / totalPersen : 1;

  const jagungGram = (pakanPerEkorPerHari * (komposisi.jagung * skala)) / 100;
  const maggotKeringGram = (pakanPerEkorPerHari * (komposisi.maggot * skala)) / 100;
  const maggotGram = jenismaggot === "segar" ? maggotKeringGram * 2.5 : maggotKeringGram;
  const dedakGram = (pakanPerEkorPerHari * (komposisi.dedak * skala)) / 100;
  const azollaGram = (pakanPerEkorPerHari * (komposisi.azolla * skala)) / 100;
  const lainnyaGram = (pakanPerEkorPerHari * (komposisi.lainnya * skala)) / 100;

  // ── 3. FCR ────────────────────────────────────────────────────────────────
  const bobotAwalKg = (bobotRataRata / 1000) * jumlahAyam;
  const bobotPanenKg = bobotPanenTargetKg * jumlahAyam;
  const pertambahanBobotKg = Math.max(0.001, bobotPanenKg - bobotAwalKg);
  const totalPakanTerpakai = totalPakanSampaiPanenKg;
  const fcr = totalPakanTerpakai / pertambahanBobotKg;

  let statusFCR: HasilKalkulator["statusFCR"];
  if (fcr < 1.8) statusFCR = "sangat_efisien";
  else if (fcr <= 2.2) statusFCR = "normal";
  else statusFCR = "boros";

  // ── 4. Biaya ──────────────────────────────────────────────────────────────
  // Biaya per kg pakan (proporsi dari komposisi yg dinormalisasi ke 100%)
  const normJagung = (komposisi.jagung * skala) / 100;
  const normMaggot = (komposisi.maggot * skala) / 100;
  const normDedak = (komposisi.dedak * skala) / 100;
  const normAzolla = (komposisi.azolla * skala) / 100;
  const normLainnya = (komposisi.lainnya * skala) / 100;

  // Jika maggot segar harga efektif lebih murah (2.5× berat, jadi harga/kg kering ekuivalen)
  const hargaMaggotEfektif =
    jenismaggot === "segar" ? harga.maggot / 2.5 : harga.maggot;

  const biayaPerKgPakan =
    normJagung * harga.jagung +
    normMaggot * hargaMaggotEfektif +
    normDedak * harga.dedak +
    normAzolla * harga.azolla +
    normLainnya * harga.lainnya;

  const totalPakanPerEkorSampaiPanen =
    (pakanPerEkorPerHari / 1000) * totalHariSampaiPanen;
  const biayaPerEkorSampaiPanen = totalPakanPerEkorSampaiPanen * biayaPerKgPakan;
  const totalBiayaPakan = biayaPerEkorSampaiPanen * jumlahAyam;

  let statusBiaya: HasilKalkulator["statusBiaya"];
  if (biayaPerEkorSampaiPanen <= 22000) statusBiaya = "efisien";
  else if (biayaPerEkorSampaiPanen <= 26000) statusBiaya = "normal";
  else statusBiaya = "mahal";

  // ── 5. Pertumbuhan ────────────────────────────────────────────────────────
  const bobotIdeal = getBobotIdeal(umurMinggu);
  const selisihBobot = bobotRataRata - bobotIdeal;
  let statusPertumbuhan: HasilKalkulator["statusPertumbuhan"];
  if (selisihBobot > 50) statusPertumbuhan = "lebih";
  else if (selisihBobot >= -50) statusPertumbuhan = "ideal";
  else statusPertumbuhan = "kurang";

  // ── 6. Peringatan ─────────────────────────────────────────────────────────
  const peringatan: Peringatan[] = [];

  // Protein (maggot + azolla sebagai indikator protein nabati/hewani)
  const totalProteinPersen = (komposisi.maggot * skala) / 100 + (komposisi.azolla * skala) / 100;
  if (totalProteinPersen < 0.18) {
    peringatan.push({
      level: "warning",
      judul: "Protein Kurang",
      pesan:
        "Kandungan protein ransum di bawah optimal (< 18%). Pertumbuhan bisa terhambat. Tambah proporsi maggot atau azolla.",
    });
  }

  // Kalsium – azolla & dedak (indikator)
  const azollaPersen = (komposisi.azolla * skala) / 100;
  if (azollaPersen < 0.02) {
    peringatan.push({
      level: "warning",
      judul: "Kalsium Kurang",
      pesan:
        "Azolla < 2% dalam ransum. Kalsium mungkin kurang sehingga tulang rentan lemah. Tingkatkan proporsi azolla.",
    });
  }

  // FCR tinggi
  if (statusFCR === "boros") {
    peringatan.push({
      level: "danger",
      judul: "FCR Tinggi - Pakan Tidak Efisien",
      pesan: `FCR ${fcr.toFixed(2)} melebihi 2.2. Evaluasi komposisi ransum, pastikan kualitas bahan dan tidak ada pakan terbuang.`,
    });
  }

  // Pertumbuhan lambat
  if (statusPertumbuhan === "kurang") {
    peringatan.push({
      level: "warning",
      judul: "Pertumbuhan di Bawah Target",
      pesan: `Bobot saat ini ${bobotRataRata}g, target minggu ke-${umurMinggu}: ${bobotIdeal}g. Selisih ${Math.abs(selisihBobot)}g.`,
    });
  }

  // Biaya mahal
  if (statusBiaya === "mahal") {
    peringatan.push({
      level: "danger",
      judul: "Biaya Pakan Melebihi Target",
      pesan: `Biaya per ekor sampai panen Rp ${Math.round(biayaPerEkorSampaiPanen).toLocaleString("id-ID")} melebihi Rp 26.000. Pertimbangkan bahan pakan yang lebih efisien.`,
    });
  }

  // Info positif
  if (statusFCR === "sangat_efisien") {
    peringatan.push({
      level: "info",
      judul: "FCR Sangat Efisien",
      pesan: `FCR ${fcr.toFixed(2)} < 1.8. Pakan dimanfaatkan sangat baik. Pertahankan komposisi ransum ini!`,
    });
  }

  return {
    pakanPerEkorPerHari,
    totalPakanHarian: totalPakanHarianGram,
    totalPakanSampaiPanen: totalPakanSampaiPanenKg,

    kebutuhanHarian: {
      jagung: jagungGram,
      maggot: maggotGram,
      dedakRaw: dedakGram,
      azolla: azollaGram,
      lainnya: lainnyaGram,
      maggotLabel: jenismaggot,
    },

    pertambahanBobot: pertambahanBobotKg,
    totalPakanTerpakai,
    fcr,
    statusFCR,

    biayaPerKgPakan,
    biayaPerEkorSampaiPanen,
    totalBiayaPakan,
    totalBiayaSampaiPanen: totalBiayaPakan,
    biayaHarianTotal: (pakanPerEkorPerHari / 1000) * jumlahAyam * biayaPerKgPakan,
    statusBiaya,

    bobotIdeal,
    targetBobot: bobotIdeal,
    selisihBobot,
    statusPertumbuhan,

    peringatan,
  };
}
