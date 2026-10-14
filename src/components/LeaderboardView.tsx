import React, { useState, useEffect } from 'react';
import { api, LeaderboardEntry } from '../services/api';
import {
  Trophy,
  Clock,
  Zap,
  Medal,
  RefreshCw,
  Search,
  Users,
  Filter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface LeaderboardViewProps {
  departments: string[];
  onStartQuiz: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  departments,
  onStartQuiz
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaderboard(selectedDept, 100);
      if (res.ok) {
        setEntries(res.leaderboard || []);
        setTotalCount(res.total_participants || 0);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(e => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term) ||
      e.designation.toLowerCase().includes(term) ||
      e.pf_masked.toLowerCase().includes(term)
    );
  });

  const top3 = filteredEntries.slice(0, 3);
  const rest = filteredEntries.slice(3);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071a3a] via-[#123a86] to-[#0b6b3a] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden border border-amber-400/30">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Official CLW VAW 2026 Standings</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white leading-tight mb-3">
            Leaderboard &amp; Speed Rankers
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6">
            Candidates are ranked primarily by <strong className="text-amber-300">Quiz Score</strong>, and secondarily by <strong className="text-emerald-300 font-bold">Completion Time (Timing Factor)</strong>. When scores tie, candidates with faster completion speeds earn top ranks!
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Take Quiz &amp; Compete</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={loadData}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ranks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or PF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && entries.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Loading Live Leaderboard...</h3>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-600 shadow-xs">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Submissions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Be the first candidate in {selectedDept} department to complete the quiz and establish Rank #1!
          </p>
          <button
            onClick={onStartQuiz}
            className="px-6 py-2.5 bg-[#071a3a] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0d2a58] transition-colors"
          >
            Start Quiz Now
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Highlights */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {top3.map((entry) => {
                const isGold = entry.rank === 1;
                const isSilver = entry.rank === 2;
                const isBronze = entry.rank === 3;

                const bgClass = isGold
                  ? 'bg-gradient-to-b from-amber-50 via-amber-100/50 to-white border-amber-300 ring-2 ring-amber-400/40'
                  : isSilver
                  ? 'bg-gradient-to-b from-slate-50 via-slate-100/50 to-white border-slate-300'
                  : 'bg-gradient-to-b from-orange-50 via-orange-100/50 to-white border-orange-300';

                const badgeBg = isGold
                  ? 'bg-amber-400 text-slate-950'
                  : isSilver
                  ? 'bg-slate-300 text-slate-900'
                  : 'bg-orange-400 text-slate-950';

                const icon = isGold ? '🥇' : isSilver ? '🥈' : '🥉';

                return (
                  <div
                    key={entry.rank + entry.pf_masked}
                    className={`border rounded-2xl p-6 shadow-md relative overflow-hidden transition-all hover:-translate-y-1 ${bgClass}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`w-10 h-10 rounded-xl font-extrabold text-xl flex items-center justify-center shadow-xs ${badgeBg}`}>
                        {icon}
                      </span>
                      <span className="text-xs font-mono font-extrabold bg-white px-3 py-1 rounded-full border border-slate-200 text-[#071a3a]">
                        Rank #{entry.rank}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-extrabold text-slate-900 leading-tight">
                      {entry.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {entry.pf_masked} · {entry.designation}
                    </p>
                    <div className="mt-2 text-xs font-bold text-slate-700">
                      {entry.department} ({entry.unit})
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Quiz Score</span>
                        <span className="text-xl font-mono font-extrabold text-[#071a3a]">
                          {entry.score} / {entry.max_score}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Completion Speed</span>
                        <span className="text-sm font-mono font-extrabold text-emerald-700 flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{entry.time_formatted}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table of Ranks */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Full Candidate Rankings ({filteredEntries.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Sorted by Score &amp; Completion Time
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">Candidate Name</th>
                    <th className="py-3.5 px-4">Designation &amp; Dept</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Time Factor</th>
                    <th className="py-3.5 px-4 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredEntries.map((row) => (
                    <tr key={row.rank + row.pf_masked} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 font-mono">
                        #{row.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{row.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-medium">{row.pf_masked}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{row.designation}</div>
                        <div className="text-[10px] text-slate-500">{row.department} · {row.unit}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-[#071a3a] text-sm">
                        {row.score} / {row.max_score}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <Clock className="w-3 h-3" />
                          <span>{row.time_formatted}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(row.submitted_at || Date.now()).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
