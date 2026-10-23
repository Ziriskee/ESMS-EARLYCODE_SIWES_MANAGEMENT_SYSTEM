import logging
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from django.db import models, transaction
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import quote
from datetime import timedelta
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
import io
from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from django.core.mail import EmailMultiAlternatives
import base64
from pathlib import Path
from django.db.models import Q, Count, Exists, OuterRef
from typing import Any, Optional
from rest_framework.request import Request
from .throttles import MagicLinkThrottle, RegisterThrottle

from .models import (
    Conversation,
    InternDocument,
    ScheduleSlot,
    TaskAttachment,
    User,
    InstructorProfile,
    InternProfile,
    Course,
    InternCourse,
    InternSchedule,
    Task,
    TaskAssignment,
    Message,
    Notification,
)
from .serializers import (
    AdminInstructorSerializer,
    AdminInternListSerializer,
    InstructorCreateSerializer,
    InstructorTaskSerializer,
    InstructorUpdateSerializer,
    InternDocumentSerializer,
    InternDocumentUploadSerializer,
    PlacementConfigSerializer,
    SubmissionEditSerializer,
    UserSerializer,
    InstructorProfileSerializer,
    InternProfileSerializer,
    CourseSerializer,
    InternScheduleSerializer,
    TaskAssignmentSerializer,
    NotificationSerializer,
    InternRegisterSerializer,
)
from .permissions import IsAdmin, IsInstructor, IsIntern

User = get_user_model()
signer = TimestampSigner()
logger = logging.getLogger(__name__)


