/**
 * Main Application Logic - DMI SOSMIN Client-Side
 */

import GeminiClient from './gemini-client.js';
import CanvasRenderer from './canvas-renderer.js';

// ============================================
// STATE MANAGEMENT
// ============================================

let appState = {
  contentPlans: [],
  currentPreviewItem: null,
  isLoading: false,
  referenceFiles: [],
};

// ============================================
// UI ELEMENTS
// ============================================

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const contentForm = document.getElementById('contentForm');
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const submitBtn = document.getElementById('submitBtn');
const btnNormal = document.getElementById('btnNormal');
const btnLoading = document.getElementById('btnLoading');
const btnLoadingText = document.getElementById('btnLoadingText');
const errorMsg = document.getElementById('errorMsg');
const contentGrid = document.getElementById('contentGrid');
const emptyState = document.getElementById('emptyState');
const contentCount = document.getElementById('contentCount');
const exportBtn = document.getElementById('exportBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const geminiKeysInput = document.getElementById('geminiKeys');
const groqKeysInput = document.getElementById('groqKeys');
const canvasModal = document.getElementById('canvasModal');
const posterCanvas = document.getElementById('posterCanvas');
const closeCanvasBtn = document.getElementById('closeCanvas');
const downloadPosterBtn = document.getElementById('downloadPoster');
const orgNameInput = document.getElementById('orgName');
const logoUploadInput = document.getElementById('logoUpload');
const colorPalette = document.getElementById('colorPalette');
const hexDisplay = document.getElementById('hexDisplay');

// Loading overlay elements
const loadingOverlay  = document.getElementById('loadingOverlay');
const progressBar     = document.getElementById('progressBar');
const loadingSubtitle = document.getElementById('loadingSubtitle');
const stepEls = [
  document.getElementById('step1'),
  document.getElementById('step2'),
  document.getElementById('step3'),
  document.getElementById('step4'),
];

// Form inputs
const topikInput = document.getElementById('topik');
const kontenKustomInput = document.getElementById('kontenKustom');
const pasteArtikelInput = document.getElementById('pasteArtikel');
const durasiSelect = document.getElementById('durasi');
const durasiCustomInput = document.getElementById('durasiCustom');
const nadaBicaraSelect = document.getElementById('nadaBicara');
const platformSelect = document.getElementById('platform');
const aspectRatioSelect = document.getElementById('aspectRatio');
const fileUploadInput = document.getElementById('fileUpload');
const referenceFilesDiv = document.getElementById('referenceFiles');

// Canvas renderer instance
let canvasRenderer = null;

const ASPECT_RATIOS = {
  'Instagram': ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story/Reels)'],
  'Facebook': ['1:1 (Square)', '16:9 (Landscape)', '4:5 (Portrait)'],
  'Whatsapp Group': ['1:1 (Square)', '16:9 (Landscape)'],
  'Whatsapp Status': ['9:16 (Story)'],
  'Threads': ['1:1 (Square)', '4:5 (Portrait)', '16:9 (Landscape)'],
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
  loadSettingsFromStorage();
  initEventListeners();
  updateAspectRatios();
  initColorPalette();
  canvasRenderer = new CanvasRenderer(posterCanvas);
}

function loadSettingsFromStorage() {
  const savedGemini = localStorage.getItem('dmi_gemini_keys');
  const savedGroq = localStorage.getItem('dmi_groq_keys');
  if (savedGemini) geminiKeysInput.value = savedGemini;
  if (savedGroq) groqKeysInput.value = savedGroq;
}

function initEventListeners() {
  // Sidebar mobile
  openSidebarBtn.addEventListener('click', () => openSidebar());
  closeSidebarBtn.addEventListener('click', () => closeSidebar());
  sidebarOverlay.addEventListener('click', () => closeSidebar());

  // Form submission
  contentForm.addEventListener('submit', handleGenerate);

  // Durasi custom
  durasiSelect.addEventListener('change', (e) => {
    durasiCustomInput.classList.toggle('hidden', e.target.value !== 'custom');
  });

  // Platform change
  platformSelect.addEventListener('change', updateAspectRatios);

  // File upload
  fileUploadInput.addEventListener('change', handleFileUpload);

  // Settings
  settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
  closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
  saveSettings.addEventListener('click', handleSaveSettings);

  // Export
  exportBtn.addEventListener('click', handleExport);

  // Canvas modal
  closeCanvasBtn.addEventListener('click', closeCanvasModal);
  downloadPosterBtn.addEventListener('click', handleDownloadPoster);
  orgNameInput.addEventListener('change', () => canvasRenderer.setOrgName(orgNameInput.value));
  logoUploadInput.addEventListener('change', handleLogoUpload);
}

