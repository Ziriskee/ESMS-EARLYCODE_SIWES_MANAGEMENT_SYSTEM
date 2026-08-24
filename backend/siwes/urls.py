"""
SIWES App URL Routes
All API endpoints mapped to their views.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # ─── AUTH ───────────────────────────────────────────────
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", views.InternRegisterView.as_view(), name="intern-register"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    # ─── ADMIN ──────────────────────────────────────────────
    path(
        "admin/dashboard/", views.AdminDashboardView.as_view(), name="admin-dashboard"
    ),
    path(
        "admin/interns/",
        views.AdminInternListCreateView.as_view(),
        name="admin-intern-list",
    ),
    path(
        "admin/interns/<uuid:pk>/",
        views.AdminInternDetailView.as_view(),
        name="admin-intern-detail",
    ),
    path(
        "admin/interns/<uuid:pk>/assign-instructor/",
        views.AssignInstructorView.as_view(),
        name="assign-instructor",
    ),
    path(
        "admin/interns/<uuid:pk>/set-dates/",
        views.SetInternDatesView.as_view(),
        name="set-intern-dates",
    ),
    path(
        "admin/instructors/",
        views.AdminInstructorListCreateView.as_view(),
        name="admin-instructor-list",
    ),
    path(
        "admin/instructors/<uuid:pk>/",
        views.AdminInstructorDetailView.as_view(),
        name="admin-instructor-detail",
    ),
    path("admin/reports/", views.AdminReportListView.as_view(), name="admin-reports"),
    path(
        "admin/messages/broadcast/",
        views.BroadcastMessageView.as_view(),
        name="broadcast-message",
    ),
    # ─── INSTRUCTOR ─────────────────────────────────────────
    path(
        "instructor/dashboard/",
        views.InstructorDashboardView.as_view(),
        name="instructor-dashboard",
    ),
    path(
        "instructor/interns/",
        views.InstructorInternListView.as_view(),
        name="instructor-interns",
    ),
    path(
        "instructor/tasks/",
        views.InstructorTaskListCreateView.as_view(),
        name="instructor-tasks",
    ),
    path(
        "instructor/tasks/<uuid:pk>/",
        views.InstructorTaskDetailView.as_view(),
        name="instructor-task-detail",
    ),
    path(
        "instructor/tasks/<uuid:pk>/assign/",
        views.AssignTaskToInternsView.as_view(),
        name="assign-task",
    ),
    path(
        "instructor/reports/",
        views.InstructorReportListView.as_view(),
        name="instructor-reports",
    ),
    path(
        "instructor/reports/<uuid:pk>/",
        views.InstructorReportDetailView.as_view(),
        name="instructor-report-detail",
    ),
    # ─── INTERN ─────────────────────────────────────────────
    path(
        "intern/dashboard/",
        views.InternDashboardView.as_view(),
        name="intern-dashboard",
    ),
    path(
        "intern/schedule/", views.InternScheduleView.as_view(), name="intern-schedule"
    ),
    path("intern/tasks/", views.InternTaskListView.as_view(), name="intern-tasks"),
    path(
        "intern/tasks/<uuid:pk>/submit/",
        views.SubmitTaskView.as_view(),
        name="submit-task",
    ),
    path(
        "intern/reports/",
        views.InternReportListCreateView.as_view(),
        name="intern-reports",
    ),
    path(
        "intern/reports/<uuid:pk>/",
        views.InternReportDetailView.as_view(),
        name="intern-report-detail",
    ),
    path("intern/profile/", views.InternProfileView.as_view(), name="intern-profile"),
    # ─── SHARED ─────────────────────────────────────────────
    path("notifications/", views.NotificationListView.as_view(), name="notifications"),
    path(
        "notifications/<uuid:pk>/read/",
        views.MarkNotificationReadView.as_view(),
        name="mark-notification-read",
    ),
    path("courses/", views.CourseListView.as_view(), name="courses"),
    path("messages/", views.MessageListCreateView.as_view(), name="messages"),
]
