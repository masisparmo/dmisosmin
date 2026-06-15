/**
 * Gemini Client - Menangani API calls ke Google Gemini secara langsung dari browser
 */

function getSystemInstruction() {
  const now = new Date();
  // Hitung tahun Hijriyah perkiraan (akurat ±1 tahun)
  const gregorianYear = now.getFullYear();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();
  // Rumus perkiraan konversi Gregorian -> Hijriyah
  const hijriYear = Math.floor(((gregorianYear - 622) * 365.25) / 354.36) + 1;
  const tanggalSekarang = `${gregorianDay.toString().padStart(2,'0')}/${gregorianMonth.toString().padStart(2,'0')}/${gregorianYear} Masehi (sekitar ${hijriYear}H)`;

  return `Kamu adalah asisten perencana konten media sosial (Senior Social Media Admin) untuk Dewan Masjid Indonesia (DMI) Kota Tangerang.
Tugas kamu adalah membuat tabel perencanaan konten DAKWAH DAN EDUKASI ISLAMI berdasarkan topik, durasi, platform sosmed, dan nada bicara yang diminta.

KONTEKS WAKTU SAAT INI:
Hari ini adalah: ${tanggalSekarang}. Gunakan informasi ini sebagai referensi waktu yang AKURAT.

ATURAN PALING PENTING - WAJIB DIIKUTI:
1. TOPIK ADALAH HUKUM: Apapun yang disebutkan pengguna sebagai "Topik Utama" adalah KEBENARAN MUTLAK yang tidak boleh diubah, diganti, atau dikoreksi. Jika pengguna menyebut "1448H", maka SEMUA konten WAJIB menggunakan "1448H" - bukan 1445H, 1446H, atau angka lain apapun.
2. DILARANG KERAS mengganti angka tahun, nama bulan, nama acara, atau detail spesifik apapun yang ada dalam topik pengguna dengan versi yang berbeda.
3. Konten harus relevan dengan topik yang diminta, bukan berdasarkan asumsi AI tentang momen yang "sedang terjadi".

ATURAN JENIS KONTEN - SANGAT PENTING:
- Konten yang kamu hasilkan adalah KONTEN DAKWAH TEMATIK (renungan, edukasi, motivasi islami, ucapan hari besar) berdasarkan topik yang diberikan.
- DILARANG KERAS membuat konten berupa AJAKAN/PENGUMUMAN KEGIATAN MASJID (seperti: "Mari hadiri pengajian", "Hadir di masjid kami", "Daftarkan diri ke sekretariat") KECUALI pengguna secara EKSPLISIT memberikan draf pengumuman kegiatan di kolom "Draf Konten Kustom".
- Kategori "Kegiatan Masjid" HANYA boleh digunakan jika ada draf pengumuman kegiatan spesifik dari pengguna. Untuk topik dakwah tematik, gunakan kategori seperti: "Edukasi Islami", "Motivasi Islami", "Renungan", "Mutiara Hikmah", "Ucapan Islami", dll.

KEWAJIBAN DALIL - HARUS DIPENUHI SETIAP ITEM:
Setiap item konten dalam JSON array WAJIB menyertakan minimal SATU referensi dalil yang relevan dan terbukti valid (quranRef ATAU haditsRef tidak boleh keduanya null sekaligus).
- Pilih ayat Al-Qur'an ATAU Hadits yang BENAR-BENAR relevan dengan isi konten dan topik yang diminta.
- "quranRef": berisi {"surah": nomor_surah, "ayat": nomor_ayat}. Contoh untuk Al-Baqarah ayat 261: {"surah": 2, "ayat": 261}. Isi null jika kamu menggunakan hadits sebagai gantinya.
- "haditsRef": berisi {"perawi": "nama_perawi_dalam_bahasa_inggris", "nomor": "nomor_hadits"}. Contoh untuk Bukhari no 1: {"perawi": "bukhari", "nomor": "1"}. Perawi yang didukung: bukhari, muslim, al-tirmidhi, abu-dawood, ibn-majah, an-nasai. Isi null jika kamu menggunakan quranRef sebagai gantinya.
- PASTIKAN nomor surah, ayat, dan nomor hadits adalah BENAR dan ADA di kitab tersebut. Jangan mengarang referensi yang tidak ada.

Hasilnya WAJIB berformat JSON Array MURNI tanpa markdown/pembungkus apapun, yang strukturnya seperti ini:
[
  {
    "tanggal": "Hari 1",
    "kategori": "Edukasi Islami",
    "isiKonten": "Tuliskan SECARA LENGKAP pesannya. (Sistem akan otomatis mengganti teks ini dengan teks Arab jika quranRef/haditsRef valid).",
    "caption": "Caption lengkap dengan hashtag. Sesuaikan panjang dan gaya dengan platform target.",
    "promptGambar": "Prompt dalam Bahasa Indonesia yang SANGAT DETAIL untuk AI Image Generator.",
    "formatVisual": "Rekomendasi rasio/ukuran gambar.",
    "quranRef": null,
    "haditsRef": null
  }
]
Jangan tambahkan teks pembuka atau penutup, HANYA JSON array!`;
}

class GeminiClient {
  constructor() {
    this.apiKey = null;
    this.groqKey = null;
  }

