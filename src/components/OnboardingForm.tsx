import { useState } from 'react';
import {
  Cloud,
  LayoutGrid,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { PlanConfig, TopicId } from '@/types';
import { TOPICS } from '@/types';

const ICON_MAP: Record<string, typeof Cloud> = {
  Cloud,
  LayoutGrid,
  ShieldCheck,
};

interface Props {
  onGenerate: (config: PlanConfig) => void;
}

export default function OnboardingForm({ onGenerate }: Props) {
  const [examDate, setExamDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [weakAreas, setWeakAreas] = useState<TopicId[]>([]);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  function toggleArea(id: TopicId) {
    setWeakAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examDate) {
      setError('Please select your exam date.');
      return;
    }
    const selected = new Date(examDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected <= today) {
      setError('Please choose a date in the future.');
      return;
    }
    if (weakAreas.length === 0) {
      setError('Select at least one area you want to focus on.');
      return;
    }
    setError('');
    onGenerate({ examDate, weeklyHours, weakAreas });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cloud-500 to-violet2-600 shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            AZ-900 Study Sync
          </h1>
          <p className="text-cloud-700 text-sm font-medium tracking-wide uppercase">
            Unofficial
          </p>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            Build a personalized study schedule for the Microsoft Azure Fundamentals
            exam. Pick your date, set your hours, and let the plan come to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl card-shadow p-6 sm:p-8 space-y-7 animate-fade-in-up">
          {/* Exam Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4 text-cloud-500" />
              Exam Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:ring-2 focus:ring-cloud-400 focus:border-transparent outline-none transition text-gray-700 font-medium"
            />
          </div>

          {/* Weekly Hours */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Clock className="w-4 h-4 text-cloud-500" />
              Available Hours per Week
              <span className="ml-auto px-3 py-1 rounded-lg bg-gradient-to-r from-cloud-500 to-violet2-600 text-white text-sm font-bold">
                {weeklyHours}h
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-cloud-200 to-violet2-200 accent-cloud-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1h</span>
              <span>10h</span>
              <span>20h</span>
            </div>
          </div>

          {/* Weak Areas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Areas You Want to Focus On
            </label>
            <div className="space-y-3">
              {TOPICS.map((topic) => {
                const Icon = ICON_MAP[topic.icon];
                const checked = weakAreas.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleArea(topic.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${
                      checked
                        ? 'border-cloud-400 bg-cloud-50 shadow-sm'
                        : 'border-gray-200 bg-white/60 hover:border-cloud-300 hover:bg-cloud-50/50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${topic.accent}`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{topic.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                    </div>
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
                        checked
                          ? 'bg-cloud-500 border-cloud-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {checked && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 animate-pop-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full gradient-btn rounded-xl py-4 font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg"
          >
            Generate Study Plan
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
