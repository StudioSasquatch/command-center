export type ProjectStatus = 'active' | 'pending' | 'blocked' | 'complete';
export type ProjectPriority = 1 | 2 | 3 | 4 | 5;

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number; // 0-100
  nextAction: string;
  category: 'venture' | 'content' | 'life';
  accentColor: 'orange' | 'cyan' | 'purple' | 'green' | 'amber';
  metrics?: {
    label: string;
    value: string | number;
  }[];
}

export interface Activity {
  id: string;
  timestamp: Date;
  project: string;
  action: string;
  type: 'update' | 'decision' | 'milestone' | 'alert';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}
