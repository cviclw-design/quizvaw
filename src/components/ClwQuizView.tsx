import React, { useState, useEffect } from 'react';
import { api, QuizQuestionData, CertificateData, ParticipantData, LeaderboardEntry } from '../services/api';
import { soundEffects } from '../utils/audio';
import { ClwCertificateView } from './ClwCertificateView';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  RefreshCw,
  Trophy,
  Clock,
  Zap,
  Medal,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

interface ClwQuizViewProps {
  participant: ParticipantData;
  initialQuestions: QuizQuestionData[];
  initialSeconds: number;
  initialAnswers: Record<string, string>;
  onHome: () => void;
}

export const ClwQuizView: React.FC<ClwQuizViewProps> = ({
  participant,
  initialQuestions,
  initialSeconds = 45,
  initialAnswers = {},
  onHome
}) => {
  const [questions] = useState<QuizQuestionData[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  // Live Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const currentQ = questions[currentIndex];
  const maxSeconds = initialSeconds || 45;

  // Question countdown timer & overall elapsed timer
  useEffect(() => {
    if (certificate || isSubmitting) return;

    setTimeRemaining(maxSeconds);
    setSelectedOption(null);
    setErrorMessage('');

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGrade('timeout');
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, certificate, isSubmitting, maxSeconds]);

  // Load live leaderboard periodically during test
  useEffect(() => {
    loadLiveLeaderboard();
    const interval = setInterval(loadLiveLeaderboard, 8000);
    return () => clearInterval(interval);
  }, [participant.department]);

  const loadLiveLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await api.getLeaderboard(participant.department, 8);
      if (res.ok) {
        setLeaderboard(res.leaderboard || []);
        setTotalParticipants(res.total_participants || 0);
      }
    } catch (err) {
      console.warn('Leaderboard load warning:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleSelect = (idx: number) => {
    soundEffects.playClick();
    setSelectedOption(String(idx));
    setErrorMessage('');
  };

  const handleGrade = async (mode: 'answer' | 'skip' | 'timeout') => {
    if (isSubmitting) return;

    if (mode === 'answer' && selectedOption === null) {
      soundEffects.playIncorrect();
      setErrorMessage('Please select an option or choose "Not Answering".');
      return;
    }

    const valueToSave = mode === 'skip' ? 'skip' : (mode === 'answer' ? (selectedOption ?? '') : '');

    try {
      soundEffects.playClick();
      await api.saveAnswer(participant.pf, currentQ.id, valueToSave);
    } catch (err: unknown) {
      console.warn('Answer save notice:', err);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsSubmitting(true);
    try {
      soundEffects.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      await api.submitQuiz(participant.pf);

      const certRes = await api.getCertificate(participant.pf);
      if (certRes.ok && certRes.certificate) {
        setCertificate(certRes.certificate);
      }
    } catch (err: unknown) {
      console.error('Quiz submission error:', err);
      try {
        const certRes = await api.getCertificate(participant.pf);
        if (certRes.ok && certRes.certificate) {
          setCertificate(certRes.certificate);
        }
      } catch {
        alert('Assessment submitted! Refreshing certificate.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (certificate) {
    return <ClwCertificateView cert={certificate} onHome={onHome} />;
  }

  if (isSubmitting) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <RefreshCw className="w-10 h-10 text-[#071a3a] animate-spin mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Finalising Assessment & Timing...</h2>
        <p className="text-xs text-slate-500 mt-1">Generating official participation certificate with verified test duration.</p>
      </div>
    );
  }

  const isTimerWarning = timeRemaining <= 10;
  const progressPct = ((currentIndex + 1) / questions.length) * 100;
  const elapsedMins = Math.floor(totalElapsed / 60);
  const elapsedSecs = totalElapsed % 60;
  const formattedElapsed = `${String(elapsedMins).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Timing Factor Header Banner */}
      <div className="bg-gradient-to-r from-[#071a3a] via-[#0d2a58] to-[#071a3a] text-white rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4 border border-amber-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
            <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Timing Factor Active
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Speed + Accuracy Ranking
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              Score is priority #1. Faster completion time decides top leaderboard ranks when scores tie!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Total Elapsed Time Clock */}
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] uppercase text-amber-200 font-semibold block">
              Total Elapsed Time
            </span>
            <span className="text-lg font-mono font-extrabold text-white leading-tight">
              {formattedElapsed}
            </span>
          </div>

          {/* Toggle Live Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-[#071a3a] font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            <span>{showLeaderboard ? 'Hide Leaderboard' : 'Show Live Leaderboard'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Quiz Area (8 cols when leaderboard shown, 12 when hidden) */}
        <div className={showLeaderboard ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="bg-white border border-[#eadcc4] rounded-2xl p-6 sm:p-8 shadow-md">
            
            {/* Quiz Header: Participant Info + Question Countdown */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-[#8a6a12] uppercase mb-0.5">
                  CLW VAW 2026 ONLINE QUIZ
                </div>
                <div className="text-base sm:text-xl font-extrabold text-[#071a3a]">
                  Question {currentIndex + 1} of {questions.length}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {participant.name} · PF {participant.pf} · {participant.department}
                </div>
              </div>

              {/* Circular Countdown Timer per question */}
              <div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center font-extrabold font-mono transition-all shadow-xs ${
                  isTimerWarning
                    ? 'bg-red-50 text-red-600 ring-4 ring-red-400/40 animate-pulse'
                    : 'bg-amber-50 text-amber-900 ring-4 ring-amber-400/30'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl leading-none">{timeRemaining}</span>
                  <span className="text-[9px] block uppercase font-sans font-semibold tracking-wider opacity-70">
                    sec Q-{currentIndex + 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="w-full bg-[#efe6d6] h-2.5 rounded-full overflow-hidden my-5">
              <div
                className="h-full bg-gradient-to-r from-[#ff8a1e] to-[#128a45] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Question Statement */}
            <div className="my-6">
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#071a3a] leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((optionText, idx) => {
                const isSelected = selectedOption === String(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#128a45] bg-[#eefbf3] text-[#071a3a] shadow-xs font-semibold ring-2 ring-[#128a45]/30'
                        : 'border-[#eadcc4] bg-white text-slate-800 hover:border-[#d4a017] hover:bg-[#fffdf8]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#128a45] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-snug mt-1">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#eadcc4]">
              <button
                type="button"
                onClick={() => handleGrade('skip')}
                className="px-4 py-2.5 rounded-xl border border-[#eadcc4] text-xs font-bold text-[#071a3a] bg-white hover:bg-slate-50 transition-colors"
              >
                Not Answering (Skip)
              </button>

              <button
                type="button"
                onClick={() => handleGrade('answer')}
                className="px-6 py-2.5 rounded-xl bg-[#128a45] hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>{currentIndex === questions.length - 1 ? 'Submit Final Assessment' : 'Submit Answer'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-center text-[11px] text-slate-400">
              Scoring Rule: +1.0 for Correct · −0.5 for Wrong or Blank/Timeout · 0 for "Not Answering".
            </div>
          </div>
        </div>

        {/* Live Leaderboard Side Widget (4 cols) */}
        {showLeaderboard && (
          <div className="lg:col-span-4 bg-white border border-[#eadcc4] rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#071a3a]">
                  Live Department Leaderboard
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {participant.department}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-4">
              Real-time standings showing candidates ranked by score & fastest completion time:
            </p>

            {loadingLeaderboard && leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                <span>Updating live standings...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-amber-50/50 rounded-xl border border-amber-100 p-4">
                <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">You are setting the pace!</p>
                <p className="text-[11px] mt-1">Be the first in {participant.department} department to submit and claim Rank #1 on the board.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {leaderboard.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  const rankColor =
                    entry.rank === 1
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : entry.rank === 2
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : entry.rank === 3
                      ? 'bg-orange-100 text-orange-900 border-orange-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200';

                  const badgeIcon =
                    entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;

                  return (
                    <div
                      key={entry.rank + entry.pf_masked}
                      className={`p-3 rounded-xl border transition-all ${
                        entry.pf_full === participant.pf
                          ? 'border-emerald-500 bg-emerald-50 shadow-xs'
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${rankColor}`}
                          >
                            {badgeIcon}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {entry.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {entry.pf_masked} · {entry.designation}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-extrabold text-[#071a3a]">
                            {entry.score} pts
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{entry.time_formatted}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{totalParticipants} total test takers</span>
              </span>
              <button
                onClick={loadLiveLeaderboard}
                className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