  setApiKeys(geminiKey, groqKey) {
    this.apiKey = geminiKey ? geminiKey.trim() : null;
    this.groqKey = groqKey ? groqKey.trim() : null;
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

    let instruksiKontenKustom = '';
    if (kontenKustom && kontenKustom.trim() !== '') {
      instruksiKontenKustom = `
[INSTRUKSI KHUSUS - BAHAN & DRAF KONTEN KUSTOM DARI PENGGUNA]
Pengguna memberikan draf/bahan konten mentah berikut:
"${kontenKustom}"

TUGAS UTAMA ANDA:
1. Hubungkan draf di atas dengan Topik Utama: "${topik}".
2. PERKAYA, PERIS, PERINDAH, dan LENGKAPI draf konten kustom tersebut agar menjadi konten media sosial yang jauh lebih menarik, memiliki nilai dakwah tinggi, santun, bersahabat, namun tetap profesional.
3. JANGAN PERNAH menghilangkan detail penting yang disebut dalam draf pengguna.
4. Sesuaikan hasil rancangan ini sepenuhnya untuk mengelaborasikan pengumuman, kegiatan, atau ucapan tersebut agar menyentuh hati audiens.
5. Hasil "promptGambar" pada setiap item WAJIB disesuaikan sepenuhnya dengan visualisasi pengumuman/ucapan/kegiatan yang dimaksud dalam draf tersebut agar representatif.`;
    }

    let instruksiReferensi = '';
    if (linkWebsite && linkWebsite.trim() !== '') {
      instruksiReferensi += `\n[SUMBER ACUAN - LINK WEBSITE / REFERENSI]
Link referensi website yang diacu adalah: ${linkWebsite}
Harap gunakan konten visual and ide berdasarkan konteks dakwah dari website ini jika tersedia.`;
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

=== PERINGATAN KERAS - WAJIB DIPATUHI ===
Topik Utama yang diberikan adalah "${topik}". Kamu WAJIB menggunakan frasa ini PERSIS APA ADANYA di semua konten yang kamu buat. DILARANG KERAS mengganti, mengubah, atau "mengoreksi" angka tahun, nama, atau detail apapun yang ada dalam topik tersebut. Jika topik menyebut "1448H", tulis "1448H" - bukan angka lain. Jika topik menyebut "Tahun Baru Hijriyah", maka konten harus tentang Tahun Baru Hijriyah - bukan Ramadan, Idul Fitri, atau momen lainnya.
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

    // Verify and enrich content with actual Quran/Hadith API data
    const verifiedPlans = await this._verifyAndEnrichPlans(rawPlans);
    return verifiedPlans;
  }

  async _verifyAndEnrichPlans(plans) {
    if (!Array.isArray(plans)) return plans;

    const enrichedPlans = await Promise.all(plans.map(async (plan) => {
      let extraText = '';

      // Quran Verification
      if (plan.quranRef && plan.quranRef.surah && plan.quranRef.ayat) {
        try {
          const s = plan.quranRef.surah;
          const a = plan.quranRef.ayat;
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${s}:${a}/editions/quran-uthmani,id.indonesian`);
          if (res.ok) {
            const data = await res.json();
            const arabic = data.data[0].text;
            const indo = data.data[1].text;
            const surahName = data.data[0].surah.englishName;
            extraText += `[QS. ${surahName} ${s}:${a}]\n${arabic}\n\nArtinya: "${indo}"\n\n`;
          }
        } catch (e) {
          console.error('Quran API Error:', e);
        }
      }

      // Hadith Verification
      if (plan.haditsRef && plan.haditsRef.perawi && plan.haditsRef.nomor) {
        try {
          const p = plan.haditsRef.perawi;
          const n = plan.haditsRef.nomor;
          const apiKey = "10$CGd0ukTrbnIqOA2pSmbC6eHcbWziOl5flme5fUhfYz2o0PKUUiWC"; // Free key provided by user
          const res = await fetch(`https://hadithapi.com/api/hadiths?apiKey=${apiKey}&book=${p}&hadithNumber=${n}`);
          if (res.ok) {
            const data = await res.json();
            if (data.hadiths && data.hadiths.data && data.hadiths.data.length > 0) {
              const hadith = data.hadiths.data[0];
              const arabic = hadith.hadithArabic;
              const indo = hadith.hadithIndonesian || hadith.hadithEnglish || "(Terjemahan tidak tersedia di API)";
              const status = hadith.status || "Tidak diketahui statusnya";
              extraText += `[HR. ${p.toUpperCase()} No. ${n} - Status: ${status}]\n${arabic}\n\nArtinya: "${indo}"\n\n`;
            } else {
                extraText += `[Catatan: Referensi HR. ${p} No. ${n} diberikan oleh AI, namun tidak ditemukan di database verifikasi otomatis]\n\n`;
            }
          }
        } catch (e) {
          console.error('Hadith API Error:', e);
        }
      }

      // Prepend verified text to isiKonten if it exists
      if (extraText) {
        plan.isiKonten = extraText + plan.isiKonten;
      }

      return plan;
    }));

    return enrichedPlans;
  }

  async _callGeminiAPI(userPrompt, systemInstruction) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + this.apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.error?.message || `Gemini API Error: ${response.status}`
      );
    }

    const data = await response.json();
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content
    ) {
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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(
        errData.error?.message || `Groq API Error: ${response.status}`
      );
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
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  }
}

export default new GeminiClient();
