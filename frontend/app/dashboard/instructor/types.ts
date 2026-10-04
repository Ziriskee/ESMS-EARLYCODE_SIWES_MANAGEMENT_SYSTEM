// Shared types for the instructor dashboard.

export type InstructorNavKey = "overview" | "interns" | "reports" | "profile";

export type AssignedInternUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type AssignedInternSummary = {
  id: number;
  user: AssignedInternUser;
  preferred_campus: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  school_start_date: string | null;
  school_end_date: string | null;
  course_of_study: string;
  current_institution: string;
  reports_total: number;
  reports_pending: number;
};

export type MyInternsResponse = {
  count: number;
  results: AssignedInternSummary[];
};

export type InternScheduleEntry = {
  id: string;
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  shift: "MORNING" | "AFTERNOON";
  start_time: string;
  end_time: string;
  is_rotating: boolean;
};

export type InternReportEntry = {
  id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "NEEDS_REVISION";
  submitted_at: string;
  instructor_feedback: string;
};

export type AssignedInternDetail = {
  id: number;
  user: AssignedInternUser;
  preferred_campus: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  school_start_date: string | null;
  school_end_date: string | null;
  course_of_study: string;
  current_institution: string;
  current_level: string;
  matric_number: string;
  schedules: InternScheduleEntry[];
  reports: InternReportEntry[];
};

export type InstructorReport = {
  id: string;
  title: string;
  content: string;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "NEEDS_REVISION";
  submitted_at: string;
  reviewed_at: string | null;
  instructor_feedback: string;
  intern: {
    id: number;
    name: string;
    email: string;
  };
};

export type InstructorReportsResponse = {
  count: number;
  results: InstructorReport[];
};

export type TaskAssignmentEntry = {
  id: string;
  intern: {
    id: number;
    name: string;
  };
  status: "PENDING" | "SUBMITTED" | "REVIEWED";
  submitted_at: string | null;
  instructor_feedback: string;
  submission_file_url: string | null;
};

export type InstructorTask = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  created_at: string;
  assigned_count: number;
  submitted_count: number;
  attachments: TaskAttachmentEntry[];
  assignments: TaskAssignmentEntry[];
};

export type InstructorOwnProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  campus: string;
  assigned_intern_count: number;
  profile_picture: string | null;
};

export type TaskAttachmentEntry = {
  id: string;
  file: string;
  uploaded_at: string;
};