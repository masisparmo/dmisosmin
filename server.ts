import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Wait to initialize ai client until requested to ensure process.env is configured
  let ai: GoogleGenAI | null = null;
  function getGenAI() {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  }

  // API constraints definition for strict JSON response
  const systemInstruction = `Kamu adalah asisten perencana konten media sosial (Senior Social Media Admin) untuk Dewan Masjid Indonesia (DMI) Kota Tangerang.
Tugas kamu adalah membuat tabel perencanaan konten berdasarkan topik, durasi, platform sosmed, dan nada bicara yang diminta.
Hasilnya WAJIB berformat JSON Array MURNI tanpa markdown/pembungkus apapun, yang strukturnya seperti ini:
[
  {
    "tanggal": "Hari 1",
    "kategori": "Edukasi Islami",
    "isiKonten": "Tuliskan SECARA LENGKAP dan NYATA teks kutipan, terjemahan ayat Al-Qur'an, Teks Hadits, atau pemikiran. JANGAN HANYA DESKRIPSI, melainkan TULISKAN TEKS ASLINYA.",
    "caption": "Caption lengkap dengan hashtag. Sesuaikan panjang dan gaya dengan platform target.",
    "promptGambar": "Prompt dalam Bahasa Indonesia yang SANGAT DETAIL untuk AI Image Generator (seperti Midjourney/Bing/DALL-E). WAJIB menyertakan perintah untuk menampilkan/merender teks ayat/hadits/quotes tersebut ke dalam gambar, serta instruksi identitas visual DMI Kota Tangerang seperti menggunakan skema warna hijau zamrud (emerald green), aksen emas/kuning amber, dan menyertakan logo emas 'Dewan Masjid Indonesia (DMI) Kota Tangerang'.",
    "formatVisual": "Rekomendasi rasio/ukuran gambar (misal: 1080x1080 untuk IG Feed, 9:16 untuk WA Status)"
  }
]
Jangan tambahkan teks pembuka atau penutup, HANYA JSON array!`;

  // Content Generation Endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { topik, kontenKustom, durasi, nadaBicara, platform, aspectRatio, linkWebsite, fileContent, apiKeys } = req.body;
      const internalGenAI = getGenAI();

      let instruksiKontenKustom = "";
      if (kontenKustom && kontenKustom.trim() !== "") {
        instruksiKontenKustom = `
[INSTRUKSI KHUSUS - BAHAN & DRAF KONTEN KUSTOM DARI PENGGUNA]
Pengguna memberikan draf/bahan konten mentah berikut:
"${kontenKustom}"

TUGAS UTAMA ANDA:
1. Hubungkan draf di atas dengan Topik Utama: "${topik}".
2. PERKAYA, PERIS, PERINDAH, dan LENGKAPI draf konten kustom tersebut agar menjadi konten media sosial yang jauh lebih menarik, memiliki nilai dakwah tinggi, santun, bersahabat, namun tetap profesional.
3. JANGAN PERNAH menghilangkan detail penting yang disebut dalam draf pengguna (misalnya: jika draf menyebut tanggal acara, jam, lokasi, nama penceramah, jenis pengumuman, doa khusus, atau ucapan selamat, Anda WAJIB mempertahankan data tersebut secara presisi di dalam 'isiKonten' dan 'caption').
4. Sesuaikan hasil rancangan ini sepenuhnya untuk mengelaborasikan pengumuman, kegiatan, atau ucapan tersebut agar menyentuh hati audiens.
5. Hasil "promptGambar" pada setiap item WAJIB disesuaikan sepenuhnya dengan visualisasi pengumuman/ucapan/kegiatan yang dimaksud dalam draf tersebut agar representatif.`;
      }

      let instruksiReferensi = "";
      if (linkWebsite && linkWebsite.trim() !== "") {
        instruksiReferensi += `\n[SUMBER ACUAN - LINK WEBSITE / REFERENSI]
Link referensi website yang diacu adalah: ${linkWebsite}
Harap gunakan konten visual and ide berdasarkan konteks dakwah dari website ini jika tersedia.`;
      }
      if (fileContent && fileContent.trim() !== "") {
        instruksiReferensi += `\n[SUMBER ACUAN UTAMA - DOKUMEN / TEXT BOOK / KITAB]
Berikut adalah kutipan atau isi dokumen referensi yang diupload oleh pengguna:
---\n${fileContent}\n---
Harap kaji teks di atas secara saksama. Buatlah konten dakwah atau pengumuman dengan menyaring hikmah, faedah, aturan, atau hadits/dalil dari teks tersebut secara akurat. JANGAN membuat-buat isi/substansi jika tidak tercantum, pastikan berbasis referensi tersebut!`;
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

      let responseText: string | null = null;

      // Tier 1: Internal API Key
      if (internalGenAI && !responseText) {
        let retries = 2;
        while (retries > 0 && !responseText) {
          try {
            const response = await internalGenAI.models.generateContent({
              model: "gemini-2.5-flash",
              contents: userPrompt,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              },
            });
            responseText = response.text;
          } catch (err: any) {
            if (err.status === 503 || err.status === "UNAVAILABLE" || err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("429")) {
              retries--;
              if (retries > 0) await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              break; // If other error, skip Tier 1 and go to Tier 2
            }
          }
        }
      }

      // Tier 2: Client provided Gemini Keys
      if (!responseText && apiKeys?.gemini) {
        const gKeys = apiKeys.gemini.split(",").map((k: string) => k.trim()).filter((k: string) => k);
        for (const key of gKeys) {
          try {
            const aiClient = new GoogleGenAI({ apiKey: key });
            const response = await aiClient.models.generateContent({
              model: "gemini-2.5-flash",
              contents: userPrompt,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              },
            });
            responseText = response.text;
            break;
          } catch (err) {
             console.log("Tier 2 Gemini key failed, trying next...");
             continue;
          }
        }
      }

      // Tier 3: Client provided Groq Keys (Llama 3)
      if (!responseText && apiKeys?.groq) {
        const grKeys = apiKeys.groq.split(",").map((k: string) => k.trim()).filter((k: string) => k);
        for (const key of grKeys) {
          try {
            const resData = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: systemInstruction },
                  { role: "user", content: userPrompt }
                ],
                temperature: 0.7
              })
            });
            if (!resData.ok) throw new Error("Groq API Error");
            const data = await resData.json();
            if (data.choices && data.choices.length > 0) {
              responseText = data.choices[0].message.content;
              break;
            }
          } catch (err) {
            console.log("Tier 3 Groq key failed, trying next...");
            continue;
          }
        }
      }

      if (!responseText) {
        throw new Error("Semua API Key (Internal, Gemini Eksternal, dan Groq) gagal menjawab atau limit tercapai. Silakan periksa pengaturan Settings Key Anda.");
      }

      const text = responseText || "[]";
      // Clean markdown explicitly if returned by accident
      let cleaned = text.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json/, "");
      if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```/, "");
      if (cleaned.endsWith("```")) cleaned = cleaned.replace(/```$/, "");
      cleaned = cleaned.trim();

      const jsonArray = JSON.parse(cleaned);

      res.json(jsonArray);
    } catch (error: any) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support client side routing in express
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