function initColorPalette() {
  const colors = [
    { name: 'Hijau DMI', value: '#047857' },
    { name: 'Amber/Emas', value: '#d97706' },
    { name: 'Slate', value: '#1e293b' },
    { name: 'Putih Bersih', value: '#ffffff' },
    { name: 'Biru Teduh', value: '#3b82f6' },
  ];

  colors.forEach((color) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = color.name;
    btn.className =
      'w-8 h-8 rounded border-2 transition-all hover:scale-110 cursor-pointer';
    btn.style.backgroundColor = color.value;
    btn.style.borderColor =
      color.value === '#ffffff' ? '#ccc' : color.value;
    btn.addEventListener('click', () => {
      canvasRenderer.setBgColor(color.value);
      hexDisplay.textContent = color.value;
      updateColorPaletteSelection(color.value);
    });
    colorPalette.appendChild(btn);
  });

  // Custom color input
  const customColorLabel = document.createElement('label');
  customColorLabel.title = 'Pilih Warna Kustom';
  customColorLabel.className =
    'relative w-8 h-8 rounded border-2 border-slate-300 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition';
  customColorLabel.innerHTML = '<span class="text-[10px] bg-black/40 text-white font-bold px-0.5 pointer-events-none">HEX</span>';

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = '#047857';
  colorInput.className = 'absolute inset-0 opacity-0 cursor-pointer w-full h-full';
  colorInput.addEventListener('change', (e) => {
    canvasRenderer.setBgColor(e.target.value);
    hexDisplay.textContent = e.target.value;
    updateColorPaletteSelection(e.target.value);
  });

  customColorLabel.appendChild(colorInput);
  colorPalette.appendChild(customColorLabel);
}

function updateColorPaletteSelection(color) {
  const buttons = colorPalette.querySelectorAll('button');
  buttons.forEach((btn) => {
    if (btn.style.backgroundColor === color) {
      btn.style.borderColor = '#fbbf24';
      btn.style.boxShadow = '0 0 0 2px rgba(251, 191, 36, 0.5)';
    } else {
      btn.style.borderColor = btn.style.backgroundColor || '#ccc';
      btn.style.boxShadow = 'none';
    }
  });
}

function updateAspectRatios() {
  const platform = platformSelect.value;
  aspectRatioSelect.innerHTML = '';
  ASPECT_RATIOS[platform].forEach((ratio) => {
    const option = document.createElement('option');
    option.value = ratio;
    option.textContent = ratio;
    aspectRatioSelect.appendChild(option);
  });
}

// ============================================
// FILE & LINK HANDLING
// ============================================

function handleFileUpload(e) {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File terlalu besar. Maksimal 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result || '';
      appState.referenceFiles.push({ name: file.name, content: text });
      renderReferenceFiles();
    };
    reader.readAsText(file);
  });

  e.target.value = '';
}

function renderReferenceFiles() {
  referenceFilesDiv.innerHTML = '';
  if (appState.referenceFiles.length === 0) return;

  const container = document.createElement('div');
  container.className = 'space-y-1.5 mb-2';

  appState.referenceFiles.forEach((file, idx) => {
    const fileTag = document.createElement('div');
    fileTag.className =
      'w-full bg-emerald-900 border border-emerald-700 rounded p-2 flex items-center justify-between text-xs text-white';
    fileTag.innerHTML = `
      <div class="flex items-center gap-2 min-w-0 pr-1">
        <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        <span class="truncate font-semibold text-[11px]" title="${file.name}">${file.name}</span>
      </div>
    `;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className =
      'p-1.5 text-emerald-400 hover:text-red-300 hover:bg-emerald-800 rounded transition';
    removeBtn.innerHTML =
      '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
    removeBtn.addEventListener('click', () => {
      appState.referenceFiles.splice(idx, 1);
      renderReferenceFiles();
    });
    fileTag.appendChild(removeBtn);
    container.appendChild(fileTag);
  });

  referenceFilesDiv.appendChild(container);
}

// ============================================
// LOADING PROGRESS UI
// ============================================

// Definisi fase proses:
// step 0: Mengambil Dalil (0% → 30%)
// step 1: Mengirim ke AI  (30% → 55%)
// step 2: Memproses       (55% → 90%)
// step 3: Selesai         (100%)

