export type DashboardUser = {
  first_name: string;
  last_name: string;
  role: "ADMIN" | "INSTRUCTOR" | "INTERN";
};

export type Placement = {
  start_date: string;
  end_date: string;
  total_weeks: number;
  weeks_completed: number;
  weeks_remaining: number;
  days_remaining: number;
  percent_complete: number;
};

export type DashboardStats = {
  reports_submitted: number;
  tasks_pending: number;
  tasks_completed: number;
  unread_messages: number;
  unread_notifications: number;
};

export type RecentReport = {
  id: string;
  title: string;
  submitted_at: string;
  status: "SUBMITTED" | "REVIEWED";
};

export type UpcomingDay = {
  date: string;
  shift: "MORNING" | "AFTERNOON";
  start_time: string;
  end_time: string;
};

export type Attendance = {
  has_schedule: boolean;
  upcoming_days: UpcomingDay[];
};

export type DashboardData = {
  user: DashboardUser;
  placement: Placement | null;
  stats: DashboardStats;
  recent_reports: RecentReport[];
  attendance: Attendance;
};
