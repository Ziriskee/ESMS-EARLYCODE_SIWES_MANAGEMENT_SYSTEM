"""
SIWES Management System — Django REST Framework Views
All API endpoint logic for Admin, Instructor, and Intern roles.
"""

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

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
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    AdminProfileSerializer,
    InstructorProfileSerializer,
    InternProfileSerializer,
    CourseSerializer,
    InternCourseSerializer,
    ScheduleSlotSerializer,
    InternScheduleSerializer,
    TaskSerializer,
    TaskAssignmentSerializer,
    ReportSerializer,
    MessageSerializer,
    NotificationSerializer,
)
from .permissions import (
    IsAdmin,
    IsInstructor,
    IsIntern,
    IsAdminOrInstructor,
    IsOwnerOrAdmin,
)

# ═══════════════════════════════════════════════════════════════
# AUTH & REGISTRATION
# ═══════════════════════════════════════════════════════════════


class InternRegisterView(APIView):
    """
    POST /api/auth/register/
    Creates a new User + InternProfile from the registration form.
    No authentication required.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data

        # 1. Create User
        user_data = {
            "email": data.get("email"),
            "password": data.get(
                "password", "changeme123"
            ),  # TODO: generate or require
            "first_name": (
                data.get("fullName", "").split()[0] if data.get("fullName") else ""
            ),
            "last_name": (
                " ".join(data.get("fullName", "").split()[1:])
                if data.get("fullName")
                else ""
            ),
            "phone": data.get("phone", ""),
            "role": User.Role.INTERN,
        }
        user_serializer = UserCreateSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # 2. Create InternProfile
        intern = InternProfile.objects.create(
            user=user,
            state_of_origin=data.get("stateOfOrigin", ""),
            preferred_campus=data.get("preferredCampus", ""),
            current_institution=data.get("currentInstitution", ""),
            institution_address=data.get("institutionAddress", ""),
            course_of_study=data.get("courseOfStudy", ""),
            current_level=data.get("currentLevel", ""),
            matric_number=data.get("matricNumber", ""),
            internship_duration=data.get("internshipDuration", ""),
            other_duration=data.get("otherDuration", ""),
            why_intern=data.get("whyIntern", ""),
            emergency_contact_type=data.get("emergencyContact", ""),
            emergency_phone=data.get("emergencyPhone", ""),
            declaration=data.get("declaration", ""),
            school_start_date=data.get("internshipStartDate") or None,
            org_end_date=data.get("internshipEndDate") or None,
            status=InternProfile.Status.PENDING,
        )

        # 3. Link chosen courses
        chosen_courses = data.get("chosenCourses", [])
        for course_name in chosen_courses:
            course, _ = Course.objects.get_or_create(course_name=course_name)
            InternCourse.objects.create(intern=intern, course=course)

        return Response(
            {
                "success": True,
                "message": "Registration successful. Await admin approval.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """GET /api/auth/me/ — Returns current logged-in user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ═══════════════════════════════════════════════════════════════
# ADMIN VIEWS
# ═══════════════════════════════════════════════════════════════


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/ — Stats for admin dashboard."""

    permission_classes = [IsAdmin]

    def get(self, request):
        total_interns = InternProfile.objects.count()
        active_interns = InternProfile.objects.filter(
            status=InternProfile.Status.ACTIVE
        ).count()
        pending_interns = InternProfile.objects.filter(
            status=InternProfile.Status.PENDING
        ).count()
        total_instructors = InstructorProfile.objects.count()
        total_reports = Report.objects.count()
        unread_reports = Report.objects.filter(admin_seen=False).count()

        return Response(
            {
                "total_interns": total_interns,
                "active_interns": active_interns,
                "pending_interns": pending_interns,
                "total_instructors": total_instructors,
                "total_reports": total_reports,
                "unread_reports": unread_reports,
            }
        )


class AdminInternListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/interns/ — List all interns or create one."""

    permission_classes = [IsAdmin]
    serializer_class = InternProfileSerializer

    def get_queryset(self):
        queryset = InternProfile.objects.all()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.select_related("user", "assigned_instructor")


class AdminInternDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/admin/interns/<id>/"""

    permission_classes = [IsAdmin]
    serializer_class = InternProfileSerializer
    queryset = InternProfile.objects.all()
    lookup_field = "pk"


class AssignInstructorView(APIView):
    """POST /api/admin/interns/<id>/assign-instructor/"""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        intern = get_object_or_404(InternProfile, pk=pk)
        instructor_id = request.data.get("instructor_id")
        instructor = get_object_or_404(InstructorProfile, pk=instructor_id)

        intern.assigned_instructor = instructor
        intern.status = InternProfile.Status.ACTIVE
        intern.save()

        # Notify intern
        Notification.objects.create(
            user=intern.user,
            type=Notification.Type.INSTRUCTOR_ASSIGNED,
            message=f"You have been assigned to instructor {instructor.user.get_full_name()}.",
        )

        return Response({"success": True, "message": "Instructor assigned."})


class SetInternDatesView(APIView):
    """POST /api/admin/interns/<id>/set-dates/"""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        intern = get_object_or_404(InternProfile, pk=pk)
        intern.org_start_date = (
            request.data.get("org_start_date") or intern.org_start_date
        )
        intern.org_end_date = request.data.get("org_end_date") or intern.org_end_date
        intern.save()
        return Response({"success": True, "message": "Dates updated."})


class AdminInstructorListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/instructors/"""

    permission_classes = [IsAdmin]
    serializer_class = InstructorProfileSerializer
    queryset = InstructorProfile.objects.all()


class AdminInstructorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/admin/instructors/<id>/"""

    permission_classes = [IsAdmin]
    serializer_class = InstructorProfileSerializer
    queryset = InstructorProfile.objects.all()


class AdminReportListView(generics.ListAPIView):
    """GET /api/admin/reports/ — All reports across all campuses."""

    permission_classes = [IsAdmin]
    serializer_class = ReportSerializer
    queryset = Report.objects.all().select_related("intern__user")


class BroadcastMessageView(APIView):
    """POST /api/admin/messages/broadcast/ — Send to multiple users."""

    permission_classes = [IsAdmin]

    def post(self, request):
        recipient_ids = request.data.get("recipient_ids", [])
        content = request.data.get("content", "")

        for user_id in recipient_ids:
            recipient = get_object_or_404(User, pk=user_id)
            Message.objects.create(
                sender=request.user, recipient=recipient, content=content
            )
            Notification.objects.create(
                user=recipient,
                type=Notification.Type.MESSAGE_RECEIVED,
                message="You have a new message from admin.",
            )

        return Response(
            {"success": True, "message": f"Message sent to {len(recipient_ids)} users."}
        )


# ═══════════════════════════════════════════════════════════════
# INSTRUCTOR VIEWS
# ═══════════════════════════════════════════════════════════════


class InstructorDashboardView(APIView):
    """GET /api/instructor/dashboard/"""

    permission_classes = [IsInstructor]

    def get(self, request):
        instructor = request.user.instructor_profile
        intern_count = instructor.assigned_interns.count()
        pending_tasks = TaskAssignment.objects.filter(
            task__instructor=instructor, status=TaskAssignment.Status.PENDING
        ).count()
        pending_reports = Report.objects.filter(
            intern__assigned_instructor=instructor, status=Report.Status.SUBMITTED
        ).count()

        return Response(
            {
                "intern_count": intern_count,
                "pending_tasks": pending_tasks,
                "pending_reports": pending_reports,
            }
        )


class InstructorInternListView(generics.ListAPIView):
    """GET /api/instructor/interns/ — My assigned interns."""

    permission_classes = [IsInstructor]
    serializer_class = InternProfileSerializer

    def get_queryset(self):
        return InternProfile.objects.filter(
            assigned_instructor=self.request.user.instructor_profile
        )


class InstructorTaskListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/instructor/tasks/"""

    permission_classes = [IsInstructor]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user.instructor_profile)


class InstructorTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/instructor/tasks/<id>/"""

    permission_classes = [IsInstructor]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)


class AssignTaskToInternsView(APIView):
    """POST /api/instructor/tasks/<id>/assign/"""

    permission_classes = [IsInstructor]

    def post(self, request, pk):
        task = get_object_or_404(
            Task, pk=pk, instructor=request.user.instructor_profile
        )
        intern_ids = request.data.get("intern_ids", [])

        for intern_id in intern_ids:
            intern = get_object_or_404(InternProfile, pk=intern_id)
            TaskAssignment.objects.get_or_create(task=task, intern=intern)
            Notification.objects.create(
                user=intern.user,
                type=Notification.Type.TASK_ASSIGNED,
                message=f"New task assigned: {task.title}",
            )

        return Response(
            {"success": True, "message": f"Task assigned to {len(intern_ids)} interns."}
        )


class InstructorReportListView(generics.ListAPIView):
    """GET /api/instructor/reports/ — Reports from my interns."""

    permission_classes = [IsInstructor]
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(
            intern__assigned_instructor=self.request.user.instructor_profile
        )


class InstructorReportDetailView(APIView):
    """GET/PATCH /api/instructor/reports/<id>/ — Review + feedback."""

    permission_classes = [IsInstructor]

    def get(self, request, pk):
        report = get_object_or_404(
            Report, pk=pk, intern__assigned_instructor=request.user.instructor_profile
        )
        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def patch(self, request, pk):
        report = get_object_or_404(
            Report, pk=pk, intern__assigned_instructor=request.user.instructor_profile
        )
        report.instructor_feedback = request.data.get(
            "instructor_feedback", report.instructor_feedback
        )
        report.status = Report.Status.REVIEWED
        report.save()
        return Response({"success": True, "message": "Report reviewed."})


# ═══════════════════════════════════════════════════════════════
# INTERN VIEWS
# ═══════════════════════════════════════════════════════════════


class InternDashboardView(APIView):
    """GET /api/intern/dashboard/"""

    permission_classes = [IsIntern]

    def get(self, request):
        intern = request.user.intern_profile
        pending_tasks = TaskAssignment.objects.filter(
            intern=intern, status=TaskAssignment.Status.PENDING
        ).count()
        unread_notifications = Notification.objects.filter(
            user=request.user, is_read=False
        ).count()

        return Response(
            {
                "pending_tasks": pending_tasks,
                "unread_notifications": unread_notifications,
                "status": intern.status,
                "assigned_instructor": (
                    intern.assigned_instructor.user.get_full_name()
                    if intern.assigned_instructor
                    else None
                ),
            }
        )


class InternScheduleView(APIView):
    """GET /api/intern/schedule/ — My current weekly schedule."""

    permission_classes = [IsIntern]

    def get(self, request):
        schedules = InternSchedule.objects.filter(intern=request.user.intern_profile)
        serializer = InternScheduleSerializer(schedules, many=True)
        return Response(serializer.data)


class InternTaskListView(generics.ListAPIView):
    """GET /api/intern/tasks/ — My assigned tasks."""

    permission_classes = [IsIntern]
    serializer_class = TaskAssignmentSerializer

    def get_queryset(self):
        return TaskAssignment.objects.filter(intern=self.request.user.intern_profile)


class SubmitTaskView(APIView):
    """PATCH /api/intern/tasks/<id>/submit/"""

    permission_classes = [IsIntern]

    def patch(self, request, pk):
        assignment = get_object_or_404(
            TaskAssignment, pk=pk, intern=request.user.intern_profile
        )
        assignment.status = TaskAssignment.Status.SUBMITTED
        assignment.submitted_at = timezone.now()
        assignment.save()
        return Response({"success": True, "message": "Task submitted."})


class InternReportListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/intern/reports/"""

    permission_classes = [IsIntern]
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(intern=self.request.user.intern_profile)

    def perform_create(self, serializer):
        report = serializer.save(intern=self.request.user.intern_profile)
        # Notify instructor
        instructor = self.request.user.intern_profile.assigned_instructor
        if instructor:
            Notification.objects.create(
                user=instructor.user,
                type=Notification.Type.REPORT_SUBMITTED,
                message=f"New report from {self.request.user.get_full_name()}: {report.title}",
            )


class InternReportDetailView(generics.RetrieveAPIView):
    """GET /api/intern/reports/<id>/"""

    permission_classes = [IsIntern]
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(intern=self.request.user.intern_profile)


class InternProfileView(APIView):
    """GET/PATCH /api/intern/profile/"""

    permission_classes = [IsIntern]

    def get(self, request):
        serializer = InternProfileSerializer(request.user.intern_profile)
        return Response(serializer.data)

    def patch(self, request):
        intern = request.user.intern_profile
        serializer = InternProfileSerializer(intern, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ═══════════════════════════════════════════════════════════════
# SHARED VIEWS
# ═══════════════════════════════════════════════════════════════


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — My notifications."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """PATCH /api/notifications/<id>/read/"""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"success": True})


class CourseListView(generics.ListAPIView):
    """GET /api/courses/ — List available courses."""

    permission_classes = [permissions.AllowAny]
    serializer_class = CourseSerializer
    queryset = Course.objects.filter(is_active=True)


class MessageListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/messages/"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(recipient=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


# ═══════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════
