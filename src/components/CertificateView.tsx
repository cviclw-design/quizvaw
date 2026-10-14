import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Share2,
  Shield,
  Users,
  Settings,
  Handshake,
  Sprout
} from 'lucide-react';
import { ShareModal } from './ShareModal';
import { DriveModal } from './DriveModal';
import { googleSignIn, getAccessToken } from '../services/googleAuth';
import { DriveService } from '../services/driveService';
import { soundEffects } from '../utils/audio';

interface CertificateProps {
  type: 'pledge' | 'quiz';
  recipientName: string;
  designation?: string;
  organization?: string;
  date: string;
  certificateId: string;
  quizScore?: number;
  totalQuestions?: number;
  onBack?: () => void;
}

export const CertificateView: React.FC<CertificateProps> = ({
  type,
  recipientName,
  designation,
  organization,
  date,
  certificateId,
  quizScore,
  totalQuestions,
  onBack
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSavedUrl, setDriveSavedUrl] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  /**
   * High-resolution 2000px Canvas painter matching finalpc.jpeg
   */
  const paintCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas element not available'));
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2D Context not available'));
        return;
      }

      const W = canvas.width; // 2000
      const H = canvas.height; // 1414
      ctx.clearRect(0, 0, W, H);

      // Cream/Parchment background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#fffdf8');
      bgGrad.addColorStop(1, '#fef9ed');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Outer Gold Double Border with Corner Flourishes
      ctx.strokeStyle = '#c59b27';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      ctx.strokeStyle = '#071a3a';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      ctx.strokeStyle = '#d4a017';
      ctx.lineWidth = 2;
      ctx.strokeRect(56, 56, W - 112, H - 112);

      // Left Column Text Banner ("INTEGRITY BUILDS TRUST...")
      ctx.fillStyle = '#071a3a';
      ctx.font = '800 22px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('INTEGRITY', 80, 120);
      ctx.fillText('BUILDS', 80, 148);
      ctx.fillText('TRUST', 80, 176);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText('STRONG', 80, 215);
      ctx.fillText('RAILWAYS', 80, 243);
      ctx.fillText('STRONGER', 80, 271);
      ctx.fillText('INDIA', 80, 299);

      // Top Right Header Block: VAW 2026 & "PROBITY FOR PROSPERITY"
      ctx.fillStyle = '#071a3a';
      ctx.font = '800 32px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText('VIGILANCE', W - 90, 115);
      ctx.fillText('AWARENESS', W - 90, 150);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText('WEEK 2026', W - 90, 185);

      // Red pill box "PROBITY FOR PROSPERITY"
      ctx.beginPath();
      roundRect(ctx, W - 410, 205, 320, 42, 8);
      ctx.fillStyle = '#a81c1c';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROBITY FOR PROSPERITY', W - 250, 232);

      ctx.fillStyle = '#334455';
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillText('INTEGRITY  |  TRANSPARENCY  |  SELF-RELIANCE', W - 250, 268);

      // Load Indian Railways Logo in Top Center
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => finishCanvasPaint(logoImg);
      logoImg.onerror = () => finishCanvasPaint(null);
      logoImg.src = 'https://raw.githubusercontent.com/swrvaw/swrvaw.github.io/gh-pages/static/media/logo.8b9ced028d0a93767ec0.png';

      function finishCanvasPaint(logo: HTMLImageElement | null) {
        if (!ctx) return;

        if (logo) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(W / 2, 140, 60, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.clip();
          ctx.drawImage(logo, W / 2 - 60, 80, 120, 120);
          ctx.restore();

          ctx.strokeStyle = '#c59b27';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(W / 2, 140, 62, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center Title
        ctx.fillStyle = '#071a3a';
        ctx.font = '800 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('चित्तरंजन लोकोमोटिव वर्क्स', W / 2, 235);

        ctx.font = '800 42px Georgia, serif';
        ctx.fillText('CHITTARANJAN LOCOMOTIVE WORKS', W / 2, 280);

        ctx.font = '700 22px Outfit, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('भारतीय रेल  /  INDIAN RAILWAYS', W / 2, 312);

        // VIGILANCE DEPARTMENT Badge
        ctx.beginPath();
        roundRect(ctx, W / 2 - 260, 332, 520, 48, 24);
        ctx.fillStyle = '#072b42';
        ctx.fill();
        ctx.strokeStyle = '#d4a017';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 24px Outfit, sans-serif';
        ctx.fillText('VIGILANCE DEPARTMENT', W / 2, 364);

        // Center Golden Swallowtail Ribbon
        const ribbonY = 430;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        const ribGrad = ctx.createLinearGradient(0, ribbonY, 0, ribbonY + 90);
        ribGrad.addColorStop(0, '#f2ca65');
        ribGrad.addColorStop(0.5, '#e5b338');
        ribGrad.addColorStop(1, '#cb9318');

        ctx.beginPath();
        roundRect(ctx, W / 2 - 520, ribbonY, 1040, 90, 12);
        ctx.fillStyle = ribGrad;
        ctx.fill();
        ctx.strokeStyle = '#9c6f08';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // Ribbon Title Text
        const ribbonTitle = type === 'pledge' ? 'Certificate of Commitment' : 'Certificate of Participation';
        ctx.fillStyle = '#5c1202';
        ctx.font = 'italic 700 62px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(ribbonTitle, W / 2, ribbonY + 66);

        // Subtitle certification
        ctx.fillStyle = '#1e293b';
        ctx.font = '500 28px Georgia, serif';
        ctx.fillText('This is to certify that', W / 2, 570);

        // Participant Name Line (Dotted Line)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(W / 2 - 480, 660);
        ctx.lineTo(W / 2 + 480, 660);
        ctx.stroke();
        ctx.setLineDash([]);

        // Participant Name
        ctx.fillStyle = '#071a3a';
        ctx.font = '800 52px Georgia, serif';
        ctx.fillText(recipientName, W / 2, 642);

        // Details string
        const subDetails = [designation, organization].filter(Boolean).join('   ·   ') || 'Valued Participant';
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 24px Outfit, sans-serif';
        ctx.fillText(subDetails, W / 2, 705);

        // Main body text
        ctx.fillStyle = '#334155';
        ctx.font = '500 26px Georgia, serif';

        if (type === 'pledge') {
          ctx.fillText('has taken the Integrity Pledge during', W / 2, 760);
          ctx.fillStyle = '#800000';
          ctx.font = '800 32px Georgia, serif';
          ctx.fillText('Vigilance Awareness Week 2026', W / 2, 808);
          ctx.fillStyle = '#1e293b';
          ctx.font = '700 26px Georgia, serif';
          ctx.fillText('organized by Vigilance Department, Chittaranjan Locomotive Works,', W / 2, 854);
          ctx.fillStyle = '#475569';
          ctx.font = '500 22px Outfit, sans-serif';
          const bodyText = 'and has solemnly committed to uphold the highest standards of honesty, integrity and transparency in all activities towards building a corruption-free India.';
          wrapText(ctx, bodyText, W / 2, 908, 1200, 32);
        } else {
          ctx.fillText('has actively participated in the Quiz Competition organized during', W / 2, 760);
          ctx.fillStyle = '#800000';
          ctx.font = '800 32px Georgia, serif';
          ctx.fillText('Vigilance Awareness Week 2026', W / 2, 808);
          ctx.fillStyle = '#1e293b';
          ctx.font = '700 26px Georgia, serif';
          ctx.fillText('by Vigilance Department, Chittaranjan Locomotive Works.', W / 2, 854);
          ctx.fillStyle = '#475569';
          ctx.font = '500 22px Outfit, sans-serif';
          const bodyText = 'We appreciate your enthusiasm, knowledge and commitment towards promoting integrity, transparency and a corruption-free workplace.';
          wrapText(ctx, bodyText, W / 2, 908, 1200, 32);
        }

        // Right side 5 Core Pillars Box
        drawPillarsBlock(ctx, W - 420, 680);

        // Footer details (Place, Date, CVO Signature)
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 24px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Place : Chittaranjan`, 120, 1180);
        ctx.fillText(`Date : ${date}`, 120, 1220);

        // Draw CVO Signature
        drawScriptSignature();
        drawSignText();

        function drawScriptSignature() {
          if (!ctx) return;
          ctx.strokeStyle = '#071a3a';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(W - 480, 1140);
          ctx.bezierCurveTo(W - 500, 1110, W - 460, 1090, W - 440, 1120);
          ctx.bezierCurveTo(W - 420, 1150, W - 400, 1100, W - 380, 1130);
          ctx.bezierCurveTo(W - 360, 1160, W - 320, 1120, W - 240, 1145);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(W - 390, 1095, 3.5, 0, Math.PI * 2);
          ctx.arc(W - 370, 1092, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#071a3a';
          ctx.fill();
        }

        function drawSignText() {
          if (!ctx || !canvas) return;
          ctx.strokeStyle = '#071a3a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(W - 520, 1185);
          ctx.lineTo(W - 180, 1185);
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = '#0f172a';
          ctx.font = '800 26px Outfit, sans-serif';
          ctx.fillText('SUGIND SURENDRAN', W - 350, 1220);

          ctx.fillStyle = '#475569';
          ctx.font = '600 20px Outfit, sans-serif';
          ctx.fillText('SDGM & CVO', W - 350, 1250);
          ctx.fillText('Chittaranjan Locomotive Works', W - 350, 1278);

          resolve(canvas);
        }
      }
    });
  };

  const handleDownloadPng = async () => {
    soundEffects.playClick();
    try {
      const canvas = await paintCanvas();
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${certificateId}-${recipientName.replace(/\s+/g, '_')}.png`;
      a.click();
    } catch (err) {
      console.error('Download PNG failed', err);
    }
  };

  const handleSaveToDrive = async () => {
    soundEffects.playClick();
    setSavingToDrive(true);
    setDriveError(null);
    setDriveSavedUrl(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        if (!authResult) throw new Error('Google Sign-In was cancelled');
        token = authResult.accessToken;
      }

      const canvas = await paintCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image blob'));
        }, 'image/png');
      });

      const uploaded = await DriveService.saveCertificateToDrive(
        token,
        certificateId,
        certificateId,
        recipientName,
        blob
      );

      soundEffects.playCorrect();
      setDriveSavedUrl(uploaded.webViewLink || 'https://drive.google.com');
    } catch (err: unknown) {
      console.error('Save to Google Drive failed:', err);
      soundEffects.playIncorrect();
      setDriveError((err as Error).message || 'Failed to save certificate to Google Drive');
    } finally {
      setSavingToDrive(false);
    }
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    words.forEach(w => {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > max) {
        lines.push(line);
        line = w;
      } else {
        line = t;
      }
    });
    lines.push(line);
    lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lh));
  }

  function drawPillarsBlock(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const items = [
      { text: 'ZERO CORRUPTION', color: '#1e3a8a' },
      { text: 'ETHICAL WORK CULTURE', color: '#065f46' },
      { text: 'TRANSPARENT PROCESSES', color: '#9a3412' },
      { text: 'ACCOUNTABLE ADMINISTRATION', color: '#1e293b' },
      { text: 'PROSPEROUS RAILWAYS', color: '#15803d' }
    ];

    ctx.textAlign = 'left';
    ctx.font = '800 16px Outfit, sans-serif';
    items.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillText(`• ${item.text}`, x, y + i * 36);
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Top Action Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{type === 'pledge' ? 'Official Integrity Pledge Certificate' : 'Participation Certificate'}</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
              Verified Authenticity
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Issued under authority of Shri Sugind Surendran, SDGM &amp; CVO, Chittaranjan Locomotive Works.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#071a3a] hover:bg-[#0d2a58] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleSaveToDrive}
            disabled={savingToDrive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            title="Save certificate directly to Google Drive"
          >
            {savingToDrive ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Drive...</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5" />
                <span>Save to Google Drive</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShareOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#ff8a1e] hover:bg-[#e87610] text-[#071a3a] text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* Google Drive Status Notification */}
      {driveSavedUrl && (
        <div className="no-print mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">Successfully saved to your Google Drive!</strong>
              <span>Folder: "CLW Vigilance Awareness Week 2026"</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={driveSavedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors"
            >
              <span>Open in Google Drive</span>
            </a>
            <button
              onClick={() => setDriveModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>
      )}

      {driveError && (
        <div className="no-print mb-6 p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{driveError}</span>
          </div>
          <button
            onClick={() => setDriveError(null)}
            className="text-xs font-bold text-rose-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Official HTML / Printable Certificate Frame matching finalpc.jpeg */}
      <article className="certificate-print-area relative bg-[#fffdf8] border-[12px] border-[#c59b27] rounded-3xl p-4 sm:p-8 shadow-2xl text-slate-900 overflow-hidden">
        <div className="border-2 border-[#071a3a] rounded-2xl p-4 sm:p-8 relative bg-gradient-to-b from-white via-[#fffdfa] to-[#fffbf0] overflow-hidden">
          
          {/* Top Row Header: Left Slogan, Center Emblem & Title, Right VAW 2026 Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pb-4 border-b border-amber-200/80">
            
            {/* Top Left Slogan */}
            <div className="md:col-span-3 text-left space-y-0.5 hidden sm:block">
              <div className="text-[11px] sm:text-xs font-extrabold tracking-wider text-[#071a3a] uppercase leading-tight">
                INTEGRITY BUILDS TRUST
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-blue-700 uppercase leading-tight">
                STRONG RAILWAYS STRONGER INDIA
              </div>
            </div>

            {/* Top Center Main Header */}
            <div className="md:col-span-6 text-center flex flex-col items-center">
              <img
                src="https://raw.githubusercontent.com/swrvaw/swrvaw.github.io/gh-pages/static/media/logo.8b9ced028d0a93767ec0.png"
                alt="Indian Railways Emblem"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full border-2 border-[#c59b27] bg-white p-1 shadow-xs mb-1"
              />
              <h1 className="text-lg sm:text-2xl font-extrabold text-[#071a3a] leading-tight">
                चित्तरंजन लोकोमोटिव वर्क्स
              </h1>
              <h2 className="text-base sm:text-xl font-serif font-extrabold text-[#071a3a] leading-tight tracking-wide">
                CHITTARANJAN LOCOMOTIVE WORKS
              </h2>
              <div className="text-xs font-semibold text-slate-600 mb-2">
                भारतीय रेल / INDIAN RAILWAYS
              </div>
              <div className="inline-block px-6 py-1 bg-[#072b42] text-amber-300 border border-[#d4a017] rounded-full text-xs font-extrabold tracking-wider uppercase shadow-xs">
                VIGILANCE DEPARTMENT
              </div>
            </div>

            {/* Top Right VAW 2026 Header */}
            <div className="md:col-span-3 text-center md:text-right flex flex-col items-center md:items-end">
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#071a3a] tracking-wider uppercase">
                  VIGILANCE
                </div>
                <div className="text-sm font-extrabold text-blue-900 tracking-wider uppercase">
                  AWARENESS WEEK 2026
                </div>
              </div>
              <div className="mt-1 bg-[#a81c1c] text-white px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase shadow-2xs">
                PROBITY FOR PROSPERITY
              </div>
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">
                INTEGRITY | TRANSPARENCY | SELF-RELIANCE
              </div>
            </div>

          </div>

          {/* Central 3D Golden Ribbon */}
          <div className="my-6 relative text-center">
            <div className="inline-block relative px-8 py-3.5 bg-gradient-to-r from-[#f2ca65] via-[#e5b338] to-[#cb9318] text-[#5c1202] rounded-xl border-2 border-[#9c6f08] shadow-md transform hover:scale-[1.01] transition-transform">
              <span className="text-2xl sm:text-4xl font-serif italic font-extrabold tracking-wide drop-shadow-2xs">
                {type === 'pledge' ? 'Certificate of Commitment' : 'Certificate of Participation'}
              </span>
            </div>
          </div>

          {/* Body Certification Statement */}
          <div className="max-w-3xl mx-auto text-center my-4 space-y-3">
            <p className="text-xs sm:text-sm font-serif italic text-slate-700">
              This is to certify that
            </p>

            {/* Dotted underline container with Participant Name */}
            <div className="relative border-b-2 border-dotted border-slate-400 pb-1 max-w-xl mx-auto">
              <span className="text-2xl sm:text-4xl font-serif font-extrabold text-[#071a3a] tracking-wide">
                {recipientName}
              </span>
            </div>

            {(designation || organization) && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-800 pt-1">
                {designation && (
                  <span className="bg-white border border-amber-300 px-3 py-0.5 rounded-full shadow-2xs">
                    {designation}
                  </span>
                )}
                {organization && (
                  <span className="bg-white border border-amber-300 px-3 py-0.5 rounded-full shadow-2xs">
                    {organization}
                  </span>
                )}
              </div>
            )}

            {type === 'pledge' ? (
              <>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-2">
                  has taken the <strong className="text-[#071a3a] font-bold">Integrity Pledge</strong> during
                </p>
                <div className="text-base sm:text-xl font-serif font-extrabold text-[#800000] tracking-wide">
                  Vigilance Awareness Week 2026
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  organized by Vigilance Department, Chittaranjan Locomotive Works,
                </p>
                <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed italic pt-1">
                  and has solemnly committed to uphold the highest standards of honesty, integrity and transparency in all activities towards building a corruption-free India.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-2">
                  has actively participated in the <strong className="text-[#071a3a] font-bold">Quiz Competition</strong> organized during
                </p>
                <div className="text-base sm:text-xl font-serif font-extrabold text-[#800000] tracking-wide">
                  Vigilance Awareness Week 2026
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  by Vigilance Department, Chittaranjan Locomotive Works.
                </p>
                <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed italic pt-1">
                  We appreciate your enthusiasm, knowledge and commitment towards promoting integrity, transparency and a corruption-free workplace.
                </p>
              </>
            )}
          </div>

          {/* Middle Layout: Left Train Graphic, Center Score / Ref ID, Right 5 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-6 py-4 border-t border-b border-amber-200/80 bg-amber-50/30 rounded-xl px-4">
            
            {/* Left: Electric Locomotive Graphic Badge */}
            <div className="md:col-span-4 text-left flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-extrabold shrink-0 border border-amber-400">
                🚆
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-[#071a3a]">
                  CHITTARANJAN LOCOMOTIVE WORKS
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Electric Locomotive Manufacturing Hub · Indian Railways
                </div>
              </div>
            </div>

            {/* Center Reference / Score Box */}
            <div className="md:col-span-4 text-center bg-[#071a3a] text-white p-3 rounded-xl shadow-xs border border-amber-400/40">
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                {type === 'pledge' ? 'Pledge Reference Number' : 'Quiz Certificate ID'}
              </div>
              <div className="text-sm font-mono font-extrabold text-white mt-0.5">
                {certificateId}
              </div>
              {quizScore !== undefined && totalQuestions !== undefined && (
                <div className="text-[11px] font-mono font-semibold text-amber-200 mt-1">
                  Score: {quizScore} / {totalQuestions}
                </div>
              )}
            </div>

            {/* Right: 5 Core Pillars with Icons */}
            <div className="md:col-span-4 text-left space-y-1 pl-2">
              <div className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider mb-1">
                Core Pillars
              </div>
              <div className="text-[10px] font-bold text-blue-900 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-blue-700 shrink-0" />
                <span>ZERO CORRUPTION</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-900 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>ETHICAL WORK CULTURE</span>
              </div>
              <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1.5">
                <Settings className="w-3 h-3 text-amber-700 shrink-0" />
                <span>TRANSPARENT PROCESSES</span>
              </div>
              <div className="text-[10px] font-bold text-purple-900 flex items-center gap-1.5">
                <Handshake className="w-3 h-3 text-purple-700 shrink-0" />
                <span>ACCOUNTABLE ADMINISTRATION</span>
              </div>
              <div className="text-[10px] font-bold text-green-900 flex items-center gap-1.5">
                <Sprout className="w-3 h-3 text-green-700 shrink-0" />
                <span>PROSPEROUS RAILWAYS</span>
              </div>
            </div>

          </div>

          {/* Footer Row: Left Place/Date, Right CVO Signature Block */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="text-left space-y-0.5">
              <div className="text-xs font-bold text-slate-900">
                Place : Chittaranjan
              </div>
              <div className="text-xs font-bold text-slate-900">
                Date : {date}
              </div>
            </div>

            {/* Right CVO Signature Line */}
            <div className="text-center sm:text-right min-w-[240px]">
              <div className="h-12 flex items-center justify-center sm:justify-end mb-1">
                <svg viewBox="0 0 200 50" className="h-10 w-auto text-[#071a3a]">
                  <path
                    d="M 20 35 C 15 18, 28 8, 38 22 C 48 36, 52 12, 65 28 C 75 42, 85 18, 100 32 C 115 38, 135 28, 170 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="75" cy="12" r="2.5" fill="currentColor" />
                  <circle cx="90" cy="10" r="2.5" fill="currentColor" />
                </svg>
              </div>

              <div className="w-48 h-0.5 bg-[#071a3a] mx-auto sm:ml-auto mb-1" />

              <div className="text-xs font-extrabold text-slate-900">
                SUGIND SURENDRAN
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                SDGM &amp; CVO
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Chittaranjan Locomotive Works
              </div>
            </div>
          </div>

        </div>
      </article>

      <canvas ref={canvasRef} width={2000} height={1414} className="hidden" />

      <div className="no-print mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
        <span>Click "Download PNG" for high-resolution certificate, "Print" for PDF, or "Save to Google Drive" to backup to your cloud.</span>
        <button
          onClick={() => setDriveModalOpen(true)}
          className="text-blue-900 font-bold hover:underline inline-flex items-center gap-1"
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Manage Drive Files</span>
        </button>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <DriveModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
      />
    </div>
  );
};
