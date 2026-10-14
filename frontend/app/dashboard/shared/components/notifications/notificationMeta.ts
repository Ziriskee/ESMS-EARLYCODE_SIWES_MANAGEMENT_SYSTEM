import {
  AlarmClock,
  CalendarClock,
  ClipboardCheck,
  Clock,
  ListChecks,
  MessageSquare,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_SUBMITTED"
  | "TASK_REVIEWED"
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "MESSAGE_RECEIVED"
  | "SCHEDULE_UPDATED"
  | "INSTRUCTOR_ASSIGNED"
  | "NEW_REGISTRATION";

type Meta = {
  icon: LucideIcon;
  bgToken: string;
  iconToken: string;
};

export const notificationMeta: Record<NotificationType, Meta> = {
  TASK_ASSIGNED: {
    icon: ListChecks,
    bgToken: "--notif-task-bg",
    iconToken: "--notif-task-icon",
  },
  TASK_SUBMITTED: {
    icon: Upload,
    bgToken: "--notif-task-bg",
    iconToken: "--notif-task-icon",
  },
  TASK_REVIEWED: {
    icon: ClipboardCheck,
    bgToken: "--notif-task-bg",
    iconToken: "--notif-task-icon",
  },
  TASK_DUE_SOON: {
    icon: Clock,
    bgToken: "--notif-schedule-bg",
    iconToken: "--notif-schedule-icon",
  },
  TASK_OVERDUE: {
    icon: AlarmClock,
    bgToken: "--status-action-bg",
    iconToken: "--status-action-text",
  },

  MESSAGE_RECEIVED: {
    icon: MessageSquare,
    bgToken: "--notif-message-bg",
    iconToken: "--notif-message-icon",
  },
  SCHEDULE_UPDATED: {
    icon: CalendarClock,
    bgToken: "--notif-schedule-bg",
    iconToken: "--notif-schedule-icon",
  },
  INSTRUCTOR_ASSIGNED: {
    icon: UserPlus,
    bgToken: "--notif-instructor-bg",
    iconToken: "--notif-instructor-icon",
  },
  NEW_REGISTRATION: {
    icon: UserPlus,
    bgToken: "--notif-instructor-bg",
    iconToken: "--notif-instructor-icon",
  },
};

export function getNotificationMeta(type: string): Meta {
  return (
    notificationMeta[type as NotificationType] ?? {
      icon: ListChecks,
      bgToken: "--notif-task-bg",
      iconToken: "--notif-task-icon",
    }
  );
}

// ── Type grouping for the feed filter ────────────────────────────
export type NotificationGroup =
  | "all"
  | "tasks"
  | "messages"
  | "system";

export const NOTIFICATION_GROUPS: Record<
  NotificationGroup,
  NotificationType[]
> = {
  all: [],
  tasks: ["TASK_ASSIGNED", "TASK_SUBMITTED", "TASK_REVIEWED"],
  messages: ["MESSAGE_RECEIVED"],
  system: ["SCHEDULE_UPDATED", "INSTRUCTOR_ASSIGNED"],
};

export const GROUP_LABELS: Record<NotificationGroup, string> = {
  all: "All",
  tasks: "Tasks",
  messages: "Messages",
  system: "System",
};