const PROGRESS_STEPS = [
  { pct: 15,  label: 'Mengambil dalil dari API Quran & Hadits...', btn: 'Ambil Dalil...' },
  { pct: 50,  label: 'Mengirimkan data ke AI untuk diproses...', btn: 'Kirim ke AI...' },
  { pct: 80,  label: 'AI sedang menyusun rencana konten dakwah...', btn: 'AI Memproses...' },
  { pct: 100, label: 'Konten berhasil dibuat! Menampilkan...', btn: 'Selesai ✓' },
];

function showLoading() {
  loadingOverlay.classList.remove('hidden');
  progressBar.style.width = '0%';
  loadingSubtitle.textContent = 'Menyiapkan...'
  stepEls.forEach(s => { s.className = 'text-slate-300 transition-colors duration-300'; });
  // Tombol
  btnNormal.classList.add('hidden');
  btnLoading.classList.remove('hidden');
  btnLoadingText.textContent = 'Memproses...';
  submitBtn.disabled = true;
}

function setProgress(stepIndex) {
  const step = PROGRESS_STEPS[stepIndex];
  if (!step) return;
  // Update bar & subtitle
  progressBar.style.width = step.pct + '%';
  loadingSubtitle.textContent = step.label;
  btnLoadingText.textContent = step.btn;
  // Aktifkan step indicator
  stepEls.forEach((s, i) => {
    if (i <= stepIndex) {
      s.className = 'text-emerald-600 transition-colors duration-300';
    } else {
      s.className = 'text-slate-300 transition-colors duration-300';
    }
  });
}

function hideLoading() {
  // Tunggu sebentar supaya animasi 100% kelihatan
  setTimeout(() => {
    loadingOverlay.classList.add('hidden');
    progressBar.style.width = '0%';
    btnNormal.classList.remove('hidden');
    btnLoading.classList.add('hidden');
    submitBtn.disabled = false;
    stepEls.forEach(s => { s.className = 'text-slate-300 transition-colors duration-300'; });
  }, 600);
}

// ============================================
// FORM SUBMISSION & CONTENT GENERATION
// ============================================

async function handleGenerate(e) {
  e.preventDefault();
  appState.isLoading = true;
  errorMsg.classList.add('hidden');

  showLoading();
  setProgress(0); // Fase 1: Ambil Dalil

  try {
    const topik = topikInput.value.trim();
    if (!topik) {
      throw new Error('Topik utama harus diisi');
    }

    const geminiKeys = geminiKeysInput.value.trim();
    const groqKeys = groqKeysInput.value.trim();

    if (!geminiKeys && !groqKeys) {
      throw new Error('Silakan atur API Key Gemini atau Groq di Settings');
    }

    GeminiClient.setApiKeys(geminiKeys, groqKeys);

    const durasi = durasiSelect.value === 'custom' ? durasiCustomInput.value : durasiSelect.value;

    const contentData = {
      topik,
      kontenKustom: kontenKustomInput.value.trim(),
      durasi,
      nadaBicara: nadaBicaraSelect.value,
      platform: platformSelect.value,
      aspectRatio: aspectRatioSelect.value,
      linkWebsite: pasteArtikelInput.value.trim(),
      fileContent: appState.referenceFiles
        .map((f) => `[Filename: ${f.name}]\n${f.content}`)
        .join('\n\n---\n\n'),
    };

    // Fase 2: Kirim ke AI (dipanggil sesaat sebelum call API)
    // buildDalilPool ada di dalam generateContent — fase 0 sudah ditampilkan
    // Kita delay sedikit agar animasi terlihat, lalu naik ke fase 2
    await new Promise(r => setTimeout(r, 400));
    setProgress(1); // Fase 2: Kirim ke AI

    // Buat wrapper promise yang update progress saat API call dimulai
    const generatePromise = GeminiClient.generateContent(contentData);

    // Sambil tunggu AI, tick ke fase 3 setelah ~2 detik
    const progressTicker = setTimeout(() => setProgress(2), 2000);

    const result = await generatePromise;
    clearTimeout(progressTicker);

    setProgress(3); // Fase 4: Selesai

    if (Array.isArray(result)) {
      appState.contentPlans = result;
      renderContentGrid();
      closeSidebar();
    } else {
      throw new Error('Format respons tidak valid');
    }
  } catch (err) {
    console.error('Generate Error:', err);
    errorMsg.textContent = err.message || 'Terjadi kesalahan. Silakan coba lagi.';
    errorMsg.classList.remove('hidden');
  } finally {
    appState.isLoading = false;
    hideLoading();
  }
}

