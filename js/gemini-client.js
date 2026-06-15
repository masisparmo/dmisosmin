/**
 * Gemini Client - Menangani API calls ke Google Gemini secara langsung dari browser
 * Dalil Quran & Hadits diambil dari API nyata (fawazahmed0) SEBELUM AI generate konten,
 * sehingga AI tidak bisa mengarang referensi yang tidak ada.
 */

// ============================================================
// KONFIGURASI API DALIL (fawazahmed0 — Free, No Auth Required)
// ============================================================

const QURAN_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1';
const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

/**
 * Mapping kata kunci topik → pool dalil yang relevan.
 * Setiap entry berisi array ayat Quran {surah, ayat, nama} dan hadits {kitab, nomor, label}.
 */
const DALIL_TOPIC_MAP = [
  {
    keywords: ['tahun baru', 'hijriyah', 'hijriah', 'muharram', 'hijrah', '1446', '1447', '1448', '1449', '1450', 'waktu', 'kalender', 'bulan baru', 'pergantian tahun'],
    quran: [
      { surah: 21, ayat: 33, nama: 'Al-Anbiya' },
      { surah: 2,  ayat: 189, nama: 'Al-Baqarah' },
      { surah: 9,  ayat: 36,  nama: 'At-Taubah' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 3197, label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 2699, label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['amal', 'shalih', 'kebaikan', 'ibadah', 'taat', 'beramal', 'berbuat baik', 'amal jariyah'],
    quran: [
      { surah: 2,  ayat: 177, nama: 'Al-Baqarah' },
      { surah: 18, ayat: 110, nama: 'Al-Kahfi' },
      { surah: 99, ayat: 7,   nama: 'Az-Zalzalah' },
    ],
    hadits: [
      { kitab: 'muslim',  nomor: 2699, label: 'HR. Muslim' },
      { kitab: 'bukhari', nomor: 6502, label: 'HR. Bukhari' },
    ],
  },
  {
    keywords: ['taubat', 'tobat', 'introspeksi', 'muhasabah', 'muhasabah diri', 'mawas diri', 'perbaikan diri', 'koreksi diri'],
    quran: [
      { surah: 39, ayat: 53, nama: 'Az-Zumar' },
      { surah: 66, ayat: 8,  nama: 'At-Tahrim' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 6309, label: 'HR. Bukhari' },
      { kitab: 'tirmidhi', nomor: 3537, label: 'HR. Tirmidhi' },
    ],
  },
  {
    keywords: ['syukur', 'bersyukur', 'nikmat', 'nikmat allah', 'karunia'],
    quran: [
      { surah: 14, ayat: 7,  nama: 'Ibrahim' },
      { surah: 16, ayat: 78, nama: 'An-Nahl' },
    ],
    hadits: [
      { kitab: 'tirmidhi', nomor: 3383, label: 'HR. Tirmidhi' },
      { kitab: 'abudawud', nomor: 4811, label: 'HR. Abu Dawud' },
    ],
  },
  {
    keywords: ['niat', 'ikhlas', 'keikhlasan', 'lillah'],
    quran: [
      { surah: 98, ayat: 5, nama: 'Al-Bayyinah' },
      { surah: 39, ayat: 11, nama: 'Az-Zumar' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 1,  label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 1907, label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['doa', 'berdoa', 'zikir', 'wirid', 'dzikir', 'munajat'],
    quran: [
      { surah: 2,  ayat: 186, nama: 'Al-Baqarah' },
      { surah: 7,  ayat: 55,  nama: 'Al-A\'raf' },
      { surah: 13, ayat: 28,  nama: 'Ar-Ra\'d' },
    ],
    hadits: [
      { kitab: 'muslim',  nomor: 2731, label: 'HR. Muslim' },
      { kitab: 'tirmidhi', nomor: 3375, label: 'HR. Tirmidhi' },
    ],
  },
  {
    keywords: ['shalat', 'salat', 'sembahyang', 'sholat'],
    quran: [
      { surah: 2, ayat: 45,  nama: 'Al-Baqarah' },
      { surah: 29, ayat: 45, nama: 'Al-Ankabut' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 521, label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 85,  label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['sedekah', 'zakat', 'infak', 'wakaf', 'berbagi', 'derma'],
    quran: [
      { surah: 2,  ayat: 261, nama: 'Al-Baqarah' },
      { surah: 2,  ayat: 273, nama: 'Al-Baqarah' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 1410, label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 1017, label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['akhlak', 'budi pekerti', 'sopan santun', 'adab', 'karakter', 'mulia'],
    quran: [
      { surah: 68, ayat: 4,  nama: 'Al-Qalam' },
      { surah: 31, ayat: 18, nama: 'Luqman' },
    ],
    hadits: [
      { kitab: 'tirmidhi', nomor: 2004, label: 'HR. Tirmidhi' },
      { kitab: 'bukhari',  nomor: 6018, label: 'HR. Bukhari' },
    ],
  },
  {
    keywords: ['sabar', 'kesabaran', 'tabah', 'uji', 'cobaan', 'ujian', 'musibah', 'bencana'],
    quran: [
      { surah: 2,  ayat: 155, nama: 'Al-Baqarah' },
      { surah: 39, ayat: 10,  nama: 'Az-Zumar' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 5641, label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 2999, label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['ukhuwah', 'persaudaraan', 'persatuan', 'bersatu', 'kebersamaan', 'silaturahmi'],
    quran: [
      { surah: 3,  ayat: 103, nama: 'Ali Imran' },
      { surah: 49, ayat: 10,  nama: 'Al-Hujurat' },
    ],
    hadits: [
      { kitab: 'bukhari', nomor: 6011, label: 'HR. Bukhari' },
      { kitab: 'muslim',  nomor: 45,   label: 'HR. Muslim' },
    ],
  },
  {
    keywords: ['ilmu', 'pendidikan', 'belajar', 'mengajar', 'kajian', 'pengetahuan'],
    quran: [
      { surah: 96, ayat: 1, nama: 'Al-\'Alaq' },
      { surah: 58, ayat: 11, nama: 'Al-Mujadila' },
    ],
    hadits: [
      { kitab: 'ibnmajah', nomor: 224,  label: 'HR. Ibnu Majah' },
      { kitab: 'tirmidhi', nomor: 2682, label: 'HR. Tirmidhi' },
    ],
  },
];

// Dalil default jika topik tidak cocok dengan kata kunci manapun
const DALIL_DEFAULT = {
  quran: [
    { surah: 3,   ayat: 102, nama: 'Ali Imran' },
    { surah: 2,   ayat: 2,   nama: 'Al-Baqarah' },
  ],
  hadits: [
    { kitab: 'bukhari', nomor: 1,    label: 'HR. Bukhari' },
    { kitab: 'muslim',  nomor: 2699, label: 'HR. Muslim' },
  ],
};

// ============================================================
// FUNGSI PRE-FETCH DALIL
// ============================================================

/**
 * Deteksi kategori topik berdasarkan kata kunci
 */
function detectTopicPool(topik) {
  const topikLower = topik.toLowerCase();
  for (const entry of DALIL_TOPIC_MAP) {
    if (entry.keywords.some(kw => topikLower.includes(kw))) {
      return entry;
    }
  }
  return DALIL_DEFAULT;
}

/**
 * Fetch satu ayat Quran dari fawazahmed0 API (teks Arab) + alquran.cloud (terjemahan Indonesia)
 * Returns: { ref, arab, indo, namasurah } atau null jika gagal
 */
async function fetchQuranAyah(surah, ayat, namasurah) {
  try {
    // Fetch teks Arab (fawazahmed0 - ara-quransimple endpoint per-ayat BEKERJA)
    const arabUrl = `${QURAN_API_BASE}/editions/ara-quransimple/${surah}/${ayat}.json`;
    const arabRes = await fetch(arabUrl);
    if (!arabRes.ok) throw new Error(`Arab fetch HTTP ${arabRes.status}`);
    const arabData = await arabRes.json();
    const arab = arabData?.text || '';

    // Fetch terjemahan Indonesia secara paralel (alquran.cloud sudah terbukti jalan)
    let indo = '';
    try {
      const indoRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayat}/id.indonesian`);
      if (indoRes.ok) {
        const indoData = await indoRes.json();
        indo = indoData?.data?.text || '';
      }
    } catch {
      // terjemahan tidak wajib, lanjut meski gagal
    }

    if (!arab) return null;

    return {
      ref: `QS. ${namasurah} (${surah}:${ayat})`,
      arab,
      indo,
      surah,
      ayat,
    };
  } catch (e) {
    console.warn(`Quran fetch failed for ${surah}:${ayat}`, e);
    return null;
  }
}

/**
 * Fetch satu hadits dari fawazahmed0 API (edisi Indonesia)
 * Returns: { ref, teks, kitab, nomor } atau null jika gagal
 */
async function fetchHadith(kitab, nomor, label) {
  try {
    // Format: editions/ind-{kitab}/{nomor}.json
    const url = `${HADITH_API_BASE}/editions/ind-${kitab}/${nomor}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Struktur: { hadiths: [ { hadithnumber, text } ] }
    const hadithObj = data?.hadiths?.[0];
    const teks = hadithObj?.text || '';

    if (!teks) return null;

    return {
      ref: `${label} No. ${nomor}`,
      teks,
      kitab,
      nomor,
    };
  } catch (e) {
    console.warn(`Hadith fetch failed for ${kitab} no.${nomor}`, e);
    return null;
  }
}

/**
 * Bangun pool dalil berdasarkan topik — fetch semua secara paralel
 * Returns: string teks dalil siap disertakan dalam prompt AI
 */
async function buildDalilPool(topik) {
  const pool = detectTopicPool(topik);

  console.log(`[DMI] Fetching dalil pool untuk topik: "${topik}"`);

  // Fetch semua Quran dan Hadits secara paralel
  const [quranResults, haditsResults] = await Promise.all([
    Promise.all(pool.quran.map(q => fetchQuranAyah(q.surah, q.ayat, q.nama))),
    Promise.all(pool.hadits.map(h => fetchHadith(h.kitab, h.nomor, h.label))),
  ]);

  const validQuran  = quranResults.filter(Boolean);
  const validHadits = haditsResults.filter(Boolean);

  console.log(`[DMI] Dalil berhasil di-fetch: ${validQuran.length} ayat, ${validHadits.length} hadits`);

  if (validQuran.length === 0 && validHadits.length === 0) {
    return null; // Tidak ada yang berhasil di-fetch
  }

  // Format sebagai teks untuk disertakan dalam prompt
  let poolText = '\n[BANK DALIL TERVERIFIKASI — DIAMBIL LANGSUNG DARI API RESMI QURAN & HADITS]\n';
  poolText += 'INSTRUKSI: Gunakan dalil-dalil berikut ini sebagai bahan konten. DILARANG membuat atau mengarang referensi Quran/Hadits sendiri.\n\n';

  if (validQuran.length > 0) {
    poolText += '=== AYAT AL-QURAN ===\n';
    validQuran.forEach((q, i) => {
      poolText += `[Q${i + 1}] ${q.ref}\n`;
      if (q.arab) poolText += `Teks Arab: ${q.arab}\n`;
      if (q.indo) poolText += `Terjemahan: ${q.indo}\n`;
      poolText += '\n';
    });
  }

  if (validHadits.length > 0) {
    poolText += '=== HADITS ===\n';
    validHadits.forEach((h, i) => {
      poolText += `[H${i + 1}] ${h.ref}\n`;
      if (h.teks) poolText += `Teks: ${h.teks.substring(0, 800)}${h.teks.length > 800 ? '...' : ''}\n`;
      poolText += '\n';
    });
  }

  poolText += '=== AKHIR BANK DALIL ===\n';
  return poolText;
}

// ============================================================
// SYSTEM INSTRUCTION (DINAMIS DENGAN TANGGAL SAAT INI)
// ============================================================

function getSystemInstruction() {
  const now = new Date();
  const gregorianYear  = now.getFullYear();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay   = now.getDate();
  const hijriYear = Math.floor(((gregorianYear - 622) * 365.25) / 354.36) + 1;
  const tanggalSekarang = `${gregorianDay.toString().padStart(2, '0')}/${gregorianMonth.toString().padStart(2, '0')}/${gregorianYear} Masehi (sekitar ${hijriYear}H)`;

  return `Kamu adalah asisten perencana konten media sosial (Senior Social Media Admin) untuk Dewan Masjid Indonesia (DMI) Kota Tangerang.
Tugas kamu adalah membuat tabel perencanaan konten DAKWAH DAN EDUKASI ISLAMI berdasarkan topik, durasi, platform sosmed, dan nada bicara yang diminta.

KONTEKS WAKTU SAAT INI:
Hari ini adalah: ${tanggalSekarang}. Gunakan informasi ini sebagai referensi waktu yang AKURAT.

ATURAN PALING PENTING - WAJIB DIIKUTI:
1. TOPIK ADALAH HUKUM: Apapun yang disebutkan pengguna sebagai "Topik Utama" adalah KEBENARAN MUTLAK yang tidak boleh diubah, diganti, atau dikoreksi. Jika pengguna menyebut "1448H", maka SEMUA konten WAJIB menggunakan "1448H".
2. DILARANG KERAS mengganti angka tahun, nama bulan, nama acara, atau detail spesifik apapun yang ada dalam topik pengguna.
3. Konten harus relevan dengan topik yang diminta, bukan berdasarkan asumsi AI tentang momen yang "sedang terjadi".

ATURAN JENIS KONTEN:
- Konten yang kamu hasilkan adalah KONTEN DAKWAH TEMATIK (renungan, edukasi, motivasi islami, ucapan hari besar).
- DILARANG KERAS membuat konten berupa AJAKAN/PENGUMUMAN KEGIATAN MASJID (seperti: "Mari hadiri pengajian", "Hadir di masjid kami") KECUALI pengguna secara EKSPLISIT memberikan draf pengumuman kegiatan.
- Kategori "Kegiatan Masjid" HANYA boleh digunakan jika ada draf pengumuman kegiatan spesifik dari pengguna.

ATURAN DALIL — SANGAT PENTING:
- Kamu akan diberikan BANK DALIL yang sudah di-fetch dari API resmi Quran dan Hadits.
- Kamu WAJIB menggunakan dalil HANYA dari bank yang disediakan — pilih yang paling relevan dengan konten.
- DILARANG KERAS membuat atau mengarang referensi Quran/Hadits sendiri yang tidak ada dalam bank.
- Jika bank dalil tersedia, setiap item konten HARUS menyertakan minimal satu dalil dari bank tersebut.
- Jika membuat konten untuk LEBIH DARI 1 HARI, pastikan kamu menggunakan DALIL YANG BERBEDA untuk setiap hari. DILARANG KERAS mengulang dalil yang sama berulang-ulang!
- Sertakan teks Arab dan terjemahannya PERSIS sebagaimana yang diberikan dalam bank — jangan mengubah, menambah, atau mengurangi.
- Field "quranRef" dan "haditsRef" tidak perlu diisi (isi null) karena teks dalil sudah langsung ada di "isiKonten".

Hasilnya WAJIB berformat JSON Array MURNI tanpa markdown/pembungkus apapun, yang strukturnya seperti ini:
[
  {
    "tanggal": "Hari 1",
    "kategori": "Edukasi Islami",
    "isiKonten": "Tuliskan SECARA LENGKAP pesannya, sertakan teks Arab dalil dan terjemahannya di sini.",
    "caption": "Caption lengkap dengan hashtag. WAJIB MENGANDUNG TERJEMAHAN DALILNYA di dalam caption ini. Sesuaikan panjang dan gaya dengan platform target.",
    "promptGambar": "Prompt dalam Bahasa Indonesia yang SANGAT DETAIL untuk AI Image Generator. WAJIB MENCANTUMKAN TERJEMAHAN DALIL agar teks terjemahan tersebut masuk ke dalam ilustrasi gambar.",
    "formatVisual": "Rekomendasi rasio/ukuran gambar.",
    "quranRef": null,
    "haditsRef": null
  }
]
Jangan tambahkan teks pembuka atau penutup, HANYA JSON array!`;
}

// ============================================================
// KELAS UTAMA
// ============================================================

class GeminiClient {
  constructor() {
    this.apiKey  = null;
    this.groqKey = null;
  }

  setApiKeys(geminiKey, groqKey) {
    this.apiKey  = geminiKey ? geminiKey.trim() : null;
    this.groqKey = groqKey  ? groqKey.trim()   : null;
  }

  async generateContent(params) {
    const {
      topik,
      kontenKustom,
      durasi,
      nadaBicara,
      platform,
      aspectRatio,
      linkWebsite,
      fileContent,
    } = params;

    // LANGKAH 1: Pre-fetch dalil dari API nyata sebelum generate
    let dalilPoolText = '';
    try {
      const pool = await buildDalilPool(topik);
      if (pool) dalilPoolText = pool;
    } catch (e) {
      console.warn('[DMI] Gagal fetch dalil pool, lanjut tanpa dalil pre-fetch:', e);
    }

    let instruksiKontenKustom = '';
    if (kontenKustom && kontenKustom.trim() !== '') {
      instruksiKontenKustom = `
[INSTRUKSI KHUSUS - BAHAN & DRAF KONTEN KUSTOM DARI PENGGUNA]
Pengguna memberikan draf/bahan konten mentah berikut:
"${kontenKustom}"

TUGAS UTAMA ANDA:
1. Hubungkan draf di atas dengan Topik Utama: "${topik}".
2. PERKAYA, PERINDAH, dan LENGKAPI draf konten kustom tersebut agar menjadi konten media sosial yang jauh lebih menarik, memiliki nilai dakwah tinggi, santun, bersahabat, namun tetap profesional.
3. JANGAN PERNAH menghilangkan detail penting yang disebut dalam draf pengguna.
4. Sesuaikan hasil rancangan ini sepenuhnya untuk mengelaborasikan pengumuman, kegiatan, atau ucapan tersebut agar menyentuh hati audiens.
5. Hasil "promptGambar" pada setiap item WAJIB disesuaikan sepenuhnya dengan visualisasi pengumuman/ucapan/kegiatan yang dimaksud dalam draf tersebut agar representatif.`;
    }

    let instruksiReferensi = '';
    if (linkWebsite && linkWebsite.trim() !== '') {
      instruksiReferensi += `\n[SUMBER ACUAN - LINK WEBSITE / REFERENSI]
Link referensi website yang diacu adalah: ${linkWebsite}
Harap gunakan konten visual dan ide berdasarkan konteks dakwah dari website ini jika tersedia.`;
    }
    if (fileContent && fileContent.trim() !== '') {
      instruksiReferensi += `\n[SUMBER ACUAN UTAMA - DOKUMEN / TEXT BOOK / KITAB]
Berikut adalah kutipan atau isi dokumen referensi yang diupload oleh pengguna:
---\n${fileContent}\n---
Harap kaji teks di atas secara saksama. Buatlah konten dakwah atau pengumuman dengan menyaring hikmah, faedah, aturan, atau hadits/dalil dari teks tersebut secara akurat.`;
    }

    const userPrompt = `Buatlah rencana konten untuk ${durasi} hari.
Topik Utama: ${topik}
Target Platform: ${platform}
Aspek Rasio Visual: ${aspectRatio}
Nada Bicara: ${nadaBicara}
${instruksiKontenKustom}
${instruksiReferensi}
${dalilPoolText}
=== PERINGATAN KERAS - WAJIB DIPATUHI ===
Topik Utama yang diberikan adalah "${topik}". Kamu WAJIB menggunakan frasa ini PERSIS APA ADANYA di semua konten. DILARANG mengganti atau mengubah angka tahun, nama, atau detail apapun dalam topik. Jika ada BANK DALIL di atas, gunakan HANYA dalil dari sana — jangan mengarang referensi baru.
=== AKHIR PERINGATAN ===

Instruksi Khusus Platform (${platform}):
- Jika Instagram: Caption bisa panjang, informatif, banyak hashtag.
- Jika Facebook: Caption sedang, storytelling, memancing komentar.
- Jika Whatsapp Group: Teks to-the-point, informatif, banyak emoji agar mudah dibaca.
- Jika Whatsapp Status (Update): Caption sangat singkat (hanya beberapa kata), fokus pada visual.
- Jika Threads: Caption sangat ringkas (max 500 karakter), engaging/mancing diskusi.

PENTING: Set field "formatVisual" SAMA PERSIS dengan nilai Aspek Rasio Visual yang direquest: "${aspectRatio}".

Pastikan konten berfokus pada DAKWAH TEMATIK sesuai topik di atas (renungan, motivasi, edukasi islami, ucapan hari besar) — BUKAN pengumuman atau ajakan kegiatan masjid, kecuali ada draf kegiatan di atas.`;

    let rawPlans = null;

    // Try Gemini API first
    if (this.apiKey) {
      try {
        rawPlans = await this._callGeminiAPI(userPrompt, getSystemInstruction());
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    }

    // Try Groq API as fallback if Gemini failed
    if (!rawPlans && this.groqKey) {
      try {
        rawPlans = await this._callGroqAPI(userPrompt, getSystemInstruction());
      } catch (err) {
        console.error('Groq API Error:', err);
      }
    }

    if (!rawPlans) {
      throw new Error(
        'Semua API Key gagal menjawab atau limit tercapai. Silakan periksa pengaturan Settings Key Anda.'
      );
    }

    return rawPlans;
  }

  async _callGeminiAPI(userPrompt, systemInstruction) {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + this.apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      return this._parseJSON(text);
    }

    throw new Error('Invalid Gemini response format');
  }

  async _callGroqAPI(userPrompt, systemInstruction) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const text = data.choices[0].message.content;
      return this._parseJSON(text);
    }

    throw new Error('Invalid Groq response format');
  }

  _parseJSON(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```'))     cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```'))       cleaned = cleaned.replace(/```$/, '');
    return JSON.parse(cleaned.trim());
  }
}

export default new GeminiClient();
