"""
SIWES Management System - Django Models
Backend: Django + Django REST Framework + PostgreSQL
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.core.exceptions import ValidationError


def validate_pdf(value):
    """Reject anything that isn't a PDF."""
    if not value.name.lower().endswith(".pdf"):
        raise ValidationError("Only PDF files are allowed.")


# ───────────────────────────────────────────────────────────────
# 1. BASE USER MODEL
# ───────────────────────────────────────────────────────────────


class User(AbstractUser):
    """Base user model with role-based access."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        INSTRUCTOR = "INSTRUCTOR", "Instructor"
        INTERN = "INTERN", "Intern"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "role"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_instructor(self):
        return self.role == self.Role.INSTRUCTOR

    @property
    def is_intern(self):
        return self.role == self.Role.INTERN


# ───────────────────────────────────────────────────────────────
# 2. ADMIN PROFILE
# ───────────────────────────────────────────────────────────────


class AdminProfile(models.Model):
    """Extended profile for Admin users."""

    class Campus(models.TextChoices):
        KUBWA = "kubwa", "Kubwa"
        NYANYA = "nyanya", "Nyanya"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="admin_profile",
        limit_choices_to={"role": User.Role.ADMIN},
    )
    admin_level = models.CharField(max_length=50, blank=True)
    campus = models.CharField(
        max_length=20,
        choices=Campus.choices,
        blank=True,
        help_text="Default campus filter for this admin. Blank = all campuses.",
    )

    def __str__(self):
        return f"Admin: {self.user.get_full_name()}"


# ───────────────────────────────────────────────────────────────
# 3. INSTRUCTOR PROFILE (also Supervisor)
# ───────────────────────────────────────────────────────────────


class InstructorProfile(models.Model):
    """Extended profile for Instructor/Supervisor users."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="instructor_profile",
        limit_choices_to={"role": User.Role.INSTRUCTOR},
    )
    department = models.CharField(max_length=100, blank=True)
    campus = models.CharField(
        max_length=20,
        choices=AdminProfile.Campus.choices,
        default="kubwa",
        help_text="Which campus this instructor belongs to.",
    )

    def __str__(self):
        return f"Instructor: {self.user.get_full_name()}"

    @property
    def assigned_intern_count(self):
        return self.assigned_interns.count() # type: ignore


# ───────────────────────────────────────────────────────────────
# 4. COURSE (Reference Table)
# ───────────────────────────────────────────────────────────────


class Course(models.Model):
    """Courses available at Early Code. Enrollment is external."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course_name = models.CharField(max_length=200)
    course_code = models.CharField(max_length=20, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["course_name"]

    def __str__(self):
        return (
            f"{self.course_code} - {self.course_name}"
            if self.course_code
            else self.course_name
        )


# ───────────────────────────────────────────────────────────────
# 5. INTERN PROFILE
# ───────────────────────────────────────────────────────────────


class InternProfile(models.Model):
    """Extended profile for Intern users."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="intern_profile",
        limit_choices_to={"role": User.Role.INTERN},
    )
    assigned_instructor = models.ForeignKey(
        InstructorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_interns",
    )

    # Two dates: the school-defined start and end of the placement.
    school_start_date = models.DateField(null=True, blank=True)
    school_end_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )

    # Extra fields from registration form
    state_of_origin = models.CharField(max_length=100, blank=True)
    preferred_campus = models.CharField(max_length=50, blank=True, db_index=True)
    current_institution = models.CharField(max_length=200, blank=True)
    institution_address = models.TextField(blank=True)
    course_of_study = models.CharField(max_length=200, blank=True)
    current_level = models.CharField(max_length=20, blank=True)
    matric_number = models.CharField(max_length=50, blank=True)
    internship_duration = models.CharField(max_length=50, blank=True)
    other_duration = models.CharField(max_length=100, blank=True)
    why_intern = models.TextField(blank=True)
    emergency_contact_type = models.CharField(max_length=20, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    declaration = models.TextField(blank=True)
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason given by the admin when rejecting this intern.",
    )
    it_letter = models.FileField(upload_to="it_letters/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Intern: {self.user.get_full_name()}"

    @property
    def full_name(self):
        return self.user.get_full_name()


# ───────────────────────────────────────────────────────────────
# 5b. INTERN DOCUMENTS
# ───────────────────────────────────────────────────────────────


class InternDocument(models.Model):
    """A document attached to an intern (code of conduct, acceptance letter, etc.)."""

    class Type(models.TextChoices):
        CODE_OF_CONDUCT = "CODE_OF_CONDUCT", "Code of Conduct"
        ACCEPTANCE_LETTER = "ACCEPTANCE_LETTER", "Acceptance Letter"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intern = models.ForeignKey(
        InternProfile,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    type = models.CharField(max_length=30, choices=Type.choices)
    file = models.FileField(
        upload_to="intern_documents/",
        validators=[validate_pdf],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_documents",
    )

    class Meta:
        unique_together = ["intern", "type"]
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.get_type_display()} — {self.intern.full_name}" # type: ignore


# ───────────────────────────────────────────────────────────────
# 6. INTERN-COURSE LINK (Many-to-Many)
# ───────────────────────────────────────────────────────────────


class InternCourse(models.Model):
    """Links interns to their enrolled courses."""

    intern = models.ForeignKey(
        InternProfile, on_delete=models.CASCADE, related_name="courses"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="interns")
    enrolled_at = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ["intern", "course"]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.intern.full_name} - {self.course.course_name}"


# ───────────────────────────────────────────────────────────────
# 7. SCHEDULE SLOTS (Available Time Blocks)
# ───────────────────────────────────────────────────────────────