// ============================================
// CONTENT GRID RENDERING
// ============================================

function renderContentGrid() {
  contentCount.textContent = appState.contentPlans.length;

  if (appState.contentPlans.length === 0) {
    contentGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  contentGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');
  contentGrid.innerHTML = '';

  appState.contentPlans.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'bg-white border-l-4 border-amber-500 p-4 shadow-sm rounded-r-lg flex flex-col transition hover:shadow-md';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-start mb-2';

    const tanggalInput = document.createElement('input');
    tanggalInput.type = 'text';
    tanggalInput.value = item.tanggal;
    tanggalInput.className =
      'text-[10px] font-bold text-slate-400 uppercase focus:outline-none w-24 bg-transparent';
    tanggalInput.placeholder = 'Day XX';
    tanggalInput.addEventListener('change', (e) => {
      appState.contentPlans[idx].tanggal = e.target.value;
    });

    const kategoriInput = document.createElement('input');
    kategoriInput.type = 'text';
    kategoriInput.value = item.kategori;
    kategoriInput.className =
      'text-emerald-600 font-bold text-[10px] hover:underline focus:outline-none text-right bg-transparent w-32';
    kategoriInput.placeholder = 'Category';
    kategoriInput.addEventListener('change', (e) => {
      appState.contentPlans[idx].kategori = e.target.value;
    });

    header.appendChild(tanggalInput);
    header.appendChild(kategoriInput);
    card.appendChild(header);

    // Isi Konten
    const isiKontenSection = document.createElement('div');
    isiKontenSection.className = 'flex items-center justify-between mb-1';

    const isiLabel = document.createElement('span');
    isiLabel.className = 'text-[10px] font-bold text-slate-400 uppercase';
    isiLabel.textContent = 'Isi Konten';

    const copyIsiBtn = document.createElement('button');
    copyIsiBtn.type = 'button';
    copyIsiBtn.className = 'text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors';
    copyIsiBtn.textContent = 'Salin';
    copyIsiBtn.addEventListener('click', () => copyToClipboard(item.isiKonten, copyIsiBtn));

    isiKontenSection.appendChild(isiLabel);
    isiKontenSection.appendChild(copyIsiBtn);
    card.appendChild(isiKontenSection);

    const isiTextarea = document.createElement('textarea');
    isiTextarea.value = item.isiKonten;
    isiTextarea.className =
      'text-sm text-slate-800 font-medium leading-relaxed mb-3 w-full border border-slate-100 rounded bg-slate-50/50 p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none';
    isiTextarea.placeholder = 'Isi Konten...';
    isiTextarea.addEventListener('change', (e) => {
      appState.contentPlans[idx].isiKonten = e.target.value;
    });
    card.appendChild(isiTextarea);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'flex justify-between items-center mt-auto pt-3';

    const tags = document.createElement('div');
    tags.className = 'flex gap-2';

    const platformTag = document.createElement('span');
    platformTag.className = 'text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded';
    platformTag.textContent = platformSelect.value;
    tags.appendChild(platformTag);

    if (item.formatVisual) {
      const formatTag = document.createElement('span');
      formatTag.className = 'text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded';
      formatTag.textContent = item.formatVisual;
      tags.appendChild(formatTag);
    }

    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className =
      'text-[10px] font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded';
    previewBtn.innerHTML =
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> CANVAS PREVIEW';
    previewBtn.addEventListener('click', () => openCanvasPreview(item));

    actions.appendChild(tags);
    actions.appendChild(previewBtn);
    card.appendChild(actions);

    // Extra fields section
    const extraSection = document.createElement('div');
    extraSection.className = 'mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3';

    // Caption
    const captionLabel = document.createElement('div');
    captionLabel.className = 'flex items-center justify-between mb-1';

    const captionLabelText = document.createElement('label');
    captionLabelText.className = 'text-[10px] font-bold text-slate-400 uppercase';
    captionLabelText.textContent = `Caption ${platformSelect.value}`;

    const copyCaptionBtn = document.createElement('button');
    copyCaptionBtn.type = 'button';
    copyCaptionBtn.className = 'text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors';
    copyCaptionBtn.textContent = 'Salin';
    copyCaptionBtn.addEventListener('click', () => copyToClipboard(item.caption, copyCaptionBtn));

    captionLabel.appendChild(captionLabelText);
    captionLabel.appendChild(copyCaptionBtn);
    extraSection.appendChild(captionLabel);

    const captionTextarea = document.createElement('textarea');
    captionTextarea.value = item.caption;
    captionTextarea.className =
      'w-full text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-400 min-h-[40px] resize-y';
    captionTextarea.placeholder = `Caption ${platformSelect.value}...`;
    captionTextarea.addEventListener('change', (e) => {
      appState.contentPlans[idx].caption = e.target.value;
    });
    extraSection.appendChild(captionTextarea);

    // Prompt Gambar
    const promptLabel = document.createElement('div');
    promptLabel.className = 'flex items-center justify-between mb-1';

    const promptLabelText = document.createElement('label');
    promptLabelText.className = 'text-[10px] font-bold text-slate-400 uppercase';
    promptLabelText.textContent = 'Prompt Gambar (Bahasa Indonesia)';

    const copyPromptBtn = document.createElement('button');
    copyPromptBtn.type = 'button';
    copyPromptBtn.className = 'text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors';
    copyPromptBtn.textContent = 'Salin';
    copyPromptBtn.addEventListener('click', () => copyToClipboard(item.promptGambar, copyPromptBtn));

    promptLabel.appendChild(promptLabelText);
    promptLabel.appendChild(copyPromptBtn);
    extraSection.appendChild(promptLabel);

    const promptInput = document.createElement('input');
    promptInput.type = 'text';
    promptInput.value = item.promptGambar;
    promptInput.className =
      'w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-400';
    promptInput.addEventListener('change', (e) => {
      appState.contentPlans[idx].promptGambar = e.target.value;
    });
    extraSection.appendChild(promptInput);

    card.appendChild(extraSection);
    contentGrid.appendChild(card);
  });
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text || '').then(() => {
    const originalText = button.textContent;
    button.textContent = 'Tersalin!';
    button.classList.add('text-emerald-500');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('text-emerald-500');
    }, 2000);
  });
}

