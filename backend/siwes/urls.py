from django.urls import path
from . import views
from .views import logout

urlpatterns = [
    # Auth & Magic Links
    path("auth/register/", views.InternRegisterView.as_view(), name="intern-register"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path(
        "auth/request-magic-link/", views.request_magic_link, name="request-magic-link"
    ),
    path("auth/verify-magic-link/", views.verify_magic_link, name="verify-magic-link"),
    path("auth/logout/", logout, name="logout"),
    # Admin
    path("admin/dashboard/", views.admin_dashboard, name="admin-dashboard"),
    path(
        "admin/interns/",
        views.AdminInternListCreateView.as_view(),
        name="admin-interns",
    ),
    path(
        "admin/interns/<uuid:pk>/",
        views.AdminInternDetailView.as_view(),
        name="admin-intern-detail",
    ),
    path(
        "admin/interns/<uuid:pk>/assign-instructor/",
        views.assign_instructor,
        name="assign-instructor",
    ),
    path(
        "admin/interns/<uuid:pk>/set-dates/",
        views.set_intern_dates,
        name="set-intern-dates",
    ),
    path(
        "admin/instructors/",
        views.AdminInstructorListCreateView.as_view(),
        name="admin-instructors",
    ),
    path(
        "admin/instructors/<uuid:pk>/",
        views.AdminInstructorDetailView.as_view(),
        name="admin-instructor-detail",
    ),
    path(
        "admin/schedules/",
        views.AdminScheduleListCreateView.as_view(),
        name="admin-schedules",
    ),
    path("admin/reports/", views.AdminReportListView.as_view(), name="admin-reports"),
    path(
        "admin/messages/broadcast/", views.broadcast_message, name="broadcast-message"
    ),
    # Instructor
    path(
        "instructor/dashboard/", views.instructor_dashboard, name="instructor-dashboard"
    ),
    path("instructor/interns/", views.my_interns, name="my-interns"),
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
        views.assign_task_to_interns,
        name="assign-task",
    ),
    path("instructor/reports/", views.instructor_reports, name="instructor-reports"),
    path("instructor/reports/<uuid:pk>/", views.review_report, name="review-report"),
    # Intern
    path("intern/dashboard/", views.intern_dashboard, name="intern-dashboard"),
    path("intern/schedule/", views.my_schedule, name="my-schedule"),
    path("intern/tasks/", views.my_tasks, name="my-tasks"),
    path("intern/tasks/<uuid:pk>/submit/", views.submit_task, name="submit-task"),
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
    # Shared
    path("notifications/", views.NotificationListView.as_view(), name="notifications"),
    path(
        "notifications/mark-all-read/",
        views.mark_all_notifications_read,
        name="mark-all-notifications-read",
    ),
    path(
        "notifications/<uuid:pk>/read/",
        views.mark_notification_read,
        name="mark-notification-read",
    ),
    path("courses/", views.CourseListView.as_view(), name="courses"),
    path("messages/", views.MessageListCreateView.as_view(), name="messages"),
]
