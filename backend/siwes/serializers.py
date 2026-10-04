"""
SIWES Management System - Django REST Framework Serializers
Serializers convert Django model instances to JSON for the React frontend.
"""


from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    InternDocument,
    TaskAttachment,
    User,
    AdminProfile,
    InstructorProfile,
    InternProfile,
    Course,
    ScheduleSlot,
    InternSchedule,
    Task,
    TaskAssignment,
    Report,
    Message,
    Notification,
)

User = get_user_model()

# ───────────────────────────────────────────────────────────────
# USER SERIALIZERS
# ───────────────────────────────────────────────────────────────


class UserSerializer(serializers.ModelSerializer):
    """Base user serializer."""

    campus = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "gender",
            "address",
            "role",
            "campus",
            "profile_picture",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_campus(self, obj):
        """Admin default campus, or None for other roles."""
        if obj.role != User.Role.ADMIN:
            return None
        profile = getattr(obj, "admin_profile", None)
        return profile.campus if profile else None


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (registration)."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class InternRegisterSerializer(serializers.Serializer):
    """Plain serializer for intern registration. Manually creates User + InternProfile."""

    # User fields
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(default="INTERN")

    # InternProfile fields
    gender = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    state_of_origin = serializers.CharField(required=False, allow_blank=True)
    preferred_campus = serializers.CharField(required=False, allow_blank=True)
    current_institution = serializers.CharField(required=False, allow_blank=True)
    institution_address = serializers.CharField(required=False, allow_blank=True)
    course_of_study = serializers.CharField(required=False, allow_blank=True)
    current_level = serializers.CharField(required=False, allow_blank=True)
    matric_number = serializers.CharField(required=False, allow_blank=True)
    school_start_date = serializers.DateField(required=False, allow_null=True)
    school_end_date = serializers.DateField(required=False, allow_null=True)
    internship_duration = serializers.CharField(required=False, allow_blank=True)
    other_duration = serializers.CharField(required=False, allow_blank=True)
    why_intern = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_type = serializers.CharField(required=False, allow_blank=True)
    emergency_phone = serializers.CharField(required=False, allow_blank=True)
    declaration = serializers.CharField(required=False, allow_blank=True) 
    chosen_courses = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        allow_empty=False
    )

    def validate_email(self, value):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return normalized

    def create(self, validated_data):
        from django.contrib.auth import get_user_model

        User = get_user_model()

        email=validated_data.get("email", "")
        # Create user WITH gender and address
        user = User.objects.create(
            username=email,
            email=email,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            gender=validated_data.get("gender", ""),  # ← ADDED
            address=validated_data.get("address", ""),  # ← ADDED
            role=validated_data.get("role", "INTERN"),
        )
        user.set_unusable_password()
        user.save()

        return user


# ───────────────────────────────────────────────────────────────
# PROFILE SERIALIZERS
# ───────────────────────────────────────────────────────────────

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
            "school_end_date",
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


