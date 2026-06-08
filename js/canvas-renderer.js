/**
 * Canvas Renderer - Menangani rendering poster dakwah di HTML5 Canvas
 */

const ASPECT_RATIOS = {
  'Instagram': ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story/Reels)'],
  'Facebook': ['1:1 (Square)', '16:9 (Landscape)', '4:5 (Portrait)'],
  'Whatsapp Group': ['1:1 (Square)', '16:9 (Landscape)'],
  'Whatsapp Status': ['9:16 (Story)'],
  'Threads': ['1:1 (Square)', '4:5 (Portrait)', '16:9 (Landscape)'],
};

class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.bgColor = '#047857';
    this.logoUrl = null;
    this.orgName = 'DMI KOTA TANGERANG';
    this.currentItem = null;
  }

  setItem(item) {
    this.currentItem = item;
  }

  setBgColor(color) {
    this.bgColor = color;
    this.render();
  }

  setLogoUrl(url) {
    this.logoUrl = url;
    this.render();
  }

  setOrgName(name) {
    this.orgName = name;
    this.render();
  }

  render() {
    if (!this.currentItem) return;

    const format = this.currentItem.formatVisual || '';
    const isVertical = format.includes('9:16');
    const isPortrait = format.includes('4:5');
    const isLandscape = format.includes('16:9');

    const WIDTH = isLandscape ? 1920 : 1080;
    let HEIGHT = 1080;
    if (isVertical) HEIGHT = 1920;
    else if (isPortrait) HEIGHT = 1350;

    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;

    // 1. Background
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Decorative circles
    this.ctx.beginPath();
    this.ctx.arc(WIDTH + 100, -100, 600, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(-100, HEIGHT + 100, 500, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fill();

    // 2. Kategori Header
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = "bold 40px 'Arial', sans-serif";
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentItem.kategori.toUpperCase(), WIDTH / 2, HEIGHT * 0.15);

    // 3. Isi Konten (word-wrapped)
    const isLightBg = this.bgColor === '#ffffff';
    this.ctx.fillStyle = isLightBg ? '#1e293b' : '#ffffff';
    this.ctx.font = "italic 44px 'Georgia', serif";
    this.ctx.textAlign = 'center';

    this._drawWrappedText(
      this.currentItem.isiKonten,
      WIDTH / 2,
      HEIGHT * 0.3,
      860,
      65
    );

    // 4. Footer with org name
    this.ctx.font = "bold 32px 'Arial', sans-serif";
    this.ctx.fillStyle = isLightBg ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)';
    this.ctx.fillText(this.orgName.toUpperCase(), WIDTH / 2, HEIGHT - 100);

    // 5. Logo or default dome
    if (this.logoUrl) {
      this._drawLogo(WIDTH, HEIGHT);
    } else {
      this._drawDefaultDome(WIDTH / 2, HEIGHT - 230);
    }
  }

  _drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const paragraphs = text.split('\n');
    let currentY = y;

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        currentY += lineHeight;
        continue;
      }

      const words = paragraph.split(' ');
      let line = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = this.ctx.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
          this.ctx.fillText(line.trim(), x, currentY);
          line = words[i] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }

      this.ctx.fillText(line.trim(), x, currentY);
      currentY += lineHeight;
    }
  }

  _drawLogo(WIDTH, HEIGHT) {
    const img = new Image();
    img.onload = () => {
      const imgW = 140;
      const imgH = 140;
      this.ctx.drawImage(img, WIDTH / 2 - imgW / 2, HEIGHT - 300, imgW, imgH);
    };
    img.onerror = () => {
      this._drawDefaultDome(WIDTH / 2, HEIGHT - 230);
    };
    img.src = this.logoUrl;
  }

  _drawDefaultDome(centerX, centerY) {
    // Outer gold circle ring
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    this.ctx.stroke();

    // Dome fill background
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
    this.ctx.fill();

    // DOME
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 35, centerY + 30);
    this.ctx.lineTo(centerX - 35, centerY);
    this.ctx.bezierCurveTo(
      centerX - 35,
      centerY - 35,
      centerX - 18,
      centerY - 45,
      centerX,
      centerY - 45
    );
    this.ctx.bezierCurveTo(
      centerX + 18,
      centerY - 45,
      centerX + 35,
      centerY - 35,
      centerX + 35,
      centerY
    );
    this.ctx.lineTo(centerX + 35, centerY + 30);
    this.ctx.closePath();
    this.ctx.fill();

    // Base stripe
    this.ctx.fillStyle = '#d97706';
    this.ctx.fillRect(centerX - 35, centerY + 24, 70, 6);

    // Minaret peak
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - 45);
    this.ctx.lineTo(centerX, centerY - 58);
    this.ctx.stroke();

    // Crescent moon
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(centerX + 5, centerY - 65, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = this.bgColor;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY - 67, 11, 0, Math.PI * 2);
    this.ctx.fill();
  }

  downloadAsImage(filename) {
    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename || 'poster.png';
    link.click();
  }
}

export default CanvasRenderer;
