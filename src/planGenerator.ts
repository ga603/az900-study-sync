import type { PlanConfig, StudySession, TopicId } from '@/types';
import { TOPICS } from '@/types';

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function generatePlan(config: PlanConfig): StudySession[] {
  const { examDate, weeklyHours, weakAreas } = config;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exam = new Date(examDate + 'T00:00:00');
  const totalDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) return [];

  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const totalStudyHours = totalWeeks * weeklyHours;

  // Allocate a minimum weight of 1 to each topic, add extra weight to weak areas (×3)
  const weights: Record<TopicId, number> = {
    'cloud-concepts': weakAreas.includes('cloud-concepts') ? 3 : 1,
    'azure-architecture': weakAreas.includes('azure-architecture') ? 3 : 1,
    'azure-management': weakAreas.includes('azure-management') ? 3 : 1,
  };
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);

  // Hours per topic proportional to weight
  const hoursPerTopic: Record<TopicId, number> = {
    'cloud-concepts': Math.round((weights['cloud-concepts'] / weightSum) * totalStudyHours),
    'azure-architecture': Math.round((weights['azure-architecture'] / weightSum) * totalStudyHours),
    'azure-management': Math.round((weights['azure-management'] / weightSum) * totalStudyHours),
  };

  // Build a topic-rotation queue biased toward weak areas (repeat them more often)
  const topicQueue: TopicId[] = [];
  const sortedTopics = [...TOPICS].sort((a, b) => weights[b.id] - weights[a.id]);
  for (const t of sortedTopics) {
    for (let i = 0; i < weights[t.id]; i++) topicQueue.push(t.id);
  }

  // Distribute sessions across available days
  // Aim for ~2h sessions, spread evenly
  const targetSessionHours = 2;
  const sessionsPerTopic: Record<TopicId, number> = {
    'cloud-concepts': Math.max(1, Math.round(hoursPerTopic['cloud-concepts'] / targetSessionHours)),
    'azure-architecture': Math.max(1, Math.round(hoursPerTopic['azure-architecture'] / targetSessionHours)),
    'azure-management': Math.max(1, Math.round(hoursPerTopic['azure-management'] / targetSessionHours)),
  };

  const totalSessions =
    sessionsPerTopic['cloud-concepts'] +
    sessionsPerTopic['azure-architecture'] +
    sessionsPerTopic['azure-management'];

  // Spread sessions evenly across the available days (skip exam day)
  const studyableDays = totalDays - 1; // last day is exam
  const dayInterval = Math.max(1, Math.floor(studyableDays / totalSessions));

  const sessions: StudySession[] = [];
  let topicIdx = 0;
  let sessionCount: Record<TopicId, number> = {
    'cloud-concepts': 0,
    'azure-architecture': 0,
    'azure-management': 0,
  };

  for (let dayOffset = 0; dayOffset < studyableDays; dayOffset += dayInterval) {
    // Pick next topic that still needs sessions, from the biased queue
    let pickedTopic: TopicId | null = null;
    for (let q = 0; q < topicQueue.length; q++) {
      const t = topicQueue[(topicIdx + q) % topicQueue.length];
      if (sessionCount[t] < sessionsPerTopic[t]) {
        pickedTopic = t;
        topicIdx += q + 1;
        break;
      }
    }
    if (!pickedTopic) break;

    const topic = TOPICS.find((t) => t.id === pickedTopic)!;
    const subStart = (sessionCount[pickedTopic] * 2) % topic.subtopics.length;
    const sessionSubtopics = [
      topic.subtopics[subStart],
      topic.subtopics[(subStart + 1) % topic.subtopics.length],
    ];

    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + dayOffset);

    // Hours: split the topic's total hours across its sessions
    const perSessionHours = Math.max(1, Math.round((hoursPerTopic[pickedTopic] / sessionsPerTopic[pickedTopic]) * 2) / 2);

    sessions.push({
      id: `${pickedTopic}-${sessionCount[pickedTopic]}-${fmtDate(sessionDate)}`,
      date: fmtDate(sessionDate),
      dayLabel: dayLabel(sessionDate),
      hours: perSessionHours,
      topicId: pickedTopic,
      topicName: topic.shortName,
      subtopics: sessionSubtopics,
      completed: false,
    });

    sessionCount[pickedTopic]++;
  }

  // Add exam day marker
  sessions.push({
    id: 'exam-day',
    date: fmtDate(exam),
    dayLabel: dayLabel(exam),
    hours: 0,
    topicId: 'cloud-concepts',
    topicName: 'Exam Day',
    subtopics: [],
    completed: false,
    isExamDay: true,
  });

  return sessions;
}

export function calcProgress(sessions: StudySession[]): number {
  const studySessions = sessions.filter((s) => !s.isExamDay);
  if (studySessions.length === 0) return 0;
  const completed = studySessions.filter((s) => s.completed).length;
  return Math.round((completed / studySessions.length) * 100);
}

export function calcStreak(sessions: StudySession[]): number {
  const studySessions = sessions.filter((s) => !s.isExamDay);
  // Sort by date descending
  const sorted = [...studySessions].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const s of sorted) {
    if (s.completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function daysUntilExam(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate + 'T00:00:00');
  return Math.max(0, Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}
