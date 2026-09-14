from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import quote
from datetime import timedelta

from .models import (
    User,
    InstructorProfile,
    InternProfile,
    Course,
    InternCourse,
    InternSchedule,
    Task,
    TaskAssignment,
    Report,
    Message,
    Notification,
)
from .serializers import (
    RecentReportSerializer,
    UserSerializer,
    InstructorProfileSerializer,
    InternProfileSerializer,
    CourseSerializer,
    InternScheduleSerializer,
    TaskSerializer,
    TaskAssignmentSerializer,
    ReportSerializer,
    MessageSerializer,
    NotificationSerializer,
    InternRegisterSerializer,
)
from .permissions import IsAdmin, IsInstructor, IsIntern

User = get_user_model()
signer = TimestampSigner()


# ============================================================================
# AUTHENTICATION & MAGIC LINKS
# ============================================================================


class InternRegisterView(generics.CreateAPIView):
    """Register a new intern. No password required — magic link login."""

    queryset = User.objects.all()
    serializer_class = InternRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["role"] = "INTERN"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Validate chosen courses are existing active courses
        chosen_course_ids = serializer.validated_data.get("chosen_courses", [])
        chosen_course_ids = list(set(chosen_course_ids))  # deduplicate

        courses = Course.objects.filter(id__in=chosen_course_ids, is_active=True)

        if courses.count() != len(chosen_course_ids):
            return Response(
                {
                    "success": False,
                    "message": "One or more selected courses are invalid or inactive.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Atomic transaction: all-or-nothing
        with transaction.atomic():
            user = serializer.save()

            # Create intern profile
            intern = InternProfile.objects.create(
                user=user,
                state_of_origin=serializer.validated_data.get("state_of_origin", ""),
                preferred_campus=serializer.validated_data.get("preferred_campus", ""),
                current_institution=serializer.validated_data.get(
                    "current_institution", ""
                ),
                institution_address=serializer.validated_data.get(
                    "institution_address", ""
                ),
                course_of_study=serializer.validated_data.get("course_of_study", ""),
                current_level=serializer.validated_data.get("current_level", ""),
                matric_number=serializer.validated_data.get("matric_number", ""),
                school_start_date=serializer.validated_data.get("school_start_date"),
                org_end_date=serializer.validated_data.get("org_end_date"),
                internship_duration=serializer.validated_data.get(
                    "internship_duration", ""
                ),
                other_duration=serializer.validated_data.get("other_duration", ""),
                why_intern=serializer.validated_data.get("why_intern", ""),
                emergency_contact_type=serializer.validated_data.get(
                    "emergency_contact_type", ""
                ),
                emergency_phone=serializer.validated_data.get("emergency_phone", ""),
                declaration=serializer.validated_data.get("declaration", ""),
                status="PENDING",
            )

            # Link chosen courses
            for course in courses:
                InternCourse.objects.create(intern=intern, course=course)

        # Send welcome email with magic link (outside transaction)
        self._send_welcome_email(user)

        return Response(
            {
                "success": True,
                "message": "Registration successful. Check your email for a login link.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def _send_welcome_email(self, user):
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        login_url = f"{frontend_url}/login"

        subject = "Welcome to EarlyCode SIWES"

        message = (
            f"Hi {user.first_name or user.email},\n\n"
            "Your registration was successful.\n\n"
            "To log in, go to the login page and request a magic link:\n"
            f"{login_url}\n\n"
            "EarlyCode SIWES Team"
        )

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost")

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as email_error:
            print(f"Welcome email failed: {email_error}")


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def request_magic_link(request):
    """User enters email → Django sends magic link."""
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not (security)
        return Response(
            {"message": "If an account exists, a login link has been sent."}
        )

    # 1. Generate and safely encode the token
    token = signer.sign(user.email)
    safe_token = quote(token)

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    magic_link = f"{frontend_url}/verify-login?token={safe_token}"

    # 🛡️ BULLETPROOF DEV LOG: Bypasses email encoding (=3D and line breaks)
    if settings.DEBUG:
        print("\n" + "🟢" * 30)
        print(f"🔗 MAGIC LINK FOR {user.email}:")
        print(magic_link)
        print("🟢" * 30 + "\n")

    # 2. Send the actual email (In production, Gmail/SMTP handles the decoding automatically)
    send_mail(
        subject="Your EarlyCode SIWES Login Link",
        message=f"Hi {user.first_name or 'there'},\n\nClick this link to log in:\n{magic_link}\n\n- EarlyCode Team",
        from_email="noreply@earlycode.com",
        recipient_list=[user.email],
        fail_silently=True,
    )

    return Response({"message": "If an account exists, a login link has been sent."})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def verify_magic_link(request):
    """
    User clicks magic link → Django verifies token, sets httpOnly session cookie.
    """
    token = request.query_params.get("token")

    # ✅ TEMPORARY DEBUG: Print the raw token
    print(f"\n🔍 RAW TOKEN: {token}")
    print(f"🔍 TOKEN LENGTH: {len(token) if token else 0}")

    if not token:
        return Response(
            {"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        print(f"🔍 ATTEMPTING TO UNSIGN: {token[:50]}...")
        email = signer.unsign(token, max_age=settings.MAGIC_LINK_MAX_AGE)
        print(f"✅ UNSIGN SUCCESS: {email}")
        user = User.objects.get(email=email)
    except SignatureExpired as e:
        print(f"❌ SIGNATURE EXPIRED: {e}")
        return Response(
            {"error": "Invalid or expired link"}, status=status.HTTP_400_BAD_REQUEST
        )
    except BadSignature as e:
        print(f"❌ BAD SIGNATURE: {e}")
        return Response(
            {"error": "Invalid or expired link"}, status=status.HTTP_400_BAD_REQUEST
        )
    except User.DoesNotExist as e:
        print(f"❌ USER NOT FOUND: {e}")
        return Response(
            {"error": "Invalid or expired link"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

    # Create 12-hour session token
    access = AccessToken.for_user(user)

    response = Response(
        {
            "success": True,
            "message": "Login successful",
            "user": UserSerializer(user).data,
        }
    )

    response.set_cookie(
        key=settings.ACCESS_COOKIE_NAME,
        value=str(access),
        max_age=settings.SESSION_COOKIE_MAX_AGE,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )

    return response


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def logout(request):
    """
    Deletes the session cookie.
    """
    response = Response(
        {
            "success": True,
            "message": "Logged out successfully."
        }
    )

    response.delete_cookie(
        key=settings.ACCESS_COOKIE_NAME,
        path="/",
        samesite="Lax",
    )

    return response


# ============================================================================
# ADMIN VIEWS
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    total_interns = InternProfile.objects.count()
    total_instructors = InstructorProfile.objects.count()
    pending_interns = InternProfile.objects.filter(status="PENDING").count()
    active_interns = InternProfile.objects.filter(status="ACTIVE").count()
    total_reports = Report.objects.count()
    unread_reports = Report.objects.filter(status="SUBMITTED").count()

    return Response(
        {
            "total_interns": total_interns,
            "total_instructors": total_instructors,
            "pending_interns": pending_interns,
            "active_interns": active_interns,
            "total_reports": total_reports,
            "unread_reports": unread_reports,
        }
    )

class AdminInternListCreateView(generics.ListCreateAPIView):
    queryset = InternProfile.objects.all()
    serializer_class = InternProfileSerializer
    permission_classes = [IsAdmin]


class AdminInternDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InternProfile.objects.all()
    serializer_class = InternProfileSerializer
    permission_classes = [IsAdmin]


@api_view(["POST"])
@permission_classes([IsAdmin])
def assign_instructor(request, pk):
    try:
        intern = InternProfile.objects.get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response({"error": "Intern not found"}, status=status.HTTP_404_NOT_FOUND)

    instructor_id = request.data.get("instructor_id")
    if not instructor_id:
        return Response(
            {"error": "instructor_id is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        instructor = InstructorProfile.objects.get(pk=instructor_id)
    except InstructorProfile.DoesNotExist:
        return Response(
            {"error": "Instructor not found"}, status=status.HTTP_404_NOT_FOUND
        )

    intern.assigned_instructor = instructor
    intern.save()

    Notification.objects.create(
        user=intern.user,
        type="INSTRUCTOR_ASSIGNED",
        message=f"You have been assigned to instructor {instructor.user.get_full_name()}",
    )

    return Response({"success": True, "message": "Instructor assigned"})


@api_view(["POST"])
@permission_classes([IsAdmin])
def set_intern_dates(request, pk):
    try:
        intern = InternProfile.objects.get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response({"error": "Intern not found"}, status=status.HTTP_404_NOT_FOUND)

    intern.org_start_date = request.data.get("org_start_date") or intern.org_start_date
    intern.org_end_date = request.data.get("org_end_date") or intern.org_end_date
    intern.status = request.data.get("status", intern.status)
    intern.save()

    return Response({"success": True, "message": "Dates updated"})


class AdminInstructorListCreateView(generics.ListCreateAPIView):
    queryset = InstructorProfile.objects.all()
    serializer_class = InstructorProfileSerializer
    permission_classes = [IsAdmin]


class AdminInstructorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InstructorProfile.objects.all()
    serializer_class = InstructorProfileSerializer
    permission_classes = [IsAdmin]


class AdminScheduleListCreateView(generics.ListCreateAPIView):
    queryset = InternSchedule.objects.all()
    serializer_class = InternScheduleSerializer
    permission_classes = [IsAdmin]


class AdminReportListView(generics.ListAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]


@api_view(["POST"])
@permission_classes([IsAdmin])
def broadcast_message(request):
    recipients = request.data.get("recipients", [])  # list of user IDs
    content = request.data.get("content")

    if not content:
        return Response(
            {"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    for user_id in recipients:
        try:
            user = User.objects.get(id=user_id)
            Message.objects.create(sender=request.user, recipient=user, content=content)
        except User.DoesNotExist:
            pass

    return Response({"success": True, "message": "Messages sent"})


# ============================================================================
# INSTRUCTOR VIEWS
# ============================================================================


@api_view(["GET"])
@permission_classes([IsInstructor])
def instructor_dashboard(request):
    instructor = request.user.instructor_profile
    my_interns = InternProfile.objects.filter(assigned_instructor=instructor)
    my_tasks = Task.objects.filter(instructor=instructor)
    pending_reports = Report.objects.filter(
        intern__assigned_instructor=instructor, status="SUBMITTED"
    )

    return Response(
        {
            "total_interns": my_interns.count(),
            "total_tasks": my_tasks.count(),
            "pending_reports": pending_reports.count(),
        }
    )


@api_view(["GET"])
@permission_classes([IsInstructor])
def my_interns(request):
    instructor = request.user.instructor_profile
    interns = InternProfile.objects.filter(assigned_instructor=instructor)
    serializer = InternProfileSerializer(interns, many=True)
    return Response(serializer.data)


class InstructorTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user.instructor_profile)


class InstructorTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)


@api_view(["POST"])
@permission_classes([IsInstructor])
def assign_task_to_interns(request, pk):
    try:
        task = Task.objects.get(pk=pk, instructor=request.user.instructor_profile)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    intern_ids = request.data.get("intern_ids", [])

    if not isinstance(intern_ids, list):
        return Response(
            {"error": "intern_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST
        )

    assigned_count = 0
    skipped_count = 0

    for intern_id in intern_ids:
        try:
            intern = InternProfile.objects.get(
                pk=intern_id, assigned_instructor=request.user.instructor_profile
            )
        except InternProfile.DoesNotExist:
            skipped_count += 1
            continue

        assignment, created = TaskAssignment.objects.get_or_create(
            task=task, intern=intern
        )

        if created:
            assigned_count += 1

            Notification.objects.create(
                user=intern.user,
                type="TASK_ASSIGNED",
                message=f"New task assigned: {task.title}",
            )
        else:
            skipped_count += 1

    return Response(
        {
            "success": True,
            "message": f"Task assigned to {assigned_count} intern(s).",
            "assigned_count": assigned_count,
            "skipped_count": skipped_count,
        }
    )


@api_view(["GET"])
@permission_classes([IsInstructor])
def instructor_reports(request):
    instructor = request.user.instructor_profile
    reports = Report.objects.filter(intern__assigned_instructor=instructor)
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsInstructor])
def review_report(request, pk):
    try:
        report = Report.objects.get(
            pk=pk, intern__assigned_instructor=request.user.instructor_profile
        )
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

    report.status = request.data.get("status", report.status)
    report.instructor_feedback = request.data.get(
        "instructor_feedback", report.instructor_feedback
    )
    report.save()

    return Response({"success": True, "message": "Report reviewed"})


# ============================================================================
# INTERN VIEWS
# ============================================================================


@api_view(["GET"])
@permission_classes([IsIntern])
def intern_dashboard(request):
    """
    Returns everything the intern Overview page needs in one call:
    user info, placement progress, stats, recent reports, and
    upcoming on-site days.
    """
    user = request.user
    intern = user.intern_profile

    today = timezone.now().date()
    start = intern.org_start_date
    end = intern.org_end_date

    # ---------- Placement (nullable) ----------
    placement = None
    if start and end and end > start:
        total_days = (end - start).days
        total_weeks = max(total_days // 7, 1)

        elapsed_days = max((today - start).days, 0)
        weeks_completed = min(elapsed_days // 7, total_weeks)
        weeks_remaining = max(total_weeks - weeks_completed, 0)

        days_remaining = max((end - today).days, 0)
        percent_complete = round(weeks_completed / total_weeks * 100)

        placement = {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "total_weeks": total_weeks,
            "weeks_completed": weeks_completed,
            "weeks_remaining": weeks_remaining,
            "days_remaining": days_remaining,
            "percent_complete": percent_complete,
        }

    # ---------- Stats ----------
    reports_qs = Report.objects.filter(intern=intern)
    reports_submitted = reports_qs.count()

    task_qs = TaskAssignment.objects.filter(intern=intern)
    tasks_pending = task_qs.filter(status=TaskAssignment.Status.PENDING).count()
    tasks_completed = (
        task_qs.filter(status=TaskAssignment.Status.SUBMITTED).count()
        + task_qs.filter(status=TaskAssignment.Status.REVIEWED).count()
    )

    unread_messages = Message.objects.filter(recipient=user, is_read=False).count()

    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

    # ---------- Recent reports (up to 4) ----------
    recent_reports = reports_qs.order_by("-submitted_at")[:4]

    # ---------- Upcoming on-site days (next 35 days) ----------
    attendance_has_schedule = False
    upcoming_days = []

    schedules = InternSchedule.objects.filter(intern=intern).select_related(
        "slot", "slot__rotation_pair"
    )
    if schedules.exists():
        attendance_has_schedule = True
        window_end = today + timedelta(days=35)

        day_map = {
            "MON": 0,
            "TUE": 1,
            "WED": 2,
            "THU": 3,
            "FRI": 4,
            "SAT": 5,
            "SUN": 6,
        }

        # Rotation anchors to org_start_date.
        # If missing, we fall back to no rotation.
        anchor = start  # start = intern.org_start_date, already defined above

        for sched in schedules:
            base_slot = sched.slot
            paired_slot = base_slot.rotation_pair

            target_weekday = day_map.get(base_slot.day_of_week)
            if target_weekday is None:
                continue

            days_ahead = (target_weekday - today.weekday()) % 7
            first_date = today + timedelta(days=days_ahead)

            d = first_date
            while d <= window_end:
                # Choose slot for this date.
                # Rule: even weeks since anchor = base slot,
                #       odd weeks since anchor = paired slot (if it exists).
                active_slot = base_slot

                if anchor and paired_slot:
                    weeks_since_start = (d - anchor).days // 7
                    if weeks_since_start % 2 == 1:
                        active_slot = paired_slot

                upcoming_days.append(
                    {
                        "date": d.isoformat(),
                        "shift": active_slot.shift,
                        "start_time": active_slot.start_time.strftime("%H:%M"),
                        "end_time": active_slot.end_time.strftime("%H:%M"),
                    }
                )
                d += timedelta(days=7)

        upcoming_days.sort(key=lambda x: x["date"])
    # ---------- Assemble response ----------
    return Response(
        {
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            "placement": placement,
            "stats": {
                "reports_submitted": reports_submitted,
                "tasks_pending": tasks_pending,
                "tasks_completed": tasks_completed,
                "unread_messages": unread_messages,
                "unread_notifications": unread_notifications,
            },
            "recent_reports": RecentReportSerializer(recent_reports, many=True).data,
            "attendance": {
                "has_schedule": attendance_has_schedule,
                "upcoming_days": upcoming_days,
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsIntern])
def my_schedule(request):
    intern = request.user.intern_profile
    schedules = intern.schedule.all()
    serializer = InternScheduleSerializer(schedules, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsIntern])
def my_tasks(request):
    intern = request.user.intern_profile
    assignments = TaskAssignment.objects.filter(intern=intern)
    serializer = TaskAssignmentSerializer(assignments, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsIntern])
def submit_task(request, pk):
    try:
        assignment = TaskAssignment.objects.get(
            pk=pk, intern=request.user.intern_profile
        )
    except TaskAssignment.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    assignment.status = "SUBMITTED"
    assignment.submitted_at = timezone.now()
    assignment.save()

    Notification.objects.create(
        user=assignment.task.instructor.user,
        type="TASK_ASSIGNED",
        message=f"{request.user.get_full_name()} submitted task: {assignment.task.title}",
    )

    return Response({"success": True, "message": "Task submitted"})


class InternReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsIntern]

    def get_queryset(self):
        return Report.objects.filter(intern=self.request.user.intern_profile).order_by(
            "-submitted_at"
        )

    def perform_create(self, serializer):
        report = serializer.save(intern=self.request.user.intern_profile)

        # Only notify the instructor when the report is actually submitted,
        # not when it is saved as a draft.
        if report.status == Report.Status.SUBMITTED:
            instructor = report.intern.assigned_instructor
            if instructor:
                Notification.objects.create(
                    user=instructor.user,
                    type="REPORT_SUBMITTED",
                    message=(
                        f"New report from "
                        f"{self.request.user.get_full_name()}: "
                        f"{report.title}"
                    ),
                )


class InternReportDetailView(generics.RetrieveAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsIntern]

    def get_queryset(self):
        return Report.objects.filter(intern=self.request.user.intern_profile)


# ============================================================================
# SHARED VIEWS
# ============================================================================


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True
    notification.save()
    return Response({"success": True})

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Marks every unread notification for the current user as read.
    """
    updated = Notification.objects.filter(
        user=request.user, is_read=False
    ).update(is_read=True)

    return Response(
        {
            "success": True,
            "updated": updated,
        }
    )

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user)

    def perform_create(self, serializer):
        sender = self.request.user
        recipient_id = self.request.data.get("recipient_id")

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient not found")

        # Enforce messaging rules
        if sender.role == "INTERN":
            intern = sender.intern_profile
            allowed_recipients = [
                (
                    intern.assigned_instructor.user.id
                    if intern.assigned_instructor
                    else None
                )
            ]
            # Also allow admin
            admin_ids = list(
                User.objects.filter(role="ADMIN").values_list("id", flat=True)
            )
            allowed_recipients.extend(admin_ids)

            if recipient.id not in allowed_recipients:
                raise serializers.ValidationError(
                    "You can only message your instructor or admin"
                )

        serializer.save(sender=sender, recipient=recipient)
