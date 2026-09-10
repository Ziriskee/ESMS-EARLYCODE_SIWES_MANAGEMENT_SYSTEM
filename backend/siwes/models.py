"""
SIWES Management System - Django Models
Backend: Django + Django REST Framework + PostgreSQL
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

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

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="admin_profile",
        limit_choices_to={"role": User.Role.ADMIN},
    )
    admin_level = models.CharField(max_length=50, blank=True)

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

    def __str__(self):
        return f"Instructor: {self.user.get_full_name()}"

    @property
    def assigned_intern_count(self):
        return self.assigned_interns.count()


# ───────────────────────────────────────────────────────────────
# 4. COURSE (Reference Table)
# ───────────────────────────────────────────────────────────────


class Course(models.Model):
    """Courses available at Early Code. Enrollment is external."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course_name = models.CharField(max_length=200)
    course_code = models.CharField(max_length=20, blank=True)
    category = models.CharField(max_length=100, blank=True)
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

    # Three dates as discussed
    school_start_date = models.DateField(null=True, blank=True)  # Date 1: From school
    org_start_date = models.DateField(
        null=True, blank=True
    )  # Date 2: Official start at org
    org_end_date = models.DateField(
        null=True, blank=True
    )  # Date 3: Official end at org

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    # Extra fields from registration form
    state_of_origin = models.CharField(max_length=100, blank=True)
    preferred_campus = models.CharField(max_length=50, blank=True)
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
    it_letter = models.FileField(upload_to="it_letters/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Intern: {self.user.get_full_name()}"

    @property
    def full_name(self):
        return self.user.get_full_name()


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
        return f"{self.get_day_of_week_display()} {self.get_shift_display()} ({self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')})"


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
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    instructor_feedback = models.TextField(blank=True)
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
        SUBMITTED = "SUBMITTED", "Submitted"
        REVIEWED = "REVIEWED", "Reviewed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    intern = models.ForeignKey(
        InternProfile, on_delete=models.CASCADE, related_name="reports"
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUBMITTED
    )
    instructor_feedback = models.TextField(blank=True)
    admin_seen = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.title} by {self.intern.full_name}"


# ───────────────────────────────────────────────────────────────
# 12. MESSAGES
# ───────────────────────────────────────────────────────────────


class Message(models.Model):
    """Messages between users. Interns can only message their instructor and admin."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_messages"
    )
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"From {self.sender.get_full_name()} to {self.recipient.get_full_name()}"


# ───────────────────────────────────────────────────────────────
# 13. NOTIFICATIONS
# ───────────────────────────────────────────────────────────────


class Notification(models.Model):
    """System notifications for users."""

    class Type(models.TextChoices):
        TASK_ASSIGNED = "TASK_ASSIGNED", "Task Assigned"
        REPORT_SUBMITTED = "REPORT_SUBMITTED", "Report Submitted"
        MESSAGE_RECEIVED = "MESSAGE_RECEIVED", "Message Received"
        SCHEDULE_UPDATED = "SCHEDULE_UPDATED", "Schedule Updated"
        INSTRUCTOR_ASSIGNED = "INSTRUCTOR_ASSIGNED", "Instructor Assigned"

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
