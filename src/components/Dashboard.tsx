import { useState, useMemo } from 'react';
import {
  Cloud,
  LayoutGrid,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Target,
  RefreshCw,
  TrendingUp,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import type { StudyPlan, StudySession, TopicId } from '@/types';
import { TOPICS, TOPIC_MAP } from '@/types';
import { calcProgress, calcStreak, daysUntilExam } from '@/planGenerator';

const ICON_MAP: Record<string, typeof Cloud> = {
  Cloud,
  LayoutGrid,
  ShieldCheck,
};

const ENCOURAGEMENTS = [
  "Momentum is building - keep going!",
  "Every session brings you closer to certified.",
  "Consistency is your superpower.",
  "That's a solid rep. On to the next!",
  "Future you says thanks.",
  "You're outpacing the crowd.",
];

interface Props {
  plan: StudyPlan;
  onToggle: (sessionId: string) => void;
  onReset: () => void;
}

export default function Dashboard({ plan, onToggle, onReset }: Props) {
  const [encourageMsg, setEncourageMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = useMemo(() => calcProgress(plan.sessions), [plan.sessions]);
  const streak = useMemo(() => calcStreak(plan.sessions), [plan.sessions]);
  const daysLeft = useMemo(
    () => daysUntilExam(plan.config.examDate),
    [plan.config.examDate],
  );

  const completedCount = plan.sessions.filter((s) => s.completed && !s.isExamDay).length;
  const totalCount = plan.sessions.filter((s) => !s.isExamDay).length;
  const totalHours = plan.sessions
    .filter((s) => !s.isExamDay)
    .reduce((sum, s) => sum + s.hours, 0);

  // Per-topic progress
  const topicProgress = useMemo(() => {
    return TOPICS.map((t) => {
      const topicSessions = plan.sessions.filter((s) => s.topicId === t.id && !s.isExamDay);
      const done = topicSessions.filter((s) => s.completed).length;
      return { topic: t, done, total: topicSessions.length, pct: topicSessions.length ? Math.round((done / topicSessions.length) * 100) : 0 };
    });
  }, [plan.sessions]);

  function handleToggle(id: string) {
    onToggle(id);
    const session = plan.sessions.find((s) => s.id === id);
    if (session && !session.completed) {
      setEncourageMsg(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
      setTimeout(() => setEncourageMsg(null), 3000);
    }
  }

  return (
    <div className="min-h-screen w-full px-4 py-8 sm:py-12">
      {/* Confetti burst */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pop-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                backgroundColor: ['#0e8ce8', '#8c5ff0', '#38a9f8', '#a688f7', '#34d399'][i % 5],
                transform: `translate(${(Math.random() - 0.5) * 300}px, ${Math.random() * 400}px)`,
                opacity: 0,
                animation: `popIn 0.3s ease-out`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cloud-500 to-violet2-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Your Study Plan</h1>
              <p className="text-sm text-gray-500">AZ-900 Study Sync (Unofficial)</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-white/40 text-sm font-medium text-gray-600 hover:text-cloud-600 hover:border-cloud-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            New Plan
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Readiness"
            value={`${progress}%`}
            gradient="from-cloud-500 to-violet2-600"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={`${streak} ${streak === 1 ? 'session' : 'sessions'}`}
            gradient="from-orange-400 to-red-500"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Completed"
            value={`${completedCount} / ${totalCount}`}
            gradient="from-emerald-400 to-teal-500"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Days to Exam"
            value={`${daysLeft}`}
            gradient="from-fuchsia-400 to-purple-600"
          />
        </div>

        {/* Progress Bar */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Overall Readiness</span>
            <span className="text-lg font-bold gradient-text">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cloud-400 via-cloud-500 to-violet2-600 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {totalHours} total study hours across {totalCount} sessions
          </p>
        </div>

        {/* Topic Progress Breakdown */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {topicProgress.map(({ topic, done, total, pct }) => {
            const Icon = ICON_MAP[topic.icon];
            return (
              <div key={topic.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${topic.accent}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{topic.shortName}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                  <span className="text-xs text-gray-400">{done}/{total} done</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${topic.accent} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement toast */}
        {encourageMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-pop-in">
            <div className="glass-dark rounded-2xl px-5 py-3 flex items-center gap-3 text-white shadow-xl">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">{encourageMsg}</span>
            </div>
          </div>
        )}

        {/* Sessions Timeline */}
        <div className="mb-4 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <BookOpen className="w-5 h-5 text-cloud-500" />
          <h2 className="text-lg font-bold text-gray-800">Study Timeline</h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cloud-300 via-violet2-300 to-transparent" />

          <div className="space-y-4">
            {plan.sessions.map((session, idx) => (
              <SessionCard
                key={session.id}
                session={session}
                onToggle={handleToggle}
                index={idx}
              />
            ))}
          </div>
        </div>

        {/* Milestone banner */}
        {progress === 100 && (
          <div className="mt-8 glass rounded-2xl p-6 text-center animate-pop-in">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800">You're exam-ready!</h3>
            <p className="text-gray-500 text-sm mt-1">
              All study sessions complete. Review your notes and go ace that exam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onToggle,
  index,
}: {
  session: StudySession;
  onToggle: (id: string) => void;
  index: number;
}) {
  const topic = TOPIC_MAP[session.topicId];
  const Icon = ICON_MAP[topic.icon];

  if (session.isExamDay) {
    return (
      <div
        className="relative pl-14 animate-fade-in-up"
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <div className="absolute left-2.5 top-3 w-5 h-5 rounded-full bg-gradient-to-br from-cloud-500 to-violet2-600 flex items-center justify-center ring-4 ring-white">
          <GraduationCap className="w-3 h-3 text-white" />
        </div>
        <div className="rounded-2xl p-5 bg-gradient-to-r from-cloud-500 to-violet2-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg">Exam Day - {session.dayLabel}</p>
              <p className="text-white/80 text-sm">You've got this. Go get certified!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative pl-14 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-2.5 top-5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white transition-colors ${
          session.completed
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
            : `bg-gradient-to-br ${topic.accent}`
        }`}
      >
        {session.completed ? (
          <CheckCircle2 className="w-3 h-3 text-white" />
        ) : (
          <Icon className="w-3 h-3 text-white" />
        )}
      </div>

      <div
        className={`rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
          session.completed
            ? 'bg-emerald-50/70 backdrop-blur border border-emerald-200/50'
            : 'glass hover:shadow-lg hover:scale-[1.01]'
        }`}
        onClick={() => onToggle(session.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${topic.accent}`}>
                {session.topicName}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.hours} {session.hours === 1 ? 'hour' : 'hours'}
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm mb-2">{session.dayLabel}</p>
            <ul className="space-y-1">
              {session.subtopics.map((st, i) => (
                <li
                  key={i}
                  className={`text-xs flex items-start gap-1.5 ${
                    session.completed ? 'text-gray-400 line-through' : 'text-gray-600'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-cloud-400" />
                  {st}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="flex-shrink-0 mt-1 transition-transform hover:scale-110 active:scale-90"
            aria-label={session.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {session.completed ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            ) : (
              <Circle className="w-7 h-7 text-gray-300 hover:text-cloud-400 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