// ============================================
// CANVAS & POSTER PREVIEW
// ============================================

function openCanvasPreview(item) {
  appState.currentPreviewItem = item;
  canvasRenderer.setItem(item);
  orgNameInput.value = 'DMI KOTA TANGERANG';
  canvasRenderer.setOrgName(orgNameInput.value);
  canvasRenderer.render();
  canvasModal.classList.remove('hidden');
}

function closeCanvasModal() {
  canvasModal.classList.add('hidden');
}

function handleLogoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result;
    canvasRenderer.setLogoUrl(dataUrl);
    canvasRenderer.render();
  };
  reader.readAsDataURL(file);
}

function handleDownloadPoster() {
  if (!appState.currentPreviewItem) return;
  const filename = `Poster_${appState.currentPreviewItem.tanggal.replace(/\s/g, '_')}.png`;
  canvasRenderer.downloadAsImage(filename);
}

// ============================================
// EXPORT & SETTINGS
// ============================================

function handleSaveSettings() {
  const gemini = geminiKeysInput.value.trim();
  const groq = groqKeysInput.value.trim();

  localStorage.setItem('dmi_gemini_keys', gemini);
  localStorage.setItem('dmi_groq_keys', groq);

  const saveBtn = saveSettings;
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Tersimpan!';
  saveBtn.style.opacity = '0.7';

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.opacity = '1';
    settingsModal.classList.add('hidden');
  }, 1500);
}

function handleExport() {
  if (appState.contentPlans.length === 0) return;

  const data = appState.contentPlans.map((item) => ({
    Tanggal: item.tanggal,
    Kategori: item.kategori,
    'Isi Konten': item.isiKonten,
    Caption: item.caption,
    'Prompt Gambar': item.promptGambar,
    'Format Visual': item.formatVisual,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DMI Content Plan');
  XLSX.writeFile(wb, 'DMI_Content_Plan.xlsx');
}

// ============================================
// SIDEBAR TOGGLE
// ============================================

function openSidebar() {
  sidebar.classList.remove('-translate-x-full');
  sidebarOverlay.classList.remove('hidden');
}

function closeSidebar() {
  sidebar.classList.add('-translate-x-full');
  sidebarOverlay.classList.add('hidden');
}

// ============================================
// STARTUP
// ============================================

document.addEventListener('DOMContentLoaded', init);