# ── TEMPORARY: One-time admin creation endpoint ───────────────
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def temp_create_admin(request):
    """TEMPORARY: Creates an admin user. DELETE THIS ENDPOINT IMMEDIATELY AFTER USE."""
    secret = request.GET.get("secret")
    # ⚠️ CHANGE THIS SECRET TO SOMETHING UNIQUE BEFORE PUSHING
    if secret != "SUPER_SECRET_ADMIN_SETUP_84729":
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    if User.objects.filter(role=User.Role.ADMIN, is_active=True).exists():
        return Response({"message": "Admin user already exists."})

    try:
        admin = User.objects.create_superuser(
            email="admin@earlycode.com",
            password="TempAdminPass123!",  # ⚠️ CHANGE THIS PASSWORD
            first_name="System",
            last_name="Admin",
            role=User.Role.ADMIN,
        )
        from .models import AdminProfile

        AdminProfile.objects.get_or_create(user=admin)
        return Response(
            {
                "success": True,
                "message": "Admin created successfully.",
                "email": admin.email,
                "password": "TempAdminPass123!",  # ⚠️ CHANGE THIS PASSWORD
            }
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ──────────────────────────────────────────────────────────────


# ============================================================================
# AUTHENTICATION & MAGIC LINKS
# ============================================================================


class InternRegisterView(generics.CreateAPIView):
    """Register a new intern. No password required — magic link login."""

    throttle_classes = [RegisterThrottle]
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
                school_end_date=serializer.validated_data.get("school_end_date"),
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
        # Notify all admins a new registration awaits review (email)
        _notify_admins(user, intern)

        # In-app notification to every active admin (bell + feed)
        _notify_admins_in_app(user)

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
            logging.error(f"Welcome email failed: {email_error}")


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([MagicLinkThrottle])
def request_magic_link(request):
    """User enters email → Django sends magic link as HTML email."""
    raw_email = request.data.get("email", "")
    email = raw_email.strip().lower()

    if not email:
        return Response(
            {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"message": "If an account exists, a login link has been sent."}
        )

    token = signer.sign(user.email)
    safe_token = quote(token)

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    magic_link = f"{frontend_url}/verify-login?token={safe_token}"

    # Security: Gate token logging behind an explicit env var.
    # Default is OFF to prevent secrets in logs.
    if getattr(settings, "LOG_MAGIC_LINKS", False):
        logger.warning("MAGIC LINK GENERATED for %s: %s", user.email, magic_link)
    else:
        logger.info("MAGIC LINK GENERATED for %s (token hidden)", user.email)

    _send_magic_link_email(user, magic_link)

    return Response({"message": "If an account exists, a login link has been sent."})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def verify_magic_link(request):
    """
    User clicks magic link → Django verifies token, sets httpOnly session cookie.
    Tries multiple candidate tokens to survive quoted-printable mail damage.
    """
    raw_token = request.query_params.get("token")
    if not raw_token:
        return Response(
            {"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    candidates = _token_candidates(raw_token)
    user = None
    last_error = None

    for candidate in candidates:
        try:
            email = signer.unsign(candidate, max_age=settings.MAGIC_LINK_MAX_AGE)
            user = User.objects.get(email__iexact=email.strip().lower())
            break
        except (SignatureExpired, BadSignature, User.DoesNotExist) as e:
            last_error = e
            continue

    # 🔒 FIX: Use `raw_token` here, NOT `email`.
    # If we reach this point, `email` was never successfully assigned.
    if user is None:
        logger.warning(
            "Magic link verification FAILED. Token: %r. Error: %s",
            raw_token,
            str(last_error),
        )
        return Response(
            {"error": "Invalid or expired link"}, status=status.HTTP_400_BAD_REQUEST
        )

    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

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


def _send_magic_link_email(user, link):
    """
    Sends the magic link as multipart/alternative (text + HTML).
    HTML survives quoted-printable mail transport intact.
    """
    subject = "Your EarlyCode SIWES Login Link"
    text_body = (
        f"Hi {user.first_name or 'there'},\n\n"
        f"Click this link to log in:\n{link}\n\n"
        "- EarlyCode Team"
    )
    html_body = (
        f"<div style='font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;'>"
        f"<p>Hi {user.first_name or 'there'},</p>"
        f"<p>Click the button below to log in to your EarlyCode dashboard:</p>"
        f"<p><a href='{link}' style='display:inline-block;padding:10px 22px;"
        f"background:#FFD60A;color:#1B1607;text-decoration:none;"
        f"border-radius:999px;font-weight:600;'>Log in to EarlyCode</a></p>"
        f"<p style='color:#666;font-size:12px;'>Or copy this link:<br>"
        f"<span style='word-break:break-all;'>{link}</span></p>"
        f"<p style='color:#666;font-size:12px;'>- EarlyCode Team</p>"
        f"</div>"
    )
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email="noreply@earlycode.com",
        to=[user.email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=True)


def _token_candidates(raw):
    """
    Repairs quoted-printable mail damage: soft line breaks and =3D artifacts.
    Returns validation order, safest first.
    """
    base = "".join((raw or "").split())
    no_eq = base.replace("=", "")
    candidates = [raw, base, no_eq]
    if base.startswith("3D"):
        candidates.append(base[2:])
    if no_eq.startswith("3D"):
        candidates.append(no_eq[2:])
    seen, ordered = set(), []
    for c in candidates:
        if c and c not in seen:
            seen.add(c)
            ordered.append(c)
    return ordered


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
    response = Response({"success": True, "message": "Logged out successfully."})

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
    missing_documents = (
        InternProfile.objects.filter(status=InternProfile.Status.ACTIVE)
        .annotate(doc_count=Count("documents"))
        .filter(doc_count__lt=2)
        .count()
    )

    unread_conversations = (
        Conversation.objects.filter(
            Q(initiator=request.user) | Q(recipient=request.user),
        )
        .filter(
            Exists(
                Message.objects.filter(
                    conversation=OuterRef("pk"),
                    is_read=False,
                ).exclude(sender=request.user)
            )
        )
        .count()
    )

    return Response(
        {
            "total_interns": total_interns,
            "total_instructors": total_instructors,
            "pending_interns": pending_interns,
            "active_interns": active_interns,
            "missing_documents": missing_documents,
            "unread_conversations": unread_conversations,
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAdmin])
def admin_own_profile(request):
    """Admin's own profile; phone + campus editable."""
    user = request.user
    profile = getattr(user, "admin_profile", None)

    if request.method == "PATCH":
        data = request.data
        update_fields = []
        if "phone" in data:
            user.phone = (data.get("phone") or "").strip()
            update_fields.append("phone")
        if update_fields:
            user.save(update_fields=update_fields)
        if profile is not None and "campus" in data:
            profile.campus = (data.get("campus") or "").strip() or profile.campus
            profile.save(update_fields=["campus"])

    return Response(
        {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "campus": profile.campus if profile is not None else "",
            "profile_picture": (
                user.profile_picture.url
                if getattr(user, "profile_picture", None)
                else None
            ),
        }
    )


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_pending_interns(request):
    """
    Returns a list of interns awaiting review (status = PENDING),
    each with a short summary of their submission.
    """
    pending = (
        InternProfile.objects.filter(
            status=InternProfile.Status.PENDING,
            user__is_active=True,
        )
        .select_related("user", "assigned_instructor__user")
        .order_by("-created_at")
    )

    data = []
    for intern in pending:
        user = intern.user
        data.append(
            {
                "id": str(intern.id),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone": user.phone,
                    "gender": user.gender,
                },
                "preferred_campus": intern.preferred_campus,
                "current_institution": intern.current_institution,
                "course_of_study": intern.course_of_study,
                "current_level": intern.current_level,
                "school_start_date": intern.school_start_date,
                "school_end_date": intern.school_end_date,
                "internship_duration": intern.internship_duration,
                "created_at": intern.created_at,
            }
        )

    return Response(
        {
            "count": len(data),
            "results": data,
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAdmin])
def admin_intern_submission(request, pk):
    """
    Returns the full submission details for a single intern (any status),
    used by the admin review modal.
    """
    try:
        intern = InternProfile.objects.select_related(
            "user", "assigned_instructor__user"
        ).get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "PATCH":
        return _edit_submission(request, intern)

    user = intern.user

    # Courses the intern selected during registration
    courses = [
        {
            "id": str(ic.course.id),
            "course_name": ic.course.course_name,
            "course_code": ic.course.course_code,
            "duration": ic.course.duration,
        }
        for ic in intern.courses.select_related("course").all()
    ]

    # Documents already sent to this intern (usually none while pending)
    documents = InternDocumentSerializer(
        intern.documents.all(),
        many=True,
        context={"request": request},
    ).data
    # Schedules currently assigned to this intern
    schedules = [
        {
            "id": str(s.id),
            "day_of_week": s.slot.day_of_week,
            "shift": s.slot.shift,
            "start_time": s.slot.start_time.strftime("%H:%M"),
            "end_time": s.slot.end_time.strftime("%H:%M"),
            "is_rotating": s.is_rotating,
        }
        for s in intern.schedules.select_related("slot").all()
    ]
    return Response(
        {
            "id": str(intern.id),
            "status": intern.status,
            "created_at": intern.created_at,
            "updated_at": intern.updated_at,
            # User fields
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "gender": user.gender,
                "address": user.address,
                "is_active": user.is_active,
            },
            # Placement / academic fields
            "state_of_origin": intern.state_of_origin,
            "preferred_campus": intern.preferred_campus,
            "current_institution": intern.current_institution,
            "institution_address": intern.institution_address,
            "course_of_study": intern.course_of_study,
            "current_level": intern.current_level,
            "matric_number": intern.matric_number,
            "internship_duration": intern.internship_duration,
            "other_duration": intern.other_duration,
            "school_start_date": intern.school_start_date,
            "school_end_date": intern.school_end_date,
            # Narrative
            "why_intern": intern.why_intern,
            "emergency_contact_type": intern.emergency_contact_type,
            "emergency_phone": intern.emergency_phone,
            "declaration": intern.declaration,
            # Relations
            "courses": courses,
            "assigned_instructor": (
                {
                    "id": str(intern.assigned_instructor.user.id),
                    "name": intern.assigned_instructor.user.get_full_name(),
                    "email": intern.assigned_instructor.user.email,
                }
                if intern.assigned_instructor
                else None
            ),
            "documents": documents,
            "schedules": schedules,
        }
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_accept_intern(request, pk):
    """
    Accept a pending intern. Sets status to ACTIVE and reactivates the user
    if they were previously soft-deleted. Sends a notification.
    """
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if intern.status == InternProfile.Status.ACTIVE:
        return Response(
            {"error": "Intern is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        intern.status = InternProfile.Status.ACTIVE
        intern.save(update_fields=["status"])

        # If the user had been soft-deleted by a previous rejection,
        # restore access.
        user = intern.user
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["is_active"])

        Notification.objects.create(
            user=user,
            type=Notification.Type.INSTRUCTOR_ASSIGNED,
            message=(
                "Your registration has been accepted. "
                "You will receive your acceptance letter and code of conduct "
                "shortly."
            ),
        )

    return Response(
        {
            "success": True,
            "message": "Intern accepted.",
            "intern": {
                "id": str(intern.id),
                "status": intern.status,
                "user_id": str(user.id),
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_reject_intern(request, pk):
    """
    Reject a pending intern. Soft-deletes the user (is_active = False),
    stores the rejection reason, and emails the intern that reason.
    """
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    reason = (request.data.get("reason") or "").strip()
    if len(reason) < 10:
        return Response(
            {"error": "A rejection reason of at least 10 characters is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not intern.user.is_active:
        return Response(
            {"error": "This intern has already been rejected."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        user = intern.user
        user.is_active = False
        user.save(update_fields=["is_active"])
        intern.rejection_reason = reason
        intern.save(update_fields=["rejection_reason"])

    # Email outside the transaction — a mail failure must not
    # roll back the rejection.
    try:
        _send_rejection_email(intern, reason)
    except Exception as email_error:
        print(f"Rejection email failed: {email_error}")

    return Response(
        {
            "success": True,
            "message": "Intern rejected.",
            "intern": {
                "id": intern.id,
                "status": intern.status,
                "user_id": str(user.id),
                "is_active": user.is_active,
            },
        }
    )


def _send_rejection_email(intern, reason):
    """Emails the rejected intern the admin's reason."""
    user = intern.user
    subject = "Your SIWES application — decision update"
    message = (
        f"Hi {user.first_name or 'there'},\n"
        "Thank you for applying to the EarlyCode SIWES programme.\n"
        "After reviewing your submission, we are unable to accept your "
        "application at this time.\n\n"
        f"Reason: {reason}\n\n"
        "If you believe this is a mistake, please contact the EarlyCode "
        "office.\n"
        "— EarlyCode SIWES Team"
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost"),
        recipient_list=[user.email],
        fail_silently=False,
    )


def _edit_submission(request, intern):
    """
    Admin correction of a pending submission. Only the six non-sensitive
    fields in SubmissionEditSerializer are writable; the view enforces
    PENDING status so accepted records can't be altered here.
    """
    if intern.status != InternProfile.Status.PENDING:
        return Response(
            {"error": "Submissions can only be edited while pending."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = SubmissionEditSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    editable = [
        "preferred_campus",
        "school_start_date",
        "school_end_date",
        "internship_duration",
        "other_duration",
        "why_intern",
    ]
    changed = [f for f in editable if f in data]
    if not changed:
        return Response(
            {"error": "No editable fields provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for field in changed:
        setattr(intern, field, data[field])
    intern.save(update_fields=changed)

    return Response(
        {
            "success": True,
            "message": "Submission updated.",
            "updated_fields": changed,
        }
    )


# ───────────────────────────────────────────────────────────────
# ADMIN — CONFIGURE PLACEMENT
# ───────────────────────────────────────────────────────────────


@api_view(["POST", "PATCH"])
@permission_classes([IsAdmin])
def admin_configure_intern(request, pk):
    """
    Configure or reconfigure an intern's placement.

    Accepts any subset of:
      - school_start_date
      - school_end_date
      - instructor_id
      - is_rotating
      - schedule (list of {day_of_week, shift})

    Missing keys are left untouched. Sending `schedule` (even empty)
    wipes and rebuilds all InternSchedule rows for the intern.
    """
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = PlacementConfigSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    with transaction.atomic():
        # ---- Dates ----
        if "school_start_date" in data:
            intern.school_start_date = data["school_start_date"]
        if "school_end_date" in data:
            intern.school_end_date = data["school_end_date"]
        if "school_start_date" in data or "school_end_date" in data:
            intern.save(update_fields=["school_start_date", "school_end_date"])

        # ---- Instructor ----
        if "instructor_id" in data:
            if data["instructor_id"] is None:
                intern.assigned_instructor = None
                intern.save(update_fields=["assigned_instructor"])
            else:
                try:
                    instructor = InstructorProfile.objects.get(
                        user__id=data["instructor_id"]
                    )
                except InstructorProfile.DoesNotExist:
                    return Response(
                        {"error": "Instructor not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                intern.assigned_instructor = instructor
                intern.save(update_fields=["assigned_instructor"])

        # ---- Schedule (wipe and rebuild) ----
        if "schedule" in data:
            entries = data["schedule"]
            is_rotating = data.get("is_rotating", True)

            # Wipe
            InternSchedule.objects.filter(intern=intern).delete()

            # Rebuild
            for entry in entries:
                slot, _created = ScheduleSlot.objects.get_or_create(
                    day_of_week=entry["day_of_week"],
                    shift=entry["shift"],
                    defaults={
                        "start_time": (
                            "08:30"
                            if entry["shift"] == ScheduleSlot.Shift.MORNING
                            else "13:00"
                        ),
                        "end_time": (
                            "13:00"
                            if entry["shift"] == ScheduleSlot.Shift.MORNING
                            else "18:00"
                        ),
                    },
                )
                InternSchedule.objects.create(
                    intern=intern,
                    slot=slot,
                    is_rotating=is_rotating,
                )

    # ---- Response: fresh intern summary ----
    schedules = [
        {
            "day_of_week": s.slot.day_of_week,
            "shift": s.slot.shift,
            "start_time": s.slot.start_time.strftime("%H:%M"),
            "end_time": s.slot.end_time.strftime("%H:%M"),
        }
        for s in InternSchedule.objects.filter(intern=intern).select_related("slot")
    ]

    return Response(
        {
            "success": True,
            "message": "Placement configured.",
            "intern": {
                "id": str(intern.id),
                "status": intern.status,
                "school_start_date": intern.school_start_date,
                "school_end_date": intern.school_end_date,
                "assigned_instructor": (
                    {
                        "id": str(intern.assigned_instructor.user.id),
                        "name": intern.assigned_instructor.user.get_full_name(),
                        "email": intern.assigned_instructor.user.email,
                    }
                    if intern.assigned_instructor
                    else None
                ),
                "schedules": schedules,
            },
        }
    )


def _document_context(intern):
    """Builds the template context for generated intern documents."""
    user = intern.user
    gender = (user.gender or "").lower()
    honorific, possessive, objective = {
        "male": ("Mr.", "his", "him"),
        "female": ("Ms.", "her", "her"),
    }.get(gender, ("Mx.", "their", "them"))

    def pretty(d):
        return f"{d:%B} {d.day}, {d.year}" if d else "—"

    duration = intern.internship_duration or ""
    if duration == "other":
        duration_text = intern.other_duration or "the agreed period"
    elif duration:
        duration_text = duration.replace("-", " ")
    else:
        duration_text = "the agreed period"

    shift_lines = []
    schedules = list(intern.schedules.select_related("slot"))
    if schedules:
        slot = schedules[0].slot
        base = slot.get_shift_display()
        shifts = (
            ["Morning", "Afternoon", "Morning", "Afternoon"]
            if schedules[0].is_rotating
            else [base] * 4
        )
        day = slot.get_day_of_week_display()
        shift_lines = [
            {"week": i + 1, "day": day, "shift": shifts[i]} for i in range(4)
        ]

    # ── Logo Base64 Encoding ─────────────────────────────────────
    logo_dir = Path(settings.BASE_DIR).parent / "frontend" / "public"
    logo_path = logo_dir / "earlycode_logo.png"
    if not logo_path.exists():
        logo_path = logo_dir / "earlycode_logo.webp"
    logo_data_uri = ""
    if logo_path.exists():
        with open(logo_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        ext = logo_path.suffix.lower().lstrip(".")
        if ext == "jpg":
            ext = "jpeg"
        logo_data_uri = f"data:image/{ext};base64,{b64}"

    # ── HR signature: accept ANY name/format (png/jpg only) ─────
    signature_data_uri = ""
    sig_files = [
        p
        for pattern in ("hr_signature*", "signature*")
        for p in logo_dir.glob(pattern)
        if p.suffix.lower() in (".png", ".jpg", ".jpeg")
    ]
    if sig_files:
        sig_path = sig_files[0]
        with open(sig_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        mime = "jpeg" if sig_path.suffix.lower() in (".jpg", ".jpeg") else "png"
        signature_data_uri = f"data:image/{mime};base64,{b64}"
        logger.info("Signature embedded: %s", sig_path.name)
    else:
        found = [p.name for p in logo_dir.glob("*signature*")]
        logger.warning("No signature png/jpg found in %s. Found: %s", logo_dir, found)

    # ── Local TTF folder for @font-face ─────────────────────────
    fonts_dir_path = (
        Path(settings.BASE_DIR) / "siwes" / "templates" / "siwes" / "docs" / "fonts"
    )
    fonts_dir = fonts_dir_path.as_posix() if fonts_dir_path.exists() else ""
    if fonts_dir:
        logger.info("PDF Fonts loaded: %s", sorted(p.name for p in fonts_dir_path.glob('*.ttf')))
    else:
        logger.warning("PDF fonts folder missing → falling back to Helvetica")

    return {
        "issued_date": pretty(timezone.now().date()),
        "full_name": user.get_full_name(),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "honorific": honorific,
        "possessive": possessive,
        "objective": objective,
        "matric_number": intern.matric_number or "—",
        "level": intern.current_level or "—",
        "course_of_study": intern.course_of_study or "—",
        "institution": intern.current_institution or "—",
        "duration_text": duration_text,
        "start_date": pretty(intern.school_start_date),
        "end_date": pretty(intern.school_end_date),
        "shift_lines": shift_lines,
        "logo_data_uri": logo_data_uri,  # Inject the base64 string
        "fonts_dir": fonts_dir,
        "signature_data_uri": signature_data_uri,
    }


@api_view(["POST"])
@permission_classes([IsAdmin])
def generate_intern_documents(request, pk):
    """
    Renders the acceptance letter + code of conduct PDFs from the HTML
    templates and stores them on the intern's document record.
    Body: {"only_missing": true} (default) skips types that already
    have a document — that's how manual uploads keep priority.
    """
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    only_missing = bool(request.data.get("only_missing", True))
    allowed = {
        InternDocument.Type.ACCEPTANCE_LETTER,
        InternDocument.Type.CODE_OF_CONDUCT,
    }
    requested = request.data.get("types") or []
    types = [t for t in requested if t in allowed] or list(allowed)
    context = _document_context(intern)
    results = []
    created_types = []
    for doc_type, template in (
        (
            InternDocument.Type.ACCEPTANCE_LETTER,
            "siwes/docs/acceptance_letter.html",
        ),
        (
            InternDocument.Type.CODE_OF_CONDUCT,
            "siwes/docs/code_of_conduct.html",
        ),
    ):
        if doc_type not in types:
            continue
        existing = InternDocument.objects.filter(intern=intern, type=doc_type).first()
        if existing and only_missing:
            results.append(
                {
                    "type": doc_type,
                    "file_url": existing.file.url,
                    "generated": True,
                }
            )
            continue

        html = render_to_string(template, context)
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(io.StringIO(html), dest=buffer)
        if pisa_status.err:
            return Response(
                {"error": f"PDF generation failed for {doc_type}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if existing:
            existing.delete()
        filename = f"{intern.user.last_name}_{doc_type.lower()}.pdf"
        doc = InternDocument.objects.create(
            intern=intern,
            type=doc_type,
            file=ContentFile(buffer.getvalue(), name=filename),
        )
        results.append(
            {
                "type": doc_type,
                "file_url": doc.file.url,
                "generated": True,
            }
        )

        if created_types:
            try:
                _send_documents_email(intern, created_types)
            except Exception as email_error:
                print(f"Documents email failed: {email_error}")
        return Response({"success": True, "documents": results})


# ───────────────────────────────────────────────────────────────
# ADMIN — INSTRUCTOR CRUD
# ───────────────────────────────────────────────────────────────


class AdminInstructorListView(generics.ListAPIView):
    """
    GET — list all instructors. Admins only.

    Query params:
      ?all=true          — include deactivated instructors
      ?campus=kubwa      — filter by campus
    """

    serializer_class = AdminInstructorSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        include_all = self.request.query_params.get("all") == "true"
        campus = self.request.query_params.get("campus")

        qs = InstructorProfile.objects.select_related("user").order_by(
            "user__first_name", "user__last_name"
        )
        if not include_all:
            qs = qs.filter(user__is_active=True)
        if campus in ("kubwa", "nyanya"):
            qs = qs.filter(campus=campus)
        return qs


class AdminInstructorDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   — read one instructor
    PATCH — update editable fields (name, phone, department)

    Uses the User's UUID as the lookup key, matching the `id` returned
    by AdminInstructorSerializer. The InstructorProfile itself uses an
    integer pk, which is not exposed to the frontend.
    """

    serializer_class = AdminInstructorSerializer
    permission_classes = [IsAdmin]
    queryset = InstructorProfile.objects.select_related("user")

    def get_object(self):
        try:
            return self.get_queryset().get(user__id=self.kwargs["pk"])
        except InstructorProfile.DoesNotExist:
            raise NotFound("Instructor not found")

    def patch(self, request, *args, **kwargs):
        instructor = self.get_object()
        serializer = InstructorUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            user = instructor.user
            user_fields = []
            if "first_name" in data:
                user.first_name = data["first_name"]
                user_fields.append("first_name")
            if "last_name" in data:
                user.last_name = data["last_name"]
                user_fields.append("last_name")
            if "phone" in data:
                user.phone = data["phone"]
                user_fields.append("phone")
            if user_fields:
                user.save(update_fields=user_fields)

            if "department" in data or "campus" in data:
                fields = []
                if "department" in data:
                    instructor.department = data["department"]
                    fields.append("department")
                if "campus" in data:
                    instructor.campus = data["campus"]
                    fields.append("campus")
                instructor.save(update_fields=fields)

        return Response(
            {
                "success": True,
                "instructor": AdminInstructorSerializer(instructor).data,
            }
        )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_instructor(request):
    """
    Create a new instructor (User + InstructorProfile) atomically.
    Sends a welcome email with login instructions.
    """
    serializer = InstructorCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    with transaction.atomic():
        email = data["email"].strip().lower()
        user = User.objects.create(
            username=data["email"],
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone", ""),
            role=User.Role.INSTRUCTOR,
        )
        user.set_unusable_password()
        user.save()

        instructor = InstructorProfile.objects.create(
            user=user,
            department=data.get("department", ""),
            campus=data.get("campus", "kubwa"),
        )

    # Welcome email outside the transaction
    try:
        _send_instructor_welcome_email(user)
    except Exception as email_error:
        print(f"Instructor welcome email failed: {email_error}")

    return Response(
        {
            "success": True,
            "message": "Instructor created.",
            "instructor": AdminInstructorSerializer(instructor).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_deactivate_instructor(request, pk):
    """
    Temporarily disable an instructor.
    Interns keep their assignments. Instructor cannot log in.
    """
    try:
        instructor = InstructorProfile.objects.select_related("user").get(user__id=pk)
    except InstructorProfile.DoesNotExist:
        return Response(
            {"error": "Instructor not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not instructor.user.is_active:
        return Response(
            {"error": "Instructor is already deactivated."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = instructor.user
    user.is_active = False
    user.save(update_fields=["is_active"])

    return Response(
        {
            "success": True,
            "message": "Instructor deactivated.",
        }
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_reactivate_instructor(request, pk):
    """Restore a deactivated instructor."""
    try:
        instructor = InstructorProfile.objects.select_related("user").get(user__id=pk)
    except InstructorProfile.DoesNotExist:
        return Response(
            {"error": "Instructor not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    user = instructor.user
    if user.is_active:
        return Response(
            {"error": "Instructor is already active."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.is_active = True
    user.save(update_fields=["is_active"])

    return Response(
        {
            "success": True,
            "message": "Instructor reactivated.",
        }
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_remove_instructor(request, pk):
    """
    Remove an instructor from the active roster.

    - Unassigns the instructor from any interns currently pointing at them
    - Soft-deletes the user (is_active = False)
    - Keeps the InstructorProfile row for historical reference
    """
    try:
        instructor = InstructorProfile.objects.select_related("user").get(user__id=pk)
    except InstructorProfile.DoesNotExist:
        return Response(
            {"error": "Instructor not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    with transaction.atomic():
        # Find interns before unassigning so we can notify them
        affected_interns = list(
            InternProfile.objects.filter(assigned_instructor=instructor).select_related(
                "user"
            )
        )

        # Unassign
        unassigned = InternProfile.objects.filter(
            assigned_instructor=instructor
        ).update(assigned_instructor=None)

        # Notify each affected intern
        for intern in affected_interns:
            Notification.objects.create(
                user=intern.user,
                type=Notification.Type.INSTRUCTOR_ASSIGNED,
                message=(
                    "Your instructor has been unassigned. "
                    "A new instructor will be assigned to you soon."
                ),
            )

        # Soft-delete
        user = instructor.user
        user.is_active = False
        user.save(update_fields=["is_active"])

    return Response(
        {
            "success": True,
            "message": "Instructor removed.",
            "unassigned_interns": unassigned,
        }
    )


def _send_instructor_welcome_email(user):
    """Sends a plain-text welcome email to a newly created instructor."""
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    login_url = f"{frontend_url}/login"

    subject = "Welcome to EarlyCode SIWES (Instructor)"

    message = (
        f"Hi {user.first_name or user.email},\n\n"
        "An administrator has created your instructor account on the "
        "EarlyCode SIWES portal.\n\n"
        "To log in, go to the login page and request a magic link:\n"
        f"{login_url}\n\n"
        "EarlyCode SIWES Team"
    )

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost")

    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )


def _notify_admins(user, intern):
    """One email to every active admin per new registration."""
    admin_emails = list(
        User.objects.filter(role=User.Role.ADMIN, is_active=True).values_list(
            "email", flat=True
        )
    )
    if not admin_emails:
        return
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    review_url = f"{frontend_url}/dashboard/admin/pending"
    subject = "New SIWES registration — review pending"
    message = (
        "A new intern has registered and is awaiting review.\n\n"
        f"Name: {user.get_full_name() or '—'}\n"
        f"Email: {user.email}\n"
        f"Campus: {intern.preferred_campus or '—'}\n\n"
        f"Review here: {review_url}\n"
        "— EarlyCode SIWES"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost")
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=admin_emails,
            fail_silently=False,
        )
    except Exception as email_error:
        logger.error("Admin notification email failed: %s", email_error)


def _notify_admins_in_app(user):
    """Creates a NEW_REGISTRATION notification for every active admin."""
    admin_ids = list(
        User.objects.filter(role=User.Role.ADMIN, is_active=True).values_list(
            "id", flat=True
        )
    )
    if not admin_ids:
        return
    name = user.get_full_name() or user.email
    Notification.objects.bulk_create(
        Notification(
            user_id=admin_id,
            type=Notification.Type.NEW_REGISTRATION,
            message=f"New intern {name} has registered and is awaiting review.",
        )
        for admin_id in admin_ids
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_upload_documents(request, pk):
    """
    Upload one or both PDF documents for an intern.
    Replaces any existing document of the same type.

    Accepts multipart/form-data with optional fields:
      - code_of_conduct
      - acceptance_letter
    """
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = InternDocumentUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uploaded_types = []

    with transaction.atomic():
        if serializer.validated_data.get("code_of_conduct"):
            _upsert_intern_document(
                intern=intern,
                doc_type=InternDocument.Type.CODE_OF_CONDUCT,
                file=serializer.validated_data["code_of_conduct"],
                uploaded_by=request.user,
            )
            uploaded_types.append("CODE_OF_CONDUCT")

        if serializer.validated_data.get("acceptance_letter"):
            _upsert_intern_document(
                intern=intern,
                doc_type=InternDocument.Type.ACCEPTANCE_LETTER,
                file=serializer.validated_data["acceptance_letter"],
                uploaded_by=request.user,
            )
            uploaded_types.append("ACCEPTANCE_LETTER")

    documents = InternDocumentSerializer(
        intern.documents.all(),
        many=True,
        context={"request": request},
    ).data

    # Send notification email outside the transaction so a mail failure
    # never rolls back a successful upload.
    try:
        _send_documents_email(intern, uploaded_types)
    except Exception as email_error:
        # Log but don't fail the request. Upload already succeeded.
        print(f"Documents email failed: {email_error}")

    return Response(
        {
            "success": True,
            "message": "Documents uploaded.",
            "uploaded": uploaded_types,
            "documents": documents,
        }
    )


def _upsert_intern_document(intern, doc_type, file, uploaded_by):
    """
    Creates or replaces an InternDocument of the given type for the given intern.
    If a document of that type already exists, its old file is deleted from
    storage before the new file is saved.
    """
    existing = InternDocument.objects.filter(intern=intern, type=doc_type).first()

    if existing:
        # Delete the old file from disk to avoid orphan files.
        if existing.file:
            existing.file.delete(save=False)

        existing.file = file
        existing.uploaded_by = uploaded_by
        existing.save(update_fields=["file", "uploaded_by"])
    else:
        InternDocument.objects.create(
            intern=intern,
            type=doc_type,
            file=file,
            uploaded_by=uploaded_by,
        )


def _send_documents_email(intern, uploaded_types):
    """
    Sends the intern an email letting them know new documents are available.
    """
    if not uploaded_types:
        return

    user = intern.user
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    portal_url = f"{frontend_url}/dashboard/intern"

    # Friendly labels for the types that were uploaded
    type_labels = {
        "CODE_OF_CONDUCT": "Code of Conduct",
        "ACCEPTANCE_LETTER": "Acceptance Letter",
    }
    labels = [type_labels.get(t, t) for t in uploaded_types]

    if len(labels) == 1:
        subject_what = labels[0]
    else:
        subject_what = " and ".join(labels)

    subject = "Your SIWES documents are ready"

    greeting = user.first_name or "there"

    message = (
        f"Hi {greeting},\n\n"
        f"Your {subject_what} ha"
        f"{'s' if len(labels) == 1 else 've'} been uploaded "
        f"to your SIWES portal.\n\n"
        f"Log in to download:\n{portal_url}\n\n"
        f"— Early Code Team"
    )

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@localhost")

    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )


class AdminInternPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminInternListCreateView(generics.ListAPIView):
    """
    GET — list all interns with pagination, status filter, search, campus filter.
    Query params:
      ?status=pending|active|completed|all  (default: all)
      ?search=john                          (searches name + email)
      ?campus=kubwa|nyanya                  (optional)
      ?page=2                               (pagination)
    """

    serializer_class = AdminInternListSerializer
    permission_classes = [IsAdmin]
    pagination_class = AdminInternPagination

    def get_queryset(self):
        qs = InternProfile.objects.select_related(
            "user", "assigned_instructor__user"
        ).order_by("-created_at")

        # Missing docs filter (overrides status to ACTIVE)
        missing_docs = self.request.query_params.get("missing_docs")
        if missing_docs == "true":
            from django.db.models import Count

            qs = (
                qs.filter(status=InternProfile.Status.ACTIVE)
                .annotate(doc_count=Count("documents"))
                .filter(doc_count__lt=2)
            )
        else:
            # Status filter
            status_filter = self.request.query_params.get("status", "all")
            if status_filter in ("pending", "active", "completed"):
                qs = qs.filter(status=status_filter.upper())

        # Campus filter
        campus = self.request.query_params.get("campus")
        if campus in ("kubwa", "nyanya"):
            qs = qs.filter(preferred_campus=campus)

        # Search
        search = self.request.query_params.get("search", "").strip()
        if search:
            from django.db.models import Q

            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
            )
        return qs


class AdminInternDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InternProfile.objects.all()
    serializer_class = InternProfileSerializer
    permission_classes = [IsAdmin]


@api_view(["POST"])
@permission_classes([IsAdmin])
def assign_instructor(request, pk):
    try:
        intern = InternProfile.objects.select_related("user").get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response({"error": "Intern not found"}, status=status.HTTP_404_NOT_FOUND)

    instructor_id = request.data.get("instructor_id")
    if not instructor_id:
        return Response(
            {"error": "instructor_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        instructor = InstructorProfile.objects.select_related("user").get(
            user__id=instructor_id
        )
    except InstructorProfile.DoesNotExist:
        return Response(
            {"error": "Instructor not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    intern.assigned_instructor = instructor
    intern.save(update_fields=["assigned_instructor"])

    Notification.objects.create(
        user=intern.user,
        type=Notification.Type.INSTRUCTOR_ASSIGNED,
        message=(
            f"You have been assigned a new instructor: "
            f"{instructor.user.get_full_name()}."
        ),
    )

    return Response(
        {
            "success": True,
            "message": "Instructor assigned.",
            "intern": {
                "id": intern.pk,
                "assigned_instructor": {
                    "id": str(instructor.user.id),
                    "name": instructor.user.get_full_name(),
                    "email": instructor.user.email,
                },
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAdmin])
def set_intern_dates(request, pk):
    try:
        intern = InternProfile.objects.get(pk=pk)
    except InternProfile.DoesNotExist:
        return Response({"error": "Intern not found"}, status=status.HTTP_404_NOT_FOUND)

    intern.school_start_date = (
        request.data.get("school_start_date") or intern.school_start_date
    )
    intern.school_end_date = (
        request.data.get("school_end_date") or intern.school_end_date
    )
    intern.status = request.data.get("status", intern.status)
    intern.save()

    return Response({"success": True, "message": "Dates updated"})


class AdminInstructorListCreateView(generics.ListCreateAPIView):
    queryset = InstructorProfile.objects.all()
    serializer_class = InstructorProfileSerializer
    permission_classes = [IsAdmin]


class AdminScheduleListCreateView(generics.ListCreateAPIView):
    queryset = InternSchedule.objects.all()
    serializer_class = InternScheduleSerializer
    permission_classes = [IsAdmin]


# ============================================================================
# INSTRUCTOR VIEWS
# ============================================================================


class InstructorTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = InstructorTaskSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)

    def create(self, request, *args, **kwargs):
        """
        Creates a task and optionally attaches files uploaded in the
        same request (multipart/form-data with `attachments` field).
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(instructor=request.user.instructor_profile)

        # Handle file attachments
        attachments = request.FILES.getlist("attachments")
        for file in attachments:
            TaskAttachment.objects.create(task=task, file=file)

        return Response(
            self.get_serializer(task).data,
            status=status.HTTP_201_CREATED,
        )


class InstructorTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InstructorTaskSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Task.objects.filter(instructor=self.request.user.instructor_profile)


@api_view(["GET"])
@permission_classes([IsInstructor])
def instructor_dashboard(request):
    """
    Overview payload: stats, assigned interns  awaiting
    review, and the most recently reviewed  .
    """
    instructor = request.user.instructor_profile
    interns = InternProfile.objects.filter(
        assigned_instructor=instructor
    ).select_related("user")
    tasks_awaiting_review = TaskAssignment.objects.filter(
        status=TaskAssignment.Status.SUBMITTED,
        task__instructor=instructor,
    ).count()
    unread_messages = (
        Message.objects.filter(
            Q(conversation__initiator=request.user)
            | Q(conversation__recipient=request.user),
            is_read=False,
        )
        .exclude(sender=request.user)
        .count()
    )

    unread_conversations = (
        Conversation.objects.filter(
            Q(initiator=request.user) | Q(recipient=request.user),
        )
        .filter(
            Exists(
                Message.objects.filter(
                    conversation=OuterRef("pk"),
                    is_read=False,
                ).exclude(sender=request.user)
            )
        )
        .count()
    )

    return Response(
        {
            "stats": {
                "total_interns": interns.count(),
                "active_interns": interns.filter(
                    status=InternProfile.Status.ACTIVE
                ).count(),
                "tasks_awaiting_review": tasks_awaiting_review,
                "unread_messages": unread_messages,
                "unread_conversations": unread_conversations,
            },
            "interns": [
                {
                    "id": i.pk,
                    "name": i.user.get_full_name(),
                    "email": i.user.email,
                    "campus": i.preferred_campus,
                    "status": i.status,
                    "school_start_date": i.school_start_date,
                    "school_end_date": i.school_end_date,
                }
                for i in interns
            ],
        }
    )


@api_view(["GET"])
@permission_classes([IsInstructor])
def my_interns(request):
    """Lightweight list of the instructor's assigned interns."""
    instructor = request.user.instructor_profile
    interns = (
        InternProfile.objects.filter(assigned_instructor=instructor)
        .select_related("user")
        .order_by("user__first_name", "user__last_name")
    )
    data = []
    for i in interns:

        data.append(
            {
                "id": i.pk,
                "user": {
                    "id": str(i.user.id),
                    "first_name": i.user.first_name,
                    "last_name": i.user.last_name,
                    "email": i.user.email,
                    "phone": i.user.phone,
                },
                "preferred_campus": i.preferred_campus,
                "status": i.status,
                "school_start_date": i.school_start_date,
                "school_end_date": i.school_end_date,
                "course_of_study": i.course_of_study,
                "current_institution": i.current_institution,
            }
        )
    return Response({"count": len(data), "results": data})


@api_view(["GET"])
@permission_classes([IsInstructor])
def instructor_intern_detail(request, pk):
    """
    One intern (scoped to this instructor) with read-only schedule
     .
    """
    try:
        intern = InternProfile.objects.select_related("user").get(
            pk=pk,
            assigned_instructor=request.user.instructor_profile,
        )
    except InternProfile.DoesNotExist:
        return Response(
            {"error": "Intern not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    schedules = [
        {
            "id": str(s.id),
            "day_of_week": s.slot.day_of_week,
            "shift": s.slot.shift,
            "start_time": s.slot.start_time.strftime("%H:%M"),
            "end_time": s.slot.end_time.strftime("%H:%M"),
            "is_rotating": s.is_rotating,
        }
        for s in intern.schedules.select_related("slot").all()
    ]

    return Response(
        {
            "id": intern.pk,
            "user": {
                "id": str(intern.user.id),
                "first_name": intern.user.first_name,
                "last_name": intern.user.last_name,
                "email": intern.user.email,
                "phone": intern.user.phone,
            },
            "preferred_campus": intern.preferred_campus,
            "status": intern.status,
            "school_start_date": intern.school_start_date,
            "school_end_date": intern.school_end_date,
            "course_of_study": intern.course_of_study,
            "current_institution": intern.current_institution,
            "current_level": intern.current_level,
            "matric_number": intern.matric_number,
            "schedules": schedules,
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsInstructor])
def instructor_profile(request):
    """
    The instructor's own profile. GET returns it; PATCH allows
    editing phone and department only. Email and name are locked.
    """
    instructor = request.user.instructor_profile
    user = request.user

    if request.method == "PATCH":
        user_fields = []
        if "phone" in request.data:
            user.phone = (request.data.get("phone") or "").strip()
            user_fields.append("phone")
        if user_fields:
            user.save(update_fields=user_fields)
        if "department" in request.data:
            instructor.department = (request.data.get("department") or "").strip()
            instructor.save(update_fields=["department"])

    return Response(
        {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "department": instructor.department,
            "campus": instructor.campus,
            "assigned_intern_count": instructor.assigned_intern_count,
            "profile_picture": (
                request.user.profile_picture.url
                if getattr(request.user, "profile_picture", None)
                else None
            ),
        }
    )


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


@api_view(["POST"])
@permission_classes([IsInstructor])
def upload_task_attachments(request, pk):
    """
    Upload one or more files to an existing task. Instructor-only,
    scoped to own tasks.
    """
    try:
        task = Task.objects.get(
            pk=pk,
            instructor=request.user.instructor_profile,
        )
    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    attachments = request.FILES.getlist("attachments")
    if not attachments:
        return Response(
            {"error": "No files provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    created = []
    for file in attachments:
        attachment = TaskAttachment.objects.create(task=task, file=file)
        created.append(
            {
                "id": str(attachment.id),
                "file_url": attachment.file.url,
                "uploaded_at": attachment.uploaded_at,
            }
        )

    return Response(
        {
            "success": True,
            "message": f"{len(created)} file(s) uploaded.",
            "attachments": created,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsInstructor])
def review_task_assignment(request, pk):
    """
    Mark a submitted task assignment as REVIEWED with feedback.
    Scoped to the instructor's own tasks. Notifies the intern.
    """
    try:
        assignment = TaskAssignment.objects.select_related(
            "task__instructor__user", "intern__user"
        ).get(
            pk=pk,
            task__instructor=request.user.instructor_profile,
        )
    except TaskAssignment.DoesNotExist:
        return Response(
            {"error": "Task assignment not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if assignment.status != TaskAssignment.Status.SUBMITTED:
        return Response(
            {"error": "Only submitted tasks can be reviewed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    feedback = (request.data.get("feedback") or "").strip()
    if len(feedback) < 10:
        return Response(
            {"error": "Feedback of at least 10 characters is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    new_status = request.data.get("status", TaskAssignment.Status.REVIEWED)
    if new_status not in (
        TaskAssignment.Status.REVIEWED,
        TaskAssignment.Status.NEEDS_REVISION,
    ):
        return Response(
            {"error": "status must be REVIEWED or NEEDS_REVISION."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    assignment.status = new_status
    assignment.instructor_feedback = feedback
    assignment.save(update_fields=["status", "instructor_feedback"])
    Notification.objects.create(
        user=assignment.intern.user,
        type=Notification.Type.TASK_REVIEWED,
        message=(
            f"Your task “{assignment.task.title}” was "
            + (
                "reviewed."
                if new_status == TaskAssignment.Status.REVIEWED
                else "sent back for revision."
            )
        ),
    )

    return Response(
        {
            "success": True,
            "message": "Task reviewed.",
            "assignment": {
                "id": str(assignment.id),
                "status": assignment.status,
                "instructor_feedback": assignment.instructor_feedback,
            },
        }
    )


# ============================================================================
# INTERN VIEWS
# ============================================================================


@api_view(["GET"])
@permission_classes([IsIntern])
def intern_dashboard(request):
    """
    Returns everything the intern Overview page needs in one call:
    user info, placement progress, stats and
    upcoming on-site days.
    """
    user = request.user
    intern = user.intern_profile

    today = timezone.now().date()
    start = intern.school_start_date
    end = intern.school_end_date

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

    task_qs = TaskAssignment.objects.filter(intern=intern)
    tasks_pending = task_qs.filter(
        status__in=[
            TaskAssignment.Status.PENDING,
            TaskAssignment.Status.NEEDS_REVISION,
        ]
    ).count()
    tasks_completed = (
        task_qs.filter(status=TaskAssignment.Status.SUBMITTED).count()
        + task_qs.filter(status=TaskAssignment.Status.REVIEWED).count()
    )

    unread_messages = (
        Message.objects.filter(
            Q(conversation__initiator=user) | Q(conversation__recipient=user),
            is_read=False,
        )
        .exclude(sender=user)
        .count()
    )

    unread_conversations = (
        Conversation.objects.filter(
            Q(initiator=request.user) | Q(recipient=request.user),
        )
        .filter(
            Exists(
                Message.objects.filter(
                    conversation=OuterRef("pk"),
                    is_read=False,
                ).exclude(sender=request.user)
            )
        )
        .count()
    )

    unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

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

        # Rotation anchors to school_start_date.
        # If missing, we fall back to no rotation.
        anchor = start  # start = intern.school_start_date, already defined above

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
                "tasks_pending": tasks_pending,
                "tasks_completed": tasks_completed,
                "unread_messages": unread_messages,
                "unread_conversations": unread_conversations,
                "unread_notifications": unread_notifications,
            },
            "attendance": {
                "has_schedule": attendance_has_schedule,
                "upcoming_days": upcoming_days,
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsIntern])
def intern_own_profile(request):
    """Read-only view of the intern's own record (managed by admin)."""
    user = request.user
    intern = request.user.intern_profile
    instructor = intern.assigned_instructor
    return Response(
        {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "gender": getattr(user, "gender", "") or "",
            "profile_picture": (
                user.profile_picture.url
                if getattr(user, "profile_picture", None)
                else None
            ),
            "state_of_origin": intern.state_of_origin,
            "institution": intern.current_institution,
            "course": intern.course_of_study,
            "level": intern.current_level,
            "matric_number": intern.matric_number,
            "start_date": intern.school_start_date,
            "end_date": intern.school_end_date,
            "duration": (
                intern.other_duration
                if intern.internship_duration == "other"
                else intern.internship_duration
            ),
            "instructor_name": (instructor.user.get_full_name() if instructor else ""),
        }
    )


@api_view(["GET"])
@permission_classes([IsIntern])
def my_documents(request):
    """
    Returns all documents uploaded for the currently authenticated intern.
    """
    intern = request.user.intern_profile
    documents = intern.documents.all()

    serializer = InternDocumentSerializer(
        documents,
        many=True,
        context={"request": request},
    )

    return Response(
        {
            "count": documents.count(),
            "results": serializer.data,
        }
    )


@api_view(["GET"])
@permission_classes([IsIntern])
def my_schedule(request):
    intern = request.user.intern_profile
    schedules = intern.schedules.all()
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
    """
    Marks a task assignment as SUBMITTED. Optionally accepts a
    submission file (multipart/form-data with `submission_file` field).
    """
    try:
        assignment = TaskAssignment.objects.select_related(
            "intern__user", "task__instructor__user"
        ).get(pk=pk, intern=request.user.intern_profile)
    except TaskAssignment.DoesNotExist:
        return Response(
            {"error": "Task assignment not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if assignment.status not in (
        TaskAssignment.Status.PENDING,
        TaskAssignment.Status.NEEDS_REVISION,
    ):
        return Response(
            {"error": "This task was already submitted and can no longer be changed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Handle optional submission file
    submission_file = request.FILES.get("submission_file")
    if submission_file:
        assignment.submission_file = submission_file

    assignment.status = TaskAssignment.Status.SUBMITTED
    assignment.submitted_at = timezone.now()
    update_fields = ["status", "submitted_at"]
    if submission_file:
        update_fields.append("submission_file")
    assignment.save(update_fields=update_fields)

    Notification.objects.create(
        user=assignment.task.instructor.user,
        type=Notification.Type.TASK_SUBMITTED,
        message=f"{request.user.get_full_name()} submitted task: {assignment.task.title}",
    )

    return Response(
        {
            "success": True,
            "message": "Task submitted.",
            "assignment": {
                "id": str(assignment.id),
                "status": assignment.status,
                "submitted_at": assignment.submitted_at,
                "submission_file_url": (
                    assignment.submission_file.url
                    if assignment.submission_file
                    else None
                ),
            },
        }
    )


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
    updated = Notification.objects.filter(user=request.user, is_read=False).update(
        is_read=True
    )

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


# ─────────────────────────────────────────────────────────────
# MESSAGES — strict 1-to-1 chat
# Rules: intern -> own instructor + admins
#        instructor -> own interns + admins
#        admin -> anyone
# ─────────────────────────────────────────────────────────────


def _messageable_users(user: User) -> models.QuerySet:
    """Queryset of users this role is allowed to thread with."""
    if user.role == "ADMIN":
        return User.objects.exclude(pk=user.pk)

    if user.role == "INSTRUCTOR":
        intern_ids = User.objects.filter(
            intern_profile__assigned_instructor=user.instructor_profile
        ).values_list("pk", flat=True)
        return (
            User.objects.filter(models.Q(pk__in=intern_ids) | models.Q(role="ADMIN"))
            .exclude(pk=user.pk)
            .distinct()
        )

    # INTERN
    q = models.Q(role="ADMIN")
    intern = getattr(user, "intern_profile", None)
    if intern and getattr(intern, "assigned_instructor_id", None):
        q |= models.Q(pk=intern.assigned_instructor.user_id)

    return User.objects.filter(q).exclude(pk=user.pk).distinct()


def _get_own_conversation(user: User, pk: Any) -> Optional[Conversation]:
    return (
        Conversation.objects.filter(Q(pk=pk), Q(initiator=user) | Q(recipient=user))
        .select_related("initiator", "recipient")
        .first()
    )


def _send_chat_message(conv, sender, body):
    msg = Message.objects.create(conversation=conv, sender=sender, body=body)
    conv.save(update_fields=["updated_at"])  # bump thread to top of list
    Notification.objects.create(
        user=conv.other(sender),
        type=Notification.Type.MESSAGE_RECEIVED,
        message=f"{sender.get_full_name() or sender.email} sent you a message",
    )
    return msg


def _conversation_payload(conv, user, last=None, unread=None):
    other = conv.other(user)
    if last is None:
        last = conv.messages.order_by("-created_at").first()
    if unread is None:
        unread = conv.messages.filter(sender=other, is_read=False).count()
    return {
        "id": str(conv.id),
        "other_user": {
            "id": str(other.id),
            "first_name": other.first_name,
            "last_name": other.last_name,
            "role": other.role,
            "profile_picture": (
                other.profile_picture.url
                if getattr(other, "profile_picture", None)
                else None
            ),
        },
        "last_message": (
            {
                "body": last.body,
                "sender_id": str(last.sender_id),
                "created_at": last.created_at,
            }
            if last
            else None
        ),
        "unread_count": unread,
        "updated_at": conv.updated_at,
    }


@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def conversations(request):
    """GET = my threads (newest first). POST = get-or-create a thread
    with recipient_id, optionally sending initial_message."""
    if request.method == "POST":
        recipient_id = request.data.get("recipient_id")
        try:
            recipient = User.objects.get(pk=recipient_id)
        except (User.DoesNotExist, Exception):
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        if not _messageable_users(request.user).filter(pk=recipient.pk).exists():
            return Response(
                {"error": "You cannot message this user"},
                status=status.HTTP_403_FORBIDDEN,
            )
        conv = Conversation.objects.filter(
            Q(initiator=request.user, recipient=recipient)
            | Q(initiator=recipient, recipient=request.user)
        ).first()
        if conv is None:
            conv = Conversation.objects.create(
                initiator=request.user, recipient=recipient
            )
        body = (request.data.get("initial_message") or "").strip()
        if body:
            _send_chat_message(conv, request.user, body[:2000])
        return Response(
            _conversation_payload(conv, request.user),
            status=status.HTTP_201_CREATED,
        )

    convs = list(
        Conversation.objects.filter(
            Q(initiator=request.user) | Q(recipient=request.user)
        )
        .select_related("initiator", "recipient")
        .order_by("-updated_at")
    )
    ids = [c.pk for c in convs]

    # One query for newest message per thread (no N+1)
    last_by_conv = {}
    for m in Message.objects.filter(conversation_id__in=ids).order_by("-created_at"):
        last_by_conv.setdefault(m.conversation_id, m)

    # One query for unread counts per thread
    unread_map = {
        row["conversation_id"]: row["n"]
        for row in Message.objects.filter(conversation_id__in=ids, is_read=False)
        .exclude(sender=request.user)
        .values("conversation_id")
        .annotate(n=Count("id"))
    }

    return Response(
        [
            _conversation_payload(
                c,
                request.user,
                last=last_by_conv.get(c.pk),
                unread=unread_map.get(c.pk, 0),
            )
            for c in convs
        ]
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def conversation_thread(request, pk):
    """Full thread, oldest first. Opening it marks incoming messages read."""
    conv = _get_own_conversation(request.user, pk)
    if conv is None:
        return Response(
            {"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND
        )
    other = conv.other(request.user)
    conv.messages.filter(sender=other, is_read=False).update(is_read=True)
    messages = [
        {
            "id": str(m.id),
            "sender_id": str(m.sender_id),
            "body": m.body,
            "is_read": m.is_read,
            "created_at": m.created_at,
        }
        for m in conv.messages.all()
    ]
    return Response({**_conversation_payload(conv, request.user), "messages": messages})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def send_message(request, pk):
    conv = _get_own_conversation(request.user, pk)
    if conv is None:
        return Response(
            {"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND
        )
    body = (request.data.get("body") or "").strip()
    if not body:
        return Response(
            {"error": "Message body is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    if len(body) > 2000:
        return Response(
            {"error": "Message too long (max 2000 characters)"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    msg = _send_chat_message(conv, request.user, body)
    return Response(
        {
            "id": str(msg.id),
            "sender_id": str(msg.sender_id),
            "body": msg.body,
            "is_read": msg.is_read,
            "created_at": msg.created_at,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def messageable_users(request: Request) -> Response:
    """Returns the list of users the current user is allowed to message."""
    users = _messageable_users(request.user)
    data = [
        {
            "id": str(u.id),
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "profile_picture": (
                u.profile_picture.url if getattr(u, "profile_picture", None) else None
            ),
        }
        for u in users
    ]
    return Response(data)
