import { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import OnboardingForm from '@/components/OnboardingForm';
import Dashboard from '@/components/Dashboard';
import type { PlanConfig, StudyPlan } from '@/types';
import { generatePlan } from '@/planGenerator';
import { loadPlan, savePlan, clearPlan } from '@/storage';

function App() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadPlan();
    if (saved) setPlan(saved);
    setLoaded(true);
  }, []);

  function handleGenerate(config: PlanConfig) {
    const sessions = generatePlan(config);
    const newPlan: StudyPlan = {
      config,
      sessions,
      createdAt: new Date().toISOString(),
    };
    setPlan(newPlan);
    savePlan(newPlan);
  }

  function handleToggle(sessionId: string) {
    if (!plan) return;
    const updated = {
      ...plan,
      sessions: plan.sessions.map((s) =>
        s.id === sessionId ? { ...s, completed: !s.completed } : s,
      ),
    };
    setPlan(updated);
    savePlan(updated);
  }

  function handleReset() {
    clearPlan();
    setPlan(null);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Cloud className="w-8 h-8 text-cloud-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-cloud-50 via-white to-violet2-50">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cloud-200/30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet2-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-cloud-100/40 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Content */}
      <div className="relative z-10">
        {plan ? (
          <Dashboard plan={plan} onToggle={handleToggle} onReset={handleReset} />
        ) : (
          <OnboardingForm onGenerate={handleGenerate} />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center">
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          This is an unofficial study tool created for the #1MillionDevs Hackathon
          and is not affiliated with Microsoft.
        </p>
      </footer>
    </div>
  );
}

export default App;