class ScheduleSlot(models.Model):
    """Available day + shift combinations. Morning/afternoon pairs for rotation."""

    class DayOfWeek(models.TextChoices):
        MONDAY = "MON", "Monday"
        TUESDAY = "TUE", "Tuesday"
        WEDNESDAY = "WED", "Wednesday"
        THURSDAY = "THU", "Thursday"
        FRIDAY = "FRI", "Friday"
        SATURDAY = "SAT", "Saturday"
        SUNDAY = "SUN", "Sunday"

    class Shift(models.TextChoices):
        MORNING = "MORNING", "Morning"
        AFTERNOON = "AFTERNOON", "Afternoon"

    day_of_week = models.CharField(max_length=3, choices=DayOfWeek.choices)
    shift = models.CharField(max_length=10, choices=Shift.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    rotation_pair = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="paired_slot",
        help_text="Morning slot points to its Afternoon pair, and vice versa",
    )

    class Meta:
        ordering = ["day_of_week", "start_time"]
        unique_together = ["day_of_week", "shift"]

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.get_shift_display()} ({self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')})" # type: ignore


# ───────────────────────────────────────────────────────────────
# 8. INTERN SCHEDULE ASSIGNMENTS
# ───────────────────────────────────────────────────────────────


class InternSchedule(models.Model):
    """Links interns to their assigned schedule slots."""

    intern = models.ForeignKey(
        InternProfile, on_delete=models.CASCADE, related_name="schedules"
    )
    slot = models.ForeignKey(
        ScheduleSlot, on_delete=models.CASCADE, related_name="intern_assignments"
    )
    is_rotating = models.BooleanField(
        default=True, help_text="Auto-flip morning/afternoon weekly"
    )
    assigned_by = models.ForeignKey(
        AdminProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_schedules",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.intern.full_name} - {self.slot}"


# ───────────────────────────────────────────────────────────────
# 9. TASKS (Instructor-Assigned)
# ───────────────────────────────────────────────────────────────


class Task(models.Model):
    """Tasks created by instructors."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(
        InstructorProfile, on_delete=models.CASCADE, related_name="created_tasks"
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class TaskAttachment(models.Model):
    """
    Files attached to a task by the instructor (reference materials,
    templates, images). Multiple attachments per task.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, related_name="attachments", on_delete=models.CASCADE)
    file = models.FileField(upload_to="task_attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def __str__(self):
        return f"Attachment for {self.task.title}"

# ───────────────────────────────────────────────────────────────
# 10. TASK ASSIGNMENTS
# ───────────────────────────────────────────────────────────────


class TaskAssignment(models.Model):
    """Links tasks to specific interns."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUBMITTED = "SUBMITTED", "Submitted"
        REVIEWED = "REVIEWED", "Reviewed"

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="assignments")
    intern = models.ForeignKey(
        InternProfile, on_delete=models.CASCADE, related_name="task_assignments"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    instructor_feedback = models.TextField(blank=True)
    submission_file = models.FileField(
        upload_to="task_submissions/",
        blank=True,
        null=True,
        help_text="File uploaded by the intern when submitting the task.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["task", "intern"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.intern.full_name} - {self.task.title} ({self.status})"


# ───────────────────────────────────────────────────────────────
# 11. REPORTS (Intern-Submitted)
# ───────────────────────────────────────────────────────────────


class Report(models.Model):
    """Reports submitted by interns."""

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        REVIEWED = "REVIEWED", "Reviewed"
        APPROVED = "APPROVED", "Approved"
        NEEDS_REVISION = "NEEDS_REVISION", "Needs Revision"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intern = models.ForeignKey(
        InternProfile, on_delete=models.CASCADE, related_name="reports"
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True,db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUBMITTED, db_index=True
    )
    instructor_feedback = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_seen = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.title} by {self.intern.full_name}"


# ───────────────────────────────────────────────────────────────
# 12. MESSAGES
# ───────────────────────────────────────────────────────────────


class Message(models.Model):
    """A single chat message inside a Conversation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "Conversation", on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    body = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender}: {self.body[:30]}"


class Conversation(models.Model):
    """Strict 1-to-1 chat thread between two users.
    The unique constraint guarantees one thread per pair, forever."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    initiator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations_started"
    )
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations_received"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["initiator", "recipient"],
                name="unique_conversation_pair",
            )
        ]
        ordering = ["-updated_at"]

    def other(self, user):
        return self.recipient if self.initiator_id == user.id else self.initiator

    def __str__(self):
        return f"{self.initiator} <-> {self.recipient}"


# ───────────────────────────────────────────────────────────────
# 13. NOTIFICATIONS
# ───────────────────────────────────────────────────────────────


class Notification(models.Model):
    """System notifications for users."""

    class Type(models.TextChoices):
        REPORT_SUBMITTED = "REPORT_SUBMITTED", "Report Submitted"
        REPORT_REVIEWED = "REPORT_REVIEWED", "Report Reviewed"
        TASK_ASSIGNED = "TASK_ASSIGNED", "Task Assigned"
        TASK_REVIEWED = "TASK_REVIEWED", "Task Reviewed"
        TASK_SUBMITTED = "TASK_SUBMITTED", "Task Submitted"
        MESSAGE_RECEIVED = "MESSAGE_RECEIVED", "Message Received"
        SCHEDULE_UPDATED = "SCHEDULE_UPDATED", "Schedule Updated"
        INSTRUCTOR_ASSIGNED = "INSTRUCTOR_ASSIGNED", "Instructor Assigned"
        NEW_REGISTRATION = "NEW_REGISTRATION", "New Registration"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    type = models.CharField(max_length=30, choices=Type.choices)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} for {self.user.get_full_name()}"