class InternDocumentSerializer(serializers.ModelSerializer):
    """
    Read serializer for intern documents. Used by the intern dashboard
    and by the admin to list what's already been sent.
    """

    type_display = serializers.CharField(source="get_type_display", read_only=True)
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = InternDocument
        fields = [
            "id",
            "type",
            "type_display",
           
            "file_url",
            "uploaded_at",
            "uploaded_by",
            "uploaded_by_name",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "uploaded_by",
            "uploaded_by_name",
            "type_display",
            "file_url",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return None
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.email


class InternDocumentUploadSerializer(serializers.Serializer):
    """
    Write serializer for admin uploads. Accepts either:
    - A single file with a `type` field, or
    - Two files (code_of_conduct + acceptance_letter) at once.
    """

    code_of_conduct = serializers.FileField(required=False)
    acceptance_letter = serializers.FileField(required=False)

    def validate(self, attrs):
        if not attrs.get("code_of_conduct") and not attrs.get("acceptance_letter"):
            raise serializers.ValidationError("At least one document must be provided.")
        return attrs


class PlacementConfigSerializer(serializers.Serializer):
    """
    Partial-update payload for the admin configure endpoint.

    Any field can be omitted. Missing fields are left untouched.
    Sending `schedule` (even as []) wipes and rebuilds all schedules for
    the intern. Omitting `schedule` leaves existing schedules alone.
    """

    school_start_date = serializers.DateField(required=False, allow_null=True)
    school_end_date = serializers.DateField(required=False, allow_null=True)
    instructor_id = serializers.UUIDField(required=False, allow_null=True)
    is_rotating = serializers.BooleanField(required=False)
    schedule = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )

    def validate_schedule(self, value):
        """Validate each entry has a valid day and shift."""
        valid_days = {c[0] for c in ScheduleSlot.DayOfWeek.choices}
        valid_shifts = {c[0] for c in ScheduleSlot.Shift.choices}

        cleaned = []
        for i, entry in enumerate(value):
            day = entry.get("day_of_week")
            shift = entry.get("shift")

            if day not in valid_days:
                raise serializers.ValidationError(
                    f"schedule[{i}]: day_of_week must be one of "
                    f"{sorted(valid_days)}."
                )
            if shift not in valid_shifts:
                raise serializers.ValidationError(
                    f"schedule[{i}]: shift must be one of "
                    f"{sorted(valid_shifts)}."
                )

            cleaned.append({"day_of_week": day, "shift": shift})

        # Reject duplicate (day, shift) pairs in the same payload.
        seen = set()
        for entry in cleaned:
            key = (entry["day_of_week"], entry["shift"])
            if key in seen:
                raise serializers.ValidationError(
                    f"schedule: duplicate entry {key}."
                )
            seen.add(key)

        return cleaned


class SubmissionEditSerializer(serializers.Serializer):
    """
    Admin-only partial edit of a PENDING intern's submission.
    Only non-sensitive fields are accepted here. Everything else
    (identity, academics, contacts, declaration) stays locked.
    """

    preferred_campus = serializers.ChoiceField(
        choices=[("kubwa", "Kubwa"), ("nyanya", "Nyanya")],
        required=False,
    )
    school_start_date = serializers.DateField(required=False, allow_null=True)
    school_end_date = serializers.DateField(required=False, allow_null=True)
    internship_duration = serializers.CharField(
        required=False, allow_blank=True, max_length=50
    )
    other_duration = serializers.CharField(
        required=False, allow_blank=True, max_length=100
    )
    why_intern = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        start = attrs.get("school_start_date")
        end = attrs.get("school_end_date")
        if start and end and end <= start:
            raise serializers.ValidationError("End date must be after the start date.")
        return attrs


class InstructorCreateSerializer(serializers.Serializer):
    """Creates a User + InstructorProfile atomically."""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    department = serializers.CharField(required=False, allow_blank=True, max_length=100)
    campus = serializers.ChoiceField(
        choices=AdminProfile.Campus.choices,
        required=True,
    )

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value.lower()


class InstructorUpdateSerializer(serializers.Serializer):
    """PATCH-style partial update for an instructor. Email is locked."""

    first_name = serializers.CharField(required=False, max_length=150)
    last_name = serializers.CharField(required=False, max_length=150)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    department = serializers.CharField(required=False, allow_blank=True, max_length=100)
    campus = serializers.ChoiceField(
        choices=AdminProfile.Campus.choices,
        required=False,
    )


class AdminInstructorSerializer(serializers.ModelSerializer):
    """
    Read serializer for instructors, used by both admin (list/detail)
    and the intern's 'assigned instructor' display.
    """

    id = serializers.UUIDField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    assigned_intern_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = InstructorProfile
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "department",
            "campus",
            "is_active",
            "assigned_intern_count",
        ]


class AdminInternListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the admin All Interns list.
    Returns only the fields needed for the table row.
    """
    id = serializers.IntegerField(read_only=True)
    user = serializers.SerializerMethodField()
    assigned_instructor = serializers.SerializerMethodField()

    class Meta:
        model = InternProfile
        fields = [
            "id",
            "user",
            "preferred_campus",
            "status",
            "assigned_instructor",
            "school_start_date",
            "school_end_date",
            "created_at",
        ]

    def get_user(self, obj):
        return {
            "id": str(obj.user.id),
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "phone": obj.user.phone,
        }

    def get_assigned_instructor(self, obj):
        if not obj.assigned_instructor:
            return None
        return {
            "id": str(obj.assigned_instructor.user.id),
            "name": obj.assigned_instructor.user.get_full_name(),
            "email": obj.assigned_instructor.user.email,
        }


# ───────────────────────────────────────────────────────────────
# COURSE SERIALIZERS
# ───────────────────────────────────────────────────────────────


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "course_name", "course_code", "duration", "is_active"]


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

class TaskAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAttachment
        fields = ["id", "file", "uploaded_at"]


class TaskSerializer(serializers.ModelSerializer):
    """Task shape nested inside assignments (used by intern endpoints)."""

    instructor = serializers.SerializerMethodField()
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "created_at",
            "instructor",
            "attachments",
        ]

    def get_instructor(self, obj):
        user = obj.instructor.user
        return {
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },
            "department": obj.instructor.department,
        }


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
            "submission_file",
        ]


class InstructorTaskSerializer(serializers.ModelSerializer):
    """
    Rich task shape for the instructor's own task list: assignment
    counts, attachments, and per-intern assignment rows.
    """

    assigned_count = serializers.SerializerMethodField()
    submitted_count = serializers.SerializerMethodField()
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    assignments = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "created_at",
            "assigned_count",
            "submitted_count",
            "attachments",
            "assignments",
        ]

    def get_assigned_count(self, obj):
        return obj.assignments.count()

    def get_submitted_count(self, obj):
        return obj.assignments.filter(
            status__in=[
                TaskAssignment.Status.SUBMITTED,
                TaskAssignment.Status.REVIEWED,
            ]
        ).count()

    def get_assignments(self, obj):
        return [
            {
                "id": str(a.id),
                "intern": {
                    "id": a.intern.pk,
                    "name": a.intern.user.get_full_name(),
                },
                "status": a.status,
                "submitted_at": a.submitted_at,
                "instructor_feedback": a.instructor_feedback,
                "submission_file_url": (
                    a.submission_file.url if a.submission_file else None
                ),
            }
            for a in obj.assignments.select_related("intern__user").all()
        ]


# ───────────────────────────────────────────────────────────────
# REPORT SERIALIZERS
# ───────────────────────────────────────────────────────────────


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer for reports. Allows interns to create reports with status
    DRAFT or SUBMITTED. The REVIEWED status is set by instructors only,
    so it is rejected on create.
    """

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
        read_only_fields = [
            "id",
            "intern",
            "submitted_at",
            "admin_seen",
            "instructor_feedback",
        ]

    def validate_status(self, value):
        # Interns can only set DRAFT or SUBMITTED on create.
        # REVIEWED is reserved for the review workflow.
        if value == Report.Status.REVIEWED:
            raise serializers.ValidationError(
                "Status REVIEWED can only be set by an instructor."
            )
        return value

    def validate(self, attrs):
        # On create, default status is SUBMITTED if not provided.
        request = self.context.get("request")
        if request and request.method == "POST" and "status" not in attrs:
            attrs["status"] = Report.Status.SUBMITTED
        return attrs


class RecentReportSerializer(serializers.ModelSerializer):
    """
    Minimal report shape for the dashboard's 'Recent reports' list.
    Only the fields the dashboard actually renders.
    """

    class Meta:
        model = Report
        fields = ["id", "title", "submitted_at", "status"]


# ───────────────────────────────────────────────────────────────
# NOTIFICATION SERIALIZERS
# ───────────────────────────────────────────────────────────────


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "type", "message", "is_read", "created_at"]
