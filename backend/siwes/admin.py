"""
SIWES Management System - Django Admin Configuration
Register all models in the Django admin panel for easy management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User,
    AdminProfile,
    InstructorProfile,
    InternProfile,
    Course,
    InternCourse,
    ScheduleSlot,
    InternSchedule,
    Task,
    TaskAssignment,
    Report,
    Message,
    Notification,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "created_at",
    ]
    list_filter = ["role", "is_active", "created_at"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("SIWES Info", {"fields": ("role", "phone", "profile_picture")}),
    )


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "admin_level"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]


@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "department", "assigned_intern_count"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    list_filter = ["department"]


@admin.register(InternProfile)
class InternProfileAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "assigned_instructor",
        "status",
        "org_start_date",
        "org_end_date",
    ]
    list_filter = ["status", "preferred_campus", "current_level"]
    search_fields = [
        "user__email",
        "user__first_name",
        "user__last_name",
        "matric_number",
    ]
    date_hierarchy = "created_at"


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["course_name", "course_code", "category", "is_active"]
    search_fields = ["course_name", "course_code"]
    list_filter = ["category", "is_active"]


@admin.register(InternCourse)
class InternCourseAdmin(admin.ModelAdmin):
    list_display = ["intern", "course", "enrolled_at"]
    list_filter = ["enrolled_at"]
    search_fields = ["intern__user__email", "course__course_name"]


@admin.register(ScheduleSlot)
class ScheduleSlotAdmin(admin.ModelAdmin):
    list_display = ["day_of_week", "shift", "start_time", "end_time", "rotation_pair"]
    list_filter = ["day_of_week", "shift"]


@admin.register(InternSchedule)
class InternScheduleAdmin(admin.ModelAdmin):
    list_display = ["intern", "slot", "is_rotating", "assigned_by", "assigned_at"]
    list_filter = ["is_rotating", "slot__day_of_week"]
    search_fields = ["intern__user__email", "intern__user__first_name"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor", "due_date", "created_at"]
    search_fields = ["title", "instructor__user__email"]
    date_hierarchy = "created_at"


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ["task", "intern", "status", "submitted_at"]
    list_filter = ["status"]
    search_fields = ["task__title", "intern__user__email"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["title", "intern", "status", "admin_seen", "submitted_at"]
    list_filter = ["status", "admin_seen"]
    search_fields = ["title", "intern__user__email"]
    date_hierarchy = "submitted_at"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["sender", "recipient", "sent_at", "is_read"]
    list_filter = ["is_read", "sent_at"]
    search_fields = ["sender__email", "recipient__email", "content"]
    date_hierarchy = "sent_at"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "is_read", "created_at"]
    list_filter = ["type", "is_read"]
    search_fields = ["user__email", "message"]
    date_hierarchy = "created_at"
