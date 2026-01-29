// Notification utilities
// Noctis uses these to alert Jeremy on Telegram

export interface Notification {
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  project?: string;
}

// These are called from the Clawdbot side, not from the web app
// The web app is read-only for now - Noctis pushes updates

export const notificationTemplates = {
  projectUpdate: (project: string, update: string) => ({
    title: `📊 ${project} Update`,
    message: update,
    priority: 'normal' as const,
    project,
  }),
  
  deadlineApproaching: (project: string, deadline: string) => ({
    title: `⏰ Deadline Approaching`,
    message: `${project}: ${deadline}`,
    priority: 'high' as const,
    project,
  }),
  
  actionRequired: (project: string, action: string) => ({
    title: `🚨 Action Required`,
    message: `${project}: ${action}`,
    priority: 'urgent' as const,
    project,
  }),
  
  milestone: (project: string, milestone: string) => ({
    title: `🎉 Milestone Reached`,
    message: `${project}: ${milestone}`,
    priority: 'normal' as const,
    project,
  }),
};
