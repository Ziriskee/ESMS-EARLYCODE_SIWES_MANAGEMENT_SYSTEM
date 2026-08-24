"""
SIWES Management System - Django REST Framework Serializers
Serializers convert Django model instances to JSON for the React frontend.
"""

from rest_framework import serializers
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

# ───────────────────────────────────────────────────────────────
# USER SERIALIZERS
# ───────────────────────────────────────────────────────────────


class UserSerializer(serializers.ModelSerializer):
    """Base user serializer."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "profile_picture",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (registration)."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


# ───────────────────────────────────────────────────────────────
# PROFILE SERIALIZERS
# ───────────────────────────────────────────────────────────────


class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AdminProfile
        fields = ["user", "admin_level"]


class InstructorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_intern_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = InstructorProfile
        fields = ["user", "department", "assigned_intern_count"]


class InternProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_instructor = InstructorProfileSerializer(read_only=True)

    class Meta:
        model = InternProfile
        fields = [
            "user",
            "assigned_instructor",
            "status",
            "school_start_date",
            "org_start_date",
            "org_end_date",
            "state_of_origin",
            "preferred_campus",
            "current_institution",
            "institution_address",
            "course_of_study",
            "current_level",
            "matric_number",
            "internship_duration",
            "other_duration",
            "why_intern",
            "emergency_contact_type",
            "emergency_phone",
            "declaration",
            "it_letter",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


# ───────────────────────────────────────────────────────────────
# COURSE SERIALIZERS
# ───────────────────────────────────────────────────────────────


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "course_name", "course_code", "category", "is_active"]


class InternCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = InternCourse
        fields = ["id", "course", "enrolled_at"]


# ───────────────────────────────────────────────────────────────
# SCHEDULE SERIALIZERS
# ───────────────────────────────────────────────────────────────


class ScheduleSlotSerializer(serializers.ModelSerializer):
    rotation_pair = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ScheduleSlot
        fields = [
            "id",
            "day_of_week",
            "shift",
            "start_time",
            "end_time",
            "rotation_pair",
        ]


class InternScheduleSerializer(serializers.ModelSerializer):
    slot = ScheduleSlotSerializer(read_only=True)
    intern = InternProfileSerializer(read_only=True)

    class Meta:
        model = InternSchedule
        fields = ["id", "intern", "slot", "is_rotating", "assigned_by", "assigned_at"]


# ───────────────────────────────────────────────────────────────
# TASK SERIALIZERS
# ───────────────────────────────────────────────────────────────


class TaskSerializer(serializers.ModelSerializer):
    instructor = InstructorProfileSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ["id", "title", "description", "instructor", "due_date", "created_at"]


class TaskAssignmentSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)
    intern = InternProfileSerializer(read_only=True)

    class Meta:
        model = TaskAssignment
        fields = [
            "id",
            "task",
            "intern",
            "status",
            "submitted_at",
            "instructor_feedback",
            "created_at",
        ]


# ───────────────────────────────────────────────────────────────
# REPORT SERIALIZERS
# ───────────────────────────────────────────────────────────────


class ReportSerializer(serializers.ModelSerializer):
    intern = InternProfileSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "intern",
            "title",
            "content",
            "submitted_at",
            "status",
            "instructor_feedback",
            "admin_seen",
        ]


# ───────────────────────────────────────────────────────────────
# MESSAGE SERIALIZERS
# ───────────────────────────────────────────────────────────────


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "recipient", "content", "sent_at", "is_read"]


# ───────────────────────────────────────────────────────────────
# NOTIFICATION SERIALIZERS
# ───────────────────────────────────────────────────────────────


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "type", "message", "is_read", "created_at"]
