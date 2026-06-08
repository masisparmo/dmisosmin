import React, { useState, useRef, useEffect } from "react";
import { X, Download, Upload, Image as ImageIcon } from "lucide-react";
import { ContentPlanItem } from "../types";

interface Props {
  item: ContentPlanItem;
  platform: string;
  onClose: () => void;
}

export default function CanvasPreviewModal({ item, platform, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgColor, setBgColor] = useState("#047857"); // emerald-700
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("DMI KOTA TANGERANG");

  const format = item.formatVisual || "";
  const isVertical = format.includes("9:16");
  const isPortrait = format.includes("4:5");
  const isLandscape = format.includes("16:9");

  useEffect(() => {
    document.fonts.ready.then(() => {
      drawCanvas();
    });
  }, [bgColor, logoUrl, item, platform, orgName]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = isLandscape ? 1920 : 1080;
    let HEIGHT = 1080;
    if (isVertical) HEIGHT = 1920;
    else if (isPortrait) HEIGHT = 1350;
    else if (isLandscape) HEIGHT = 1080;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 1. Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Decorative Graphic (Simple circle overlay)
    ctx.beginPath();
    ctx.arc(WIDTH + 100, -100, 600, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-100, HEIGHT + 100, 500, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fill();

    // 2. Draw Teks Kategori (Header)
    ctx.fillStyle = "#f59e0b"; // amber-500
    ctx.font = "bold 40px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.kategori.toUpperCase(), WIDTH / 2, HEIGHT * 0.15);

    // 3. Draw Isi Konten (Word wrapped!)
    const isLightBg = bgColor === "#ffffff";
    ctx.fillStyle = isLightBg ? "#1e293b" : "#ffffff";
    ctx.font = "italic 44px 'Playfair Display', serif";
    const maxWidth = 860;
    const lineHeight = 65;
    const x = WIDTH / 2;
    let y = HEIGHT * 0.3;

    // Word wrap function supporting newlines
    const paragraphs = item.isiKonten.split("\n");
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        y += lineHeight;
        continue;
      }
      const words = paragraph.split(" ");
      let line = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, y);
          line = words[n] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, y);
      y += lineHeight;
    }

    // 4. Logo / Footer
    ctx.font = "bold 32px 'Inter', sans-serif";
    ctx.fillStyle = isLightBg ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)";
    ctx.fillText(orgName.toUpperCase(), WIDTH / 2, HEIGHT - 100);

    if (logoUrl) {
      const img = new Image();
      img.onload = () => {
        // Draw image at center bottom
        const imgW = 140;
        const imgH = 140;
        ctx.drawImage(img, WIDTH / 2 - imgW / 2, HEIGHT - 300, imgW, imgH);
      };
      img.src = logoUrl;
    } else {
      // Draw a spectacular vector Golden Islamic dome logo
      const centerX = WIDTH / 2;
      const centerY = HEIGHT - 230;
      
      // Outer gold circle ring
      ctx.strokeStyle = "#fbbf24"; // amber-400
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.stroke();
      
      // Dome fill background
      ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
      ctx.fill();

      // DRAW DOME (Kubah Masjid)
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      // Start bottom left of dome
      ctx.moveTo(centerX - 35, centerY + 30);
      // Left vertical wall
      ctx.lineTo(centerX - 35, centerY);
      // Left dome curve to peak
      ctx.bezierCurveTo(centerX - 35, centerY - 35, centerX - 18, centerY - 45, centerX, centerY - 45);
      // Right dome curve to wall
      ctx.bezierCurveTo(centerX + 18, centerY - 45, centerX + 35, centerY - 35, centerX + 35, centerY);
      // Right vertical wall
      ctx.lineTo(centerX + 35, centerY + 30);
      // Bottom line
      ctx.closePath();
      ctx.fill();

      // Dome base stripes/details (gold)
      ctx.fillStyle = "#d97706"; // amber-600
      ctx.fillRect(centerX - 35, centerY + 24, 70, 6);

      // Minaret / crescent star peak on top
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 45);
      ctx.lineTo(centerX, centerY - 58);
      ctx.stroke();

      // Crescent Moon
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(centerX + 5, centerY - 65, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bgColor; // cut out inside with background color
      ctx.beginPath();
      ctx.arc(centerX, centerY - 67, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Poster_${item.tanggal.replace(/\s/g, "_")}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 lg:p-0 lg:static lg:bg-transparent lg:z-auto lg:w-80 lg:flex-none">
      {/* Click outside to close (only on mobile/tablet overlay) */}
      <div className="absolute inset-0 lg:hidden" onClick={onClose} />
      
      <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-0 lg:shadow-none lg:bg-transparent w-full max-w-sm lg:max-w-none flex flex-col max-h-[92vh] lg:max-h-none overflow-y-auto lg:overflow-visible relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Canvas Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-100 lg:hover:bg-transparent">
            <X className="w-5 h-5 lg:w-4 lg:h-4" />
          </button>
        </div>
        
        <div className={`w-full ${isVertical ? 'aspect-[9/16]' : isLandscape ? 'aspect-[16/9]' : isPortrait ? 'aspect-[4/5]' : 'aspect-square'} bg-emerald-700 rounded shadow-2xl relative flex flex-col justify-center text-center overflow-hidden border-4 border-white ring-1 ring-slate-200`}>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nama Organisasi / Masjid</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Masukan Nama Organisasi..."
            />
          </div>

          <label className="w-full py-3 bg-white border border-slate-300 rounded text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer text-slate-700">
            <Upload className="w-4 h-4 text-slate-500" /> Upload Logo Custom
            <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
          </label>
          {logoUrl && (
             <button onClick={() => setLogoUrl(null)} className="w-full text-xs text-red-500 font-medium pb-1 block text-center hover:underline">Hapus Logo Saat Ini</button>
          )}
          
          <button 
            onClick={handleDownload}
            className="w-full py-3 bg-emerald-700 text-white rounded shadow-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition"
          >
            <Download className="w-4 h-4" /> Unduh Poster (.png)
          </button>
          
          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Canvas Options (Warna Identitas)</p>
            <div className="flex flex-wrap items-center gap-2">
              <button title="Hijau DMI" onClick={() => setBgColor("#047857")} className={`w-8 h-8 rounded border-2 transition-all ${bgColor === "#047857" ? "border-amber-400 ring-2 ring-emerald-500/25" : "border-transparent bg-emerald-700"}`} style={{backgroundColor: '#047857'}} />
              <button title="Amber/Emas" onClick={() => setBgColor("#d97706")} className={`w-8 h-8 rounded border-2 transition-all ${bgColor === "#d97706" ? "border-amber-300 ring-2 ring-amber-500/25" : "border-transparent bg-amber-600"}`} style={{backgroundColor: '#d97706'}} />
              <button title="Slate" onClick={() => setBgColor("#1e293b")} className={`w-8 h-8 rounded border-2 transition-all ${bgColor === "#1e293b" ? "border-slate-400 ring-2 ring-slate-500/25" : "border-transparent bg-slate-800"}`} style={{backgroundColor: '#1e293b'}} />
              <button title="Putih Bersih" onClick={() => setBgColor("#ffffff")} className={`w-8 h-8 rounded border-2 transition-all ${bgColor === "#ffffff" ? "border-slate-400 ring-2 ring-slate-500/25" : "border-transparent bg-white border-slate-200"}`} style={{backgroundColor: '#ffffff'}} />
              <button title="Biru Teduh" onClick={() => setBgColor("#3b82f6")} className={`w-8 h-8 rounded border-2 transition-all ${bgColor === "#3b82f6" ? "border-blue-300 ring-2 ring-blue-500/25" : "border-transparent bg-blue-500"}`} style={{backgroundColor: '#3b82f6'}} />
              
              {/* Custom Color Input */}
              <label title="Pilih Warna Kustom" className="relative w-8 h-8 rounded border-2 border-slate-300 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition-transform" style={{ backgroundColor: bgColor }}>
                <span className="text-[10px] bg-black/40 text-white font-bold px-0.5 pointer-events-none">HEX</span>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              HEX: <span className="font-mono font-bold text-slate-600 uppercase">{bgColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
