export type AdminNavKey =
  | "overview"
  | "pending"
  | "interns"
  | "instructors"
  | "messages"
  | "notifications";

export type AdminDashboardStats = {
  total_interns: number;
  total_instructors: number;
  pending_interns: number;
  active_interns: number;
  missing_documents: number;
  unread_conversations: number;
};

export type PendingInternSummary = {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
  };
  preferred_campus: string;
  current_institution: string;
  course_of_study: string;
  current_level: string;
  school_start_date: string | null;
  school_end_date: string | null;
  internship_duration: string;
  created_at: string;
};

export type PendingInternsResponse = {
  count: number;
  results: PendingInternSummary[];
};

export type SubmissionCourse = {
  id: string;
  course_name: string;
  course_code: string;
  duration: string;
};

export type SubmissionAssignedInstructor = {
  id: string;
  name: string;
  email: string;
} | null;

export type SubmissionDocument = {
  id: string;
  type: string;
  type_display: string;
  file_url: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
};

export type SubmissionSchedule = {
  id: string;
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  shift: "MORNING" | "AFTERNOON";
  start_time: string;
  end_time: string;
  is_rotating: boolean;
};

export type InternSubmission = {
  id: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  created_at: string;
  updated_at: string;

  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    address: string;
    is_active: boolean;
  };

  state_of_origin: string;
  preferred_campus: string;
  current_institution: string;
  institution_address: string;
  course_of_study: string;
  current_level: string;
  matric_number: string;
  internship_duration: string;
  other_duration: string;
  school_start_date: string | null;
  school_end_date: string | null;

  why_intern: string;
  emergency_contact_type: string;
  emergency_phone: string;
  declaration: string;

  courses: SubmissionCourse[];
  assigned_instructor: SubmissionAssignedInstructor;
  documents: SubmissionDocument[];
  schedules?: SubmissionSchedule[];
};

export type InstructorSummary = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  campus: string;
  is_active: boolean;
  assigned_intern_count: number;
};

export type ScheduleEntry = {
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  shift: "MORNING" | "AFTERNOON";
};

export type WizardFormData = {
  school_start_date: string;
  school_end_date: string;
  schedules: ScheduleEntry[];
  is_rotating: boolean;
  instructor_id: string;
  code_of_conduct: File | null;
  acceptance_letter: File | null;
};

export type AllInternSummary = {
  id: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  preferred_campus: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  assigned_instructor: {
    id: string;
    name: string;
    email: string;
  } | null;
  school_start_date: string | null;
  school_end_date: string | null;
  created_at: string;
};

export type AllInternsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AllInternSummary[];
};