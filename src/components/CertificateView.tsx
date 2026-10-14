import React from 'react';
import { CrestEmblem, SealStamp } from './CrestEmblem';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  const handlePrint = () => {
    window.print();
  };

  const percentage = quizScore && totalQuestions ? Math.round((quizScore / totalQuestions) * 100) : 0;
  const gradeText = percentage >= 90 ? 'Grade: Exemplary Distinction' : percentage >= 75 ? 'Grade: High Merit' : 'Grade: Qualified';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Control bar (hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {type === 'pledge' ? 'Official Integrity Certificate' : 'Quiz Merit Certificate'}
            </h3>
            <p className="text-xs text-slate-500">
              Verified record ID: <span className="font-mono text-slate-700">{certificateId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Canvas */}
      <div className="certificate-print-area relative bg-amber-50/20 border-8 border-double border-amber-900/40 p-8 sm:p-12 rounded-lg shadow-md overflow-hidden text-slate-900">
        {/* Subtle Watermark background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <CrestEmblem size={480} monochrome />
        </div>

        {/* Ornate Corner Accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800" />

        {/* Inner Border */}
        <div className="border border-amber-800/20 p-6 sm:p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Header Emblem */}
          <div className="mb-3">
            <CrestEmblem size={80} />
          </div>

          <div className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">
            Central Vigilance Commission · Vigilance Awareness Week 2026
          </div>
          <div className="text-[11px] tracking-wider text-amber-900 font-serif mb-4">
            सत्यनिष्ठा की संस्कृति से राष्ट्र की समृद्धि · Culture of Integrity for Nation's Prosperity
          </div>

          <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-800/40 to-transparent mb-6" />

          {/* Certificate Title */}
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-wide uppercase mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
            {type === 'pledge' ? 'Certificate of Commitment' : 'Certificate of Vigilance Merit'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 italic mb-4 max-w-xl">
            {type === 'pledge'
              ? 'This is to solemnly certify that the participant has taken the official Integrity Pledge, upholding the highest standards of probity, transparency, and ethical governance.'
              : 'This is to certify that the participant has successfully demonstrated comprehensive proficiency in Vigilance Rules, CVC Directives, and Anti-Corruption Governance.'}
          </p>

          {/* Recipient Name Block */}
          <div className="my-3 py-2 px-6 border-b-2 border-amber-800/50 min-w-[280px] max-w-lg">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-950 tracking-wider">
              {recipientName || 'Valued Public Servant'}
            </div>
            {(designation || organization) && (
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {[designation, organization].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="max-w-2xl text-xs sm:text-sm text-slate-700 leading-relaxed mt-4 mb-6">
            {type === 'pledge' ? (
              <p>
                In solemn testimony whereof, the pledge affirms unconditional commitment to eradicate corruption, uphold the Canons of Financial Propriety, adhere strictly to Conduct Rules, and act with undivided integrity in service of the Nation.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p>
                  Successfully cleared the <strong>Vigilance Awareness Grand Assessment 2026</strong> with an outstanding score of <strong>{quizScore} / {totalQuestions} ({percentage}%)</strong>.
                </p>
                <span className="text-xs font-semibold text-blue-900 bg-blue-50/80 px-3 py-1 rounded-sm mt-1 border border-blue-200">
                  {gradeText}
                </span>
              </div>
            )}
          </div>

          {/* Signatures & Verification Row */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-amber-800/20 mt-4 text-left">
            {/* Left: Issue Date & Verification */}
            <div className="text-left text-xs space-y-1">
              <div>
                <span className="text-slate-500">Date of Issue: </span>
                <span className="font-medium text-slate-800">{date}</span>
              </div>
              <div>
                <span className="text-slate-500">Certificate ID: </span>
                <span className="font-mono text-[11px] font-semibold text-blue-950">{certificateId}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Authenticated E-Certificate</span>
              </div>
            </div>

            {/* Middle: Official Stamp */}
            <div className="flex justify-center">
              <SealStamp certificateId={certificateId} date={date} />
            </div>

            {/* Right: Signature Placeholder */}
            <div className="text-center sm:text-right space-y-1">
              <div className="h-10 flex items-end justify-center sm:justify-end pb-1">
                <span className="font-serif italic text-blue-950 text-sm font-semibold tracking-wider">
                  Vigilance Organization
                </span>
              </div>
              <div className="w-36 h-px bg-slate-400 mx-auto sm:ml-auto" />
              <div className="text-[11px] font-semibold text-slate-800">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-500">
                VAW 2026 Organizing Committee
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="no-print mt-4 text-center text-xs text-slate-500">
        Tip: Select "Save as PDF" in your print dialog to download a high-resolution copy of your certificate.
      </div>
    </div>
  );
};
