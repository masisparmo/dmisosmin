import React, { useState, useRef, useEffect } from "react";
import * as xlsx from "xlsx";
import { Download, LayoutGrid, Image as ImageIcon, Plus, Sparkles, Loader2, RefreshCw, Menu, X, Copy, Check, Link, FileText, Trash2, Settings, Save } from "lucide-react";
import { ContentPlanItem } from "./types";
import CanvasPreviewModal from "./components/CanvasPreviewModal";

export const ASPECT_RATIOS: Record<string, string[]> = {
  "Instagram": ["1:1 (Square)", "4:5 (Portrait)", "9:16 (Story/Reels)"],
  "Facebook": ["1:1 (Square)", "16:9 (Landscape)", "4:5 (Portrait)"],
  "Whatsapp Group": ["1:1 (Square)", "16:9 (Landscape)"],
  "Whatsapp Status": ["9:16 (Story)"],
  "Threads": ["1:1 (Square)", "4:5 (Portrait)", "16:9 (Landscape)"],
};

export default function App() {
  const [topik, setTopik] = useState("");
  const [kontenKustom, setKontenKustom] = useState("");
  const [durasi, setDurasi] = useState("1");
  const [isCustomDurasi, setIsCustomDurasi] = useState(false);
  const [nadaBicara, setNadaBicara] = useState("Edukasi Santai");
  const [platform, setPlatform] = useState("Instagram");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS["Instagram"][0]);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ContentPlanItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewItem, setPreviewItem] = useState<ContentPlanItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const [linkWebsites, setLinkWebsites] = useState<string[]>([""]);
  const [referenceFiles, setReferenceFiles] = useState<{name: string, content: string}[]>([]);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKeys, setGeminiKeys] = useState("");
  const [groqKeys, setGroqKeys] = useState("");
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  useEffect(() => {
    // Load API Keys from localStorage on mount
    const savedGemini = localStorage.getItem("dmi_gemini_keys");
    const savedGroq = localStorage.getItem("dmi_groq_keys");
    if (savedGemini) setGeminiKeys(savedGemini);
    if (savedGroq) setGroqKeys(savedGroq);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("dmi_gemini_keys", geminiKeys);
    localStorage.setItem("dmi_groq_keys", groqKeys);
    setSettingsSavedMsg(true);
    setTimeout(() => {
      setSettingsSavedMsg(false);
      setIsSettingsOpen(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let hasLargeFile = false;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) hasLargeFile = true;
    });

    if (hasLargeFile) {
      alert("Ukurannya terlalu besar. Maksimal 10 MB per file.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || "";
        setReferenceFiles(prev => [...prev, { name: file.name, content: text }]);
      };
      reader.readAsText(file);
    });

    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    setLinkWebsites(prev => [...prev, ""]);
  };

  const handleUpdateLink = (index: number, value: string) => {
    setLinkWebsites(prev => {
      const newLinks = [...prev];
      newLinks[index] = value;
      return newLinks;
    });
  };

  const handleRemoveLink = (index: number) => {
    setLinkWebsites(prev => {
      const newLinks = prev.filter((_, i) => i !== index);
      return newLinks.length === 0 ? [""] : newLinks;
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text || "");
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topik, 
          kontenKustom, 
          durasi, 
          nadaBicara, 
          platform, 
          aspectRatio, 
          linkWebsite: linkWebsites.filter(l => l.trim() !== "").join("\n"), 
          fileContent: referenceFiles.map(f => `[Filename: ${f.name}]\n${f.content}`).join("\n\n---\n\n"),
          apiKeys: {
            gemini: geminiKeys,
            groq: groqKeys
          }
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat konten");
      }
      const data = await res.json();
      setPlans(data);
      setIsSidebarOpen(false); // Auto close sidebar on mobile to show content
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan. Silahkan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = (index: number, field: keyof ContentPlanItem, value: string) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const handleExportXLS = () => {
    if (plans.length === 0) return;
    const worksheet = xlsx.utils.json_to_sheet(plans);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Plan DMI");
    xlsx.writeFile(workbook, "DMI_Content_Plan.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-200">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800 text-lg">Pengaturan API Keys</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Gemini API Keys</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  rows={3}
                  placeholder="AIzaSy..., AIzaSy... (Pisahkan dengan koma)"
                  value={geminiKeys}
                  onChange={(e) => setGeminiKeys(e.target.value)}
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-1 mb-2">Gunakan koma untuk memasukkan lebih dari satu kunci (sebagai fallback).</p>
                <details className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <summary className="cursor-pointer font-semibold text-emerald-600 hover:text-emerald-700">Cara mendapatkan Gemini API Key?</summary>
                  <ol className="list-decimal pl-4 mt-2 space-y-1.5 text-[11px] md:text-xs">
                    <li>Kunjungi <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a>.</li>
                    <li>Login menggunakan Akun Google Anda.</li>
                    <li>Klik menu <strong>Get API key</strong> di sebelah kiri atas.</li>
                    <li>Klik tombol biru <strong>Create API key</strong>.</li>
                    <li>Setelah jadi, klik tombol Copy atau salin teks kuncinya lalu tempel ke kolom di atas.</li>
                  </ol>
                </details>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Groq API Keys (Llama 3)</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  rows={3}
                  placeholder="gsk_..., gsk_... (Pisahkan dengan koma)"
                  value={groqKeys}
                  onChange={(e) => setGroqKeys(e.target.value)}
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-1 mb-2">Digunakan sebagai alternatif Tier-3 jika Limit Request Gemini habis.</p>
                <details className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <summary className="cursor-pointer font-semibold text-emerald-600 hover:text-emerald-700">Cara mendapatkan Groq API Key?</summary>
                  <ol className="list-decimal pl-4 mt-2 space-y-1.5 text-[11px] md:text-xs">
                    <li>Kunjungi <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Groq Console</a>.</li>
                    <li>Login atau daftar akun baru Anda.</li>
                    <li>Pilih menu <strong>API Keys</strong> di sidebar kiri layar.</li>
                    <li>Klik tombol hitam <strong>Create API Key</strong> di pojok kanan, beri nama (bebas).</li>
                    <li>Salin kuncinya (biasanya diawali <span className="font-mono text-slate-500">gsk_</span>) lalu tempel ke kolom di atas.</li>
                  </ol>
                </details>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {settingsSavedMsg ? (
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4"/> Tersimpan</span>
              ) : <span></span>}
              <button
                onClick={handleSaveSettings}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4"/> Simpan Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-950/40 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-emerald-800 flex flex-col border-r border-emerald-900 shadow-xl z-40 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 bg-emerald-900 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co.com/gbp3gzpV/logo-dmi-sosmin-kecil.png" alt="DMI SOSMIN Logo" className="w-10 h-10 object-contain drop-shadow" />
            <div>
              <h1 className="text-white font-bold leading-none uppercase tracking-wider">DMI SOSMIN</h1>
              <span className="text-emerald-400 text-[10px] font-medium block mt-1">KOTA TANGERANG</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg md:hidden hover:bg-emerald-800 focus:outline-none"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="space-y-4 overflow-y-auto flex-1 pr-1.5">
            <label className="block">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 block">Topik Utama</span>
              <input
                type="text"
                required
                placeholder="Contoh: Ramadhan..."
                className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                disabled={loading}
              />
            </label>
            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest block">Draf Konten Kustom</span>
                <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Opsional</span>
              </div>
              <textarea
                placeholder="Misal: Pengumuman kajian Nuzulul Qur'an tgl 20 Maret jam 8 malam dengan penceramah KH. Ahmad..."
                rows={3}
                className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-emerald-500/70"
                value={kontenKustom}
                onChange={(e) => setKontenKustom(e.target.value)}
                disabled={loading}
              />
            </label>
            {/* Link Website */}
            <div className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest block">Link Website Acuan</span>
                <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Opsional</span>
              </div>
              <div className="space-y-2">
                {linkWebsites.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://example.com/hikmah..."
                        className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-emerald-500/70"
                        value={link}
                        onChange={(e) => handleUpdateLink(index, e.target.value)}
                        disabled={loading}
                      />
                      <Link className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />
                    </div>
                    {linkWebsites.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="px-2.5 bg-emerald-900/50 hover:bg-red-400/20 text-emerald-400 hover:text-red-400 rounded border border-emerald-700 transition"
                        title="Hapus Link"
                        disabled={loading}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 mt-1 transition"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3" /> Tambah Sumber Link
                </button>
              </div>
            </div>

            {/* File .txt Upload */}
            <div className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest block">Kitab / Ebook / File Teks</span>
                <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">max 10MB</span>
              </div>
              
              <div className="space-y-2">
                {referenceFiles.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {referenceFiles.map((file, index) => (
                      <div key={index} className="w-full bg-emerald-900 border border-emerald-700 rounded p-2 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate font-semibold text-[11px]" title={file.name}>{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1.5 text-emerald-400 hover:text-red-300 hover:bg-emerald-800 rounded transition animate-fade-in"
                          disabled={loading}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <label className="w-full bg-emerald-900/50 hover:bg-emerald-950/40 border-2 border-dashed border-emerald-700/65 text-emerald-300 rounded p-3 text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer transition">
                  <Plus className="w-5 h-5 text-emerald-400/60" />
                  <span className="font-semibold text-center leading-none text-[11px]">Tambah File .txt (Referensi)</span>
                  <span className="text-[10px] text-emerald-500/80 text-center">Bisa unggah lebih dari satu file</span>
                  <input
                    type="file"
                    accept=".txt"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
            <label className="block">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 block">Durasi Plan</span>
              <div className="flex gap-2">
                <select
                  className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
                  value={isCustomDurasi ? "custom" : durasi}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomDurasi(true);
                      setDurasi("");
                    } else {
                      setIsCustomDurasi(false);
                      setDurasi(e.target.value);
                    }
                  }}
                  disabled={loading}
                >
                  <option value="1">1 Hari</option>
                  <option value="7">7 Hari (Mingguan)</option>
                  <option value="15">15 Hari (Setengah Bulan)</option>
                  <option value="30">30 Hari (Bulanan)</option>
                  <option value="custom">Custom...</option>
                </select>
                {isCustomDurasi && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Hari"
                    className="w-24 bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    disabled={loading}
                    required
                  />
                )}
              </div>
            </label>
            <label className="block">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 block">Nada Bicara</span>
              <select
                className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
                value={nadaBicara}
                onChange={(e) => setNadaBicara(e.target.value)}
                disabled={loading}
              >
                <option value="Edukasi Santai">Edukatif & Bijak</option>
                <option value="Agamis Tegas">Inspiratif</option>
                <option value="Informatif Singkat">Informasi Pengumuman</option>
                <option value="Menenangkan">Menenangkan</option>
              </select>
            </label>
            <label className="block">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 block">Platform</span>
              <select
                className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
                value={platform}
                onChange={(e) => {
                  const newPlatform = e.target.value;
                  setPlatform(newPlatform);
                  setAspectRatio(ASPECT_RATIOS[newPlatform][0]);
                }}
                disabled={loading}
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Whatsapp Group">Whatsapp Group</option>
                <option value="Whatsapp Status">Whatsapp Status</option>
                <option value="Threads">Threads</option>
              </select>
            </label>
            <label className="block">
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1 block">Aspek Rasio</span>
              <select
                className="w-full bg-emerald-900/50 border border-emerald-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={loading}
              >
                {ASPECT_RATIOS[platform].map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading || !topik}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded shadow-lg transition-colors flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Generate AI..." : "Generate Planner"}
          </button>

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm mt-2">
              {errorMsg}
            </div>
          )}
        </form>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 text-slate-900 w-full min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none"
              title="Menu Form"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-emerald-800 font-bold text-sm md:text-lg">Dashboard Konten</h2>
            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>
            <p className="text-slate-400 text-xs md:text-sm hidden sm:block">Media Center DMI</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition md:hidden"
              title="API Key Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 text-slate-600 rounded text-xs md:text-sm font-medium hover:bg-slate-50 hidden md:flex items-center gap-1.5 md:gap-2 transition"
              title="API Key Settings"
            >
              <Settings className="w-4 h-4" /> 
              <span>Settings</span>
            </button>
            <button 
              onClick={handleExportXLS}
              disabled={plans.length === 0}
              className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 text-slate-600 rounded text-xs md:text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
              <span className="hidden sm:inline">Export Excel (.xlsx)</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generated Queue</h3>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                {plans.length} CONTENT READY
              </span>
            </div>

            {plans.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Sparkles className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium">Belum ada konten.</p>
                <p className="text-sm">Isi form di samping untuk membuat draft otomatis.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 place-content-start">
              {plans.map((item, idx) => (
                <div key={idx} className="bg-white border-l-4 border-amber-500 p-4 shadow-sm rounded-r-lg flex flex-col transition hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <input 
                      value={item.tanggal}
                      onChange={(e) => updatePlan(idx, "tanggal", e.target.value)}
                      className="text-[10px] font-bold text-slate-400 uppercase focus:outline-none w-24 bg-transparent"
                      placeholder="Day XX"
                    />
                    <input 
                      value={item.kategori}
                      onChange={(e) => updatePlan(idx, "kategori", e.target.value)}
                      className="text-emerald-600 font-bold text-[10px] hover:underline focus:outline-none text-right bg-transparent w-32"
                      placeholder="Category"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Isi Konten</span>
                      <button
                        onClick={() => handleCopy(item.isiKonten, `${idx}-isi`)}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
                        title="Salin isi konten"
                      >
                        {copiedState[`${idx}-isi`] ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={item.isiKonten}
                      onChange={(e) => updatePlan(idx, "isiKonten", e.target.value)}
                      className="text-sm text-slate-800 font-medium leading-relaxed mb-3 w-full border border-slate-100 rounded bg-slate-50/50 p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none min-h-[60px] resize-y"
                      placeholder="Isi Konten..."
                    />
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-3">
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{platform}</span>
                      {item.formatVisual && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.formatVisual}</span>}
                    </div>
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded"
                    >
                      <ImageIcon className="w-3 h-3" /> CANVAS PREVIEW
                    </button>
                  </div>
                  
                  {/* Inline editors for extra fields */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Caption {platform}</label>
                          <button
                            onClick={() => handleCopy(item.caption, `${idx}-caption`)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
                            title="Salin caption"
                          >
                            {copiedState[`${idx}-caption`] ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          value={item.caption}
                          onChange={(e) => updatePlan(idx, "caption", e.target.value)}
                          className="w-full text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-400 min-h-[40px] resize-y"
                          placeholder={`Caption ${platform}...`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Prompt Gambar (Bahasa Indonesia)</label>
                          <button
                            onClick={() => handleCopy(item.promptGambar, `${idx}-prompt`)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors"
                            title="Salin prompt gambar"
                          >
                            {copiedState[`${idx}-prompt`] ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.promptGambar}
                          onChange={(e) => updatePlan(idx, "promptGambar", e.target.value)}
                          className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {plans.length > 0 && (
            <div className="mt-auto p-4 bg-amber-50 border border-amber-200 rounded flex items-center gap-4 mt-6 shrink-0">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                <span className="font-bold">i</span>
              </div>
              <div className="text-xs text-amber-800">
                <p className="font-bold uppercase">Saran AI:</p>
                <p>Gunakan hashtag #SubuhPejuang #DMIKotaTangerang untuk meningkatkan jangkauan hari ini.</p>
              </div>
            </div>
          )}
        </div>
          
        {/* Canvas Preview Right Panel */}
          {previewItem && (
            <CanvasPreviewModal 
              item={previewItem} 
              platform={platform}
              onClose={() => setPreviewItem(null)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

