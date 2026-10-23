export type TopicId = 'cloud-concepts' | 'azure-architecture' | 'azure-management';

export interface Topic {
  id: TopicId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  subtopics: string[];
  accent: string;
}

export interface StudySession {
  id: string;
  date: string;
  dayLabel: string;
  hours: number;
  topicId: TopicId;
  topicName: string;
  subtopics: string[];
  completed: boolean;
  isExamDay?: boolean;
}

export interface PlanConfig {
  examDate: string;
  weeklyHours: number;
  weakAreas: TopicId[];
}

export interface StudyPlan {
  config: PlanConfig;
  sessions: StudySession[];
  createdAt: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'cloud-concepts',
    name: 'Describe Cloud Concepts',
    shortName: 'Cloud Concepts',
    icon: 'Cloud',
    description: 'Understand the core principles of cloud computing and what sets it apart from on-premises IT.',
    subtopics: [
      'Cloud computing models: IaaS, PaaS, SaaS',
      'Public, private, and hybrid cloud models',
      'Consumption-based pricing and OpEx vs. CapEx',
      'Benefits of cloud: scalability, elasticity, reliability',
    ],
    accent: 'from-sky-400 to-cyan-400',
  },
  {
    id: 'azure-architecture',
    name: 'Describe Azure Architecture and Services',
    shortName: 'Azure Architecture',
    icon: 'LayoutGrid',
    description: 'Explore the core Azure services, compute options, networking, and storage that power the platform.',
    subtopics: [
      'Compute: VMs, App Services, Azure Functions (serverless)',
      'Storage: Blob, Disk, File, and Archive tiers',
      'Networking: VNets, subnets, and load balancers',
      'Identity: Entra ID (formerly Azure AD), RBAC, MFA',
    ],
    accent: 'from-violet-400 to-fuchsia-400',
  },
  {
    id: 'azure-management',
    name: 'Describe Azure Management and Governance',
    shortName: 'Azure Governance',
    icon: 'ShieldCheck',
    description: 'Learn how to manage, monitor, and govern Azure resources efficiently across your organization.',
    subtopics: [
      'Cost management: Cost analysis, budgets, alerts',
      'Azure Policy and resource compliance',
      'Monitoring: Azure Monitor, Log Analytics, alerts',
      'Governance: Blueprints, locks, and resource groups',
    ],
    accent: 'from-teal-400 to-emerald-400',
  },
];

export const TOPIC_MAP: Record<TopicId, Topic> = TOPICS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TopicId, Topic>,
);
