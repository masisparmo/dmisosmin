# 🟢 DMI SOSMIN - Sistem Perencanaan Konten & Pembuat Poster Dakwah Digital

Selamat datang di repositori resmi **DMI SOSMIN**! Aplikasi ini merupakan solusi full-stack modern yang dirancang khusus untuk keperluan **Dewan Masjid Indonesia (DMI) Kota Tangerang** dalam merancang, memproduksi, dan mendistribusikan konten media sosial dakwah secara cepat, terstruktur, dan selaras dengan identitas visual keislaman.

Aplikasi ini menggabungkan kecanggihan kecerdasan buatan **Google Gemini 2.5** sebagai generator konten draf/copywriting, serta **HTML5 Canvas 2D Rendering Engine** sebagai penyedia draf desain atau poster dakwah digital siap pakai yang dinamis. 

---

## 📌 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Alur Kerja Sistem](#-alur-kerja-sistem)
3. [Arsitektur Teknis](#%EF%B8%8F-arsitektur-teknis)
4. [Instalasi & Penggunaan Lokal](#%EF%B8%8F-instalasi--penggunaan-lokal)
5. [Struktur File](#-struktur-file)
6. [Konfigurasi Lingkungan (Environment Variables)](#%EF%B8%8F-konfigurasi-lingkungan-environment-variables)
7. [Panduan Langkah Penggunaan Aplikasi](#%EF%B8%8F-panduan-langkah-penggunaan-aplikasi)
8. [Modifikasi & Pengembangan Masa Depan](#%EF%B8%8F-modifikasi--pengembangan-masa-depan)

---

## 🌟 Fitur Utama

### 1. Perencana Konten AI Multi-Hari (Content Planner Generator)
* **Kecerdasan Buatan Terintegrasi:** Menggunakan model **Gemini 2.5 Flash** yang diakses server-side melalui SDK `@google/genai` terbaru.
* **Platform-Aware Formatting:** Aturan copywriting secara otomatis disesuaikan dengan platform target pilihan Anda:
  - **Instagram:** Caption panjang, kaya dengan narasi informatif dan hashtag relevan.
  - **Facebook:** Format storytelling yang memancing diskusi hangat di kolom komentar.
  - **WhatsApp Group:** Teks ringkas, poin-poin terstruktur (*bullet points*), dan pemakaian emoji yang ramah visual.
  - **WhatsApp Status (Update):** Kalimat super singkat yang fokus memperkuat grafis gambar.
  - **Threads:** Batasan teks ringkas (maksimal 500 karakter) yang memicu diskusi interaktif.

### 2. Integrasi Sumber Referensi & Kitab Referensi (.txt)
* **Website Acuan:** Kolom opsional untuk menyertakan tautan/URL rujukan utama agar AI menyelaraskan konteks dakwah berdasarkan materi laman tersebut.
* **Unggah Kitab / Buku Teks (.txt):** Dukungan penuh untuk mengunggah file teks materi, kutipan kitab, kompilasi hadits, atau catatan pengumuman masjid hingga **10 MB**. AI akan menggunakan isi dokumen tersebut sebagai *single source of truth* untuk memformulasi dalil, kisah, dan ajaran agar terhindar dari halusinasi data (AI Hallucination).

### 3. Editor Desain Poster Dakwah (HTML5 Canvas Engine)
* **Visualisasi Draf Instan:** Klik setiap ide konten yang dihasilkan untuk membuka layar preview poster dakwah resolusi tinggi berbasis rasio terpilih (1:1 Square atau 9:16 Portrait).
* **Generator Logo Vektor Kubah Emas:** Jika pengurus masjid belum mengunggah file logo custom, canvas modern akan merender ilustrasi vektor emas berupa Kubah Masjid megah bersinar, lengkap dengan bintang dan bulan sabit, secara dinamis lewat kode HTML5 Canvas 2D.
* **Upload Custom Logo:** Mendukung pengunggahan logo masjid (.png atau .jpg) Anda sendiri untuk menggantikan logo generator bawaan.
* **Nama Organisasi Dinamis:** Kolom edit langsung untuk mengubah nama institusi di bagian bawah poster (contoh: mengganti "DMI KOTA TANGERANG" menjadi "MASJID RAYA AL-A'ZHOM").
* **Palet Warna Identitas:** Menyediakan preset warna instan khas DMI (Emerald Green `#047857`, Amber/Gold `#d97706`, Slate Grey, dll.) serta **Color Picker Hex Kustom** jika ingin memilih warna identitas masjid Anda sendiri.

### 4. Ekspor Data Excel (.xlsx) & Download Poster
* **Bulk Download Plan:** Blok rencana konten multi-hari dapat diekspor langsung menjadi file Excel terstruktur dalam satu kali klik melalui pustaka `xlsx` agar siap diunggah ke alat penjadwalan massal seperti Meta Business Suite atau Buffer.
* **Download Seni Poster (.png):** Unduh langsung desain poster beresolusi tajam sesuai rasio aspek terpilih ke komputer Anda dalam hitungan detik.

---

## 🔄 Alur Kerja Sistem

```
[User Input] ────> [Formulir Sidebar]
  - Topik & Durasi
  - Referensi Website / File (.txt)
  - Nada Bicara & Platform
       │
       ▼
 [Koneksi API] ───> [/api/generate] (Backend Express)
       │              └─ Menghubungi Google Gemini 2.5 Flash API
       │                 Menyelaraskan draf dengan Kitab (.txt) / Referensi
       ▼
 [Struktur Data] ──> [Format JSON Array yang Tervalidasi]
       │
       ▼
  [UI Renderer] ──> [Kotak Dashboard Hari 1 s.d Hari N]
                     ├─ Salin Copywriting & Prompt Gambar sekali klik
                     └─ Buka Modal Desain Poster (Canvas Engine)
```

---

## 🛠️ Arsitektur Teknis

Aplikasi ini mengadopsi model **Full-Stack SPA (Single Page Application)** untuk memberikan fungsionalitas server-side yang aman untuk API Key, serta responsivitas tingkat tinggi pada sisi klien:

### 💻 Sisi Klien (Frontend)
* **Framework:** React 19 dengan TypeScript.
* **Gaya & Layout:** Tailwind CSS v4 untuk kepresisian layout responsif, adaptif dari layar smartphone hingga monitor desktop Ultra-wide.
* **Animasi:** Framer Motion (`motion/react`) untuk transisi menu sidebar, efek hover tombol, dan penampilan panel secara elegan.
* **Ikonografi:** Lucide-React untuk ikon visual yang seragam dan bersih.
* **Pemroses Data:** SheetJS (`xlsx`) untuk konversi tabel rencana ke format spreadsheet biner.

### 🖥️ Sisi Server (Backend)
* **Server Framework:** Express.js dalam format TypeScript modern.
* **Compiling & Bundling:** Dikompilasi menggunakan `esbuild` yang mengemas script backend menjadi file CJS tunggal (`dist/server.cjs`) dalam proses rilis produksi. Metode pengemasan CJS ini melompati pengecekan ketat runtime ES-Modules Node.js agar rilis di Cloud Run atau VPS berjalan stabil tanpa gangguan dependensi path.
* **Kombinasi Dev:** Diuji lokal menggunakan `tsx` (TypeScript Execute) demi hot-reload server yang lincah tanpa latensi waktu build.

---

## ⚙️ Instalasi & Penggunaan Lokal

Ikuti petunjuk langkah demi langkah di bawah ini untuk mengaktifkan **DMI SOSMIN** pada komputer lokal Anda:

### Prasyarat
* **Node.js** v18+ atau v20+ terinstal di komputer Anda.
* **NPM** (bawaan dari Node.js).
* **Gemini API Key** yang bisa didapatkan secara gratis dari Google AI Studio.

### Langkah 1: Kloning Repositori & Instal Dependensi
```bash
# Masuk ke direktori proyek Anda
cd dmi-sosmin

# Instal seluruh dependensi yang tertera di package.json
npm install
```

### Langkah 2: Konfigurasi Environment File
Buat file baru bernama `.env` di direktori utama, atau salin dari berkas contoh:
```bash
cp .env.example .env
```
Isikan nilai kunci API Gemini Anda ke dalam berkas tersebut:
```env
GEMINI_API_KEY=isi_kunci_api_gemini_anda_di_sini
```

### Langkah 3: Menjalankan Server Pengembangan (Development Mode)
Aplikasi ini menjalankan backend Express dan kompilasi modul frontend secara simultan pada single port (`port: 3000`) demi menghindari isu CORS:
```bash
npm run dev
```
Setelah jalan, buka peramban Anda di alamat:
**`http://localhost:3000`**

### Langkah 4: Membangun Aplikasi untuk Produksi (Build for Production)
Untuk membundel aplikasi ke versi produksi yang siap dideploy ke server Cloud Run/Vercel/DigitalOcean:
```bash
npm run build
```
Perintah ini akan melakukan dua aksi:
1. Membangun static files frontend React menggunakan Vite ke dalam folder `/dist`.
2. Mengompilasi `server.ts` menjadi file CommonJS teroptimasi di `/dist/server.cjs` menggunakan Esbuild.

Untuk menjalankannya di server produksi, jalankan:
```bash
npm start
```

---

## 📂 Struktur File

Sistem diatur secara modular untuk memudahkan pelacakan kode:

```
├── .env.example             # Contoh deklarasi variabel lingkungan
├── package.json             # Pengelolaan pustaka, script build & start
├── server.ts                # Kode utama Express Backend & interaksi API Gemini
├── vite.config.ts           # Konfigurasi bundling Vite + Tailwind CSS
├── index.html               # Starter HTML5 Shell
├── metadata.json            # Hub konfigurasi metadata aplikasi AI Studio
├── src
│   ├── main.tsx             # Entry point utama React UI
│   ├── index.css            # Pengaturan global CSS, Tema Tailwind, & Impor Font
│   ├── types.ts             # Definisi interface TypeScript (ContentPlanItem)
│   ├── App.tsx              # Halaman Dashboard, Sidebar input formulir, & Layouting utama
│   └── components
│       └── CanvasPreviewModal.tsx  # Layout Editor Poster & Kode Render HTML5 Canvas 2D
```

---

## 🔑 Konfigurasi Lingkungan (Environment Variables)

Aplikasi memiliki satu kunci rahasia utama yang dikelola di sisi backend demi menjaga privasi dan keamanan:

| Nama Variabel | Wajib/Opsional | Deskripsi |
|---|---|---|
| `GEMINI_API_KEY` | **WAJIB** | Kunci token autentikasi Google GenAI API untuk mengakses model `gemini-2.5-flash` di server. |

*Catatan: Jangan pernah mengunggah file `.env` yang berisi kode API asli Anda ke repositori publik seperti GitHub.*

---

## 🗺️ Panduan Langkah Penggunaan Aplikasi

Berikut adalah panduan bagi admin sosial media atau pengurus takmir masjid dalam mengeksploitasi fitur-fitur yang ada:

### Langkah Awal: Input Topik & Sumber
1. Pastikan panel hijau **DMI SOSMIN** terbuka di bagian kiri layar. Jika menggunakan HP, ketuk ikon garis tiga di pojok kanan atas untuk membukanya.
2. Masukkan **Topik Utama** konten (misalnya: *Keutamaan Shalat Subuh Berjamaah*).
3. (Opsional) Jika memiliki rujukan dari website dakwah, ketikkan alamat lengkapnya pada kolom **Link Website Acuan**.
4. (Opsional) Jika Anda ingin membuat materi bedah kitab, pengumuman jadwal kegiatan Ramadhan masjid, atau kompilasi hadits tertentu, unggah berkas teks Anda menggunakan tombol **Pilih File .txt (Referensi)**.
5. Masukkan instruksi tambahan pada kolom **Draf Konten Kustom** (misalnya: *Sebutkan bahwa penceramahnya adalah Ustadz H. Ahmad dan acara dimulai pukul 04.30 WIB*).

### Langkah Kedua: Atur Parameter AI & Lakukan "Generate"
1. Atur **Durasi Plan** dalam format hari (bisa memilih pilihan cepat seperti 1, 3, 5, 7 hari, atau mengetik angka kustom Anda sendiri).
2. Tentukan **Nada Bicara** yang paling cocok bagi jamaah Anda (misalnya: *Edukasi Santai*, *Sangat Islami & Formal*, *Ajakan Hangat*, atau *Menggugah Jiwa*).
3. Pilih **Platform Target** seperti *Instagram* atau *WhatsApp Group*.
4. Tentukan **Aspek Rasio Visual** yang diinginkan.
5. Tekan tombol oranye terang bertuliskan **Buat Rencana Konten ✨**. Tunggu loading beberapa detik selagi Gemini memformulasikan konten dakwah terbaiknya untuk Anda.

### Langkah Ketiga: Manajemen Hasil Konten & Pembuatan Poster
1. Rencana konten harian Anda akan tampil dalam bentuk kartu-kartu informatif di sisi kanan layar secara berurutan.
2. Setiap kartu menyediakan informasi sub-topik, tanggal tayang, postingan teks lengkap (caption), prompt gambar AI, dan rasio visual rekomendasi.
3. Anda dapat memodifikasi isi teks pada kartu secara langsung jika merasa ada kalimat yang perlu disesuaikan.
4. Gunakan tombol **Salin** dengan ikon klipboard untuk menyalin caption secara langsung ke platform sosial media Anda.
5. Tekan tombol **Pratinjau Poster 🎨** untuk beralih ke layar pembuatan poster dakwah digital.
6. Di dalam modal Pratinjau Poster:
   - Ketik nama masjid Anda pada kolom **Nama Organisasi / Masjid** untuk merubah teks footer pada poster secara real-time.
   - Pilihlah palet warna background yang diinginkan, atau tentukan kode warna RGB kustom memakai pemilih warna Hex yang interaktif.
   - Unggah logo khas masjid Anda, atau biarkan ilustrasi estetis **Kubah Emas Vektor** menghiasi struktur poster Anda.
   - Jika sudah puas dengan tampilannya, tekan tombol **Unduh Poster (.png)** untuk menyimpan grafis siap pakai berkualitas tinggi tersebut.

### Langkah Keempat: Ekspor Rencana Kerja ke Excel
Bila Anda merancang jadwal jangka panjang (misalnya 7 s.d. 30 hari), klik tombol hijau bertuliskan **Ekspor ke Excel (.xlsx)** di bawah judul header untuk mendapatkan tabel kerja rapi yang dapat dibagikan kepada tim dakwah lainnya.

---

## 🚀 Modifikasi & Pengembangan Masa Depan

Bagi para developer yang ingin melakukan modifikasi struktur fungsional aplikasi ini:

### 1. Menambahkan Format Platform & Aspek Rasio Baru
Anda dapat dengan mudah mendaftarkan asio rasio atau nama jejaring sosial media baru dengan memodifikasi variabel `ASPECT_RATIOS` di bagian atas `/src/App.tsx`:
```typescript
export const ASPECT_RATIOS: Record<string, string[]> = {
  "Instagram": ["1:1 (Square)", "4:5 (Portrait)", "9:16 (Story/Reels)"],
  "TikTok": ["9:16 (Vertical)"], // Contoh menambahkan platform baru
  // ...
};
```

### 2. Mengharmoniskan Aturan Penafsiran prompt Gemini
Jika Anda menghendaki gaya penulisan AI yang lebih spesifik atau kaku, Anda dapat menyunting konstanta `systemInstruction` di baris `25` berkas `/server.ts` untuk menyematkan instruksi teologi murni atau struktur tata bahasa yang diinginkan.

### 3. Modifikasi Dimensi Canvas & Elemen Vektor Poster
Untuk merubah ukuran kanvas dasar (default: `1080` x `1080` untuk Square, atau `1080` x `1920` untuk Portrait), perhatikan modul draw di `/src/components/CanvasPreviewModal.tsx`. Canvas diatur sedemikian rupa agar tidak blur saat diunduh dengan melipatgandakan resolusi internal sebelum proses download berlangsung.

---

*DMI SOSMIN - Memudahkan Dakwah Digital Masjid Di Era Modern.*  
*Dukung Kemakmuran Masjid, Dekatkan Jamaah Melalui Konten Visual Berkualitas.*
