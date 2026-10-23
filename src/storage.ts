import type { StudyPlan } from '@/types';

const STORAGE_KEY = 'az900-study-sync-plan-v1';

export function loadPlan(): StudyPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudyPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: StudyPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    /* storage full or unavailable */
  }
}

export function clearPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}
