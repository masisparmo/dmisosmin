# Prompt Instuksi untuk Gemini Canvas / AI Studio

Berikut adalah draf prompt komprehensif yang telah disesuaikan dengan revisi-revisi Anda. Prompt ini sudah mencakup fungsionalitas aplikasi penuh, arsitektur fallback API berlapis, serta dukungan multi *API Key* yang digabung secara klien murni.

Anda bisa menyalin teks di bawah ini dan menempelkannya (copy-paste) secara langsung ke antarmuka Gemini Mode Canvas atau AI asisten pendukung lainnya.

---

**Salin Teks Di Bawah Ini:**

Buatkan saya aplikasi web Single Page Application (SPA) murni berbasis HTML5, CSS (menggunakan framework Tailwind CSS via CDN), dan Vanilla JavaScript yang berjalan 100% di sisi klien browser (tanpa Node.js/Backend). Aplikasi bernama "DMI SOSMIN", sebuah sistem asisten perencana konten sosmed dakwah dan pembuat poster digital untuk pengurus Dewan Masjid Indonesia.

Berikut adalah spesifikasi teknis dan fungsional yang WAJIB Anda implementasikan secara struktural di single-file `index.html`:

### 1. Struktur Antarmuka & Sidebar (Tailwind CSS)
- **Tema Visual:** Paduan Emerald Green (khas DMI), Amber/Gold untuk aksen, serta nuansa gelap/terang (Slate).
- **Layout Responsive:** Buat sidebar di sisi kiri untuk merangkum input form (Topik, Link Referensi, File Referensi teks .txt, Durasi hari, Nada Bicara, Target Platform, Aspek Rasio), dan sisi kanan (Dashboard Card) untuk hasil susunan jadwal harian.
- **Header Top-bar:** Tuliskan logo teks "DMI SOSMIN" dan pasang sebuah tombol icon (gerigi/Settings) di pojok kanan atas.

### 2. Generator HTML5 Canvas (Mesin Pratinjau Poster)
- Setiap Card hasil AI akan memiliki tombol "Pratinjau Poster". Ketika ditekan, buka Modal Canvas (dialog box).
- Layout Modal Canvas menggunakan fungsionalitas Native `<canvas>` API JS. 
- Kemampuan khusus Canvas renderer:
  - Fill dasar dengan Background warna terpilih (sediakan panel pilihan warna & input HEX code color-picker).
  - Tuliskan isi teks konten (draf text) murni di tengah canvas dengan logika *word-wrap/text breaking* otomatis khusus JavaScript Canvas API.
  - Tuliskan Nama Organisasi ("DMI KOTA TANGERANG") yang dinamis (bisa diubah dari text input yang ada di atas area Modal Canvas).
  - Jika tidak ada gambar/logo yang diunggah, lukis Vektor Kubah Masjid Emas elegan menggunakan metode Native Canvas API (`ctx.arc`, `ctx.bezierCurveTo`, `ctx.fill`). Jika pengguna mengunggah logo via `<input type="file">`, timpa Kubah Emas itu dengan posisi logo tersebut di tengah-bawah.
- Sediakan tombol "Download Poster" di dekat canvas; gunakan metode `canvas.toDataURL('image/png')` yang diikat di link tag anchor `<a>` sehingga file `.png` langsung terunduh.

### 3. Ekspor ke Ekstemal & Library (SheetJS)
- Tarik library `<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>` pada head tag HTML.
- Sediakan tombol khusus "Export Excel (.xlsx)" di Dashboard untuk membundel array object rencana konten menjadi file Excel terstruktur siap unduh.

### 4. Sistem Modal Settings & Multi-API Keys localStorage
- Tombol Settings di Header berfungsi membuka Modal Pengaturan (Overlay Box).
- Terdapat dua textarea inputan yang dipisahkan untuk menyimpan secret keys:
  1. **Input Gemini Keys:** Menyimpan kombinasi API key Gemini secara jamak dengan pemisah koma (Misal: `AIza..., DIzb..., UIxy...`).
  2. **Input Groq Keys:** Menyimpan kombinasi API key Llama Groq dengan pemisah koma (Misal: `gsk_abc..., gsk_xyz...`).
- Integrasikan dengan `localStorage` JavaScript, jika disave maka sistem menyimpannya di local storage browser agar persisten.

### 5. Strategi Hierarki & Fallback AI (Async Rotational Retry)
Jantung pemrosesan ini ada di fungsi JS Anda saat menangani tombol "Buat Rencana Konten". Wajib gunakan `async/await` dengan alur Fallback berikut untuk menjamin sukses jika ada delay/limit:

- **TIER 1 (Internal Env Gemini API)**: Mulailah memanggil metode internal Gemini JS environment API (apabila ada metode *window.ai* bawaan sistem). Tetap gunakan `try/catch`. Jika unsupported function / catch error di browser tertentu -- lanjutkan ke Tier 2 secara otomatis.
- **TIER 2 (Gemini External REST API - gemini-2.5-flash)**:
  - Bangun loop terhadap daftar Gemini Keys yang di-split dari LocalStorage berjejer koma.
  - Gunakan `fetch()` REST API resmi milik Google ke endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={KUNCI_SEKARANG}`.
  - Jika keys gagal me-response (Status Code 429 Limit, atau Error CATCH), **JANGAN berhenti**, instruksikan perulangan (continue iteration) berpindah menggunakan *KUNCI_SEKARANG* berikutnya (auto-rotate).
  - Jika semua Gemini Keys terkuras habis & gagal, fallback ke TIER 3.
- **TIER 3 (Groq API - llama-3.3-70b-versatile)**:
  - Lakukan logika rotasi API mirip Tier 2 terhadap array Groq Keys dari localStorage.
  - Tembak endpoint OpenAI-compatible Groq di `https://api.groq.com/openai/v1/chat/completions` menggunakan model `llama-3.3-70b-versatile`. 

### 6. System Prompting Format (Penting)
Instruksi bawaan untuk AI yang dikirim dalam request body HTTP di atas wajib memerintahkan AI merespon dengan format JSON.
- **Sangat Penting:** AI harus meresponse struktur String JSON native yang isinya adalah *Array of Objects* yang mengandung key: `hariKe`, `subTopik`, `drafKonten`, `promptGambar`, dan `formatVisual`. Mencegah karakter markdown tilde ganda/triple backticks json di respon.
- Ambil semua state Form, Link Referensi, serta ekstraksi file FileReader JavaScript (jika ada input `.txt` referensi), dan susun sebagai User Prompt.

Susun kode gabungan yang rapi dan elegan, hindari fragmentasi. Fokuskan struktur `index.html` tunggal mencakup keseluruhan ekosistem. Outputkan semua kodenya.
