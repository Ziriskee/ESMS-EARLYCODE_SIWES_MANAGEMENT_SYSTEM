import {
  CalendarClock,
  FileText,
  ListChecks,
  MessageSquare,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "REPORT_SUBMITTED"
  | "MESSAGE_RECEIVED"
  | "SCHEDULE_UPDATED"
  | "INSTRUCTOR_ASSIGNED";

type Meta = {
  icon: LucideIcon;
  // Token names for icon container bg + icon tint
  bgToken: string;
  iconToken: string;
};

export const notificationMeta: Record<NotificationType, Meta> = {
  TASK_ASSIGNED: {
    icon: ListChecks,
    bgToken: "--notif-task-bg",
    iconToken: "--notif-task-icon",
  },
  REPORT_SUBMITTED: {
    icon: FileText,
    bgToken: "--notif-report-bg",
    iconToken: "--notif-report-icon",
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