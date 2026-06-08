/**
 * Gemini Client - Menangani API calls ke Google Gemini secara langsung dari browser
 */

const SYSTEM_INSTRUCTION = `Kamu adalah asisten perencana konten media sosial (Senior Social Media Admin) untuk Dewan Masjid Indonesia (DMI) Kota Tangerang.
Tugas kamu adalah membuat tabel perencanaan konten berdasarkan topik, durasi, platform sosmed, dan nada bicara yang diminta.
Hasilnya WAJIB berformat JSON Array MURNI tanpa markdown/pembungkus apapun, yang strukturnya seperti ini:
[
  {
    "tanggal": "Hari 1",
    "kategori": "Edukasi Islami",
    "isiKonten": "Tuliskan SECARA LENGKAP dan NYATA teks kutipan, terjemahan ayat Al-Qur'an, Teks Hadits, atau pemikiran. JANGAN HANYA DESKRIPSI, melainkan TULISKAN TEKS ASLINYA.",
    "caption": "Caption lengkap dengan hashtag. Sesuaikan panjang dan gaya dengan platform target.",
    "promptGambar": "Prompt dalam Bahasa Indonesia yang SANGAT DETAIL untuk AI Image Generator (seperti Midjourney/Bing/DALL-E).",
    "formatVisual": "Rekomendasi rasio/ukuran gambar (misal: 1080x1080 untuk IG Feed, 9:16 untuk WA Status)"
  }
]
Jangan tambahkan teks pembuka atau penutup, HANYA JSON array!`;

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

Instruksi Khusus Platform (${platform}):
- Jika Instagram: Caption bisa panjang, informatif, banyak hashtag.
- Jika Facebook: Caption sedang, storytelling, memancing komentar.
- Jika Whatsapp Group: Teks to-the-point, informatif, banyak emoji agar mudah dibaca.
- Jika Whatsapp Status (Update): Caption sangat singkat (hanya beberapa kata), fokus pada visual.
- Jika Threads: Caption sangat ringkas (max 500 karakter), engaging/mancing diskusi.

PENTING: Set field "formatVisual" SAMA PERSIS dengan nilai Aspek Rasio Visual yang direquest: "${aspectRatio}".

Pastikan konten relevan untuk kegiatan, edukasi, dan dakwah masjid di Kota Tangerang.`;

    // Try Gemini API first
    if (this.apiKey) {
      try {
        const response = await this._callGeminiAPI(userPrompt);
        return response;
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    }

    // Try Groq API as fallback
    if (this.groqKey) {
      try {
        const response = await this._callGroqAPI(userPrompt);
        return response;
      } catch (err) {
        console.error('Groq API Error:', err);
      }
    }

    throw new Error(
      'Semua API Key gagal menjawab atau limit tercapai. Silakan periksa pengaturan Settings Key Anda.'
    );
  }

  async _callGeminiAPI(userPrompt) {
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
              text: SYSTEM_INSTRUCTION,
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

  async _callGroqAPI(userPrompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
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
