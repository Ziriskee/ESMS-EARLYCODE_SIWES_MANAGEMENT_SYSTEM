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
    # TEMPORARY: One-time admin creation
    path("temp-create-admin/", views.temp_create_admin, name="temp-create-admin"),
    # Admin
    path("admin/dashboard/", views.admin_dashboard, name="admin-dashboard"),
    path("admin/profile/", views.admin_own_profile, name="admin-own-profile"),
    path(
        "admin/interns/pending/",
        views.admin_pending_interns,
        name="admin-pending-interns",
    ),
    path(
        "admin/interns/<pk>/documents/generate/",
        views.generate_intern_documents,
        name="generate-intern-documents",
    ),
    path(
        "admin/interns/<pk>/submission/",
        views.admin_intern_submission,
        name="admin-intern-submission",
    ),
    path(
        "admin/interns/<pk>/accept/",
        views.admin_accept_intern,
        name="admin-accept-intern",
    ),
    path(
        "admin/interns/<pk>/reject/",
        views.admin_reject_intern,
        name="admin-reject-intern",
    ),
    path(
        "admin/interns/<pk>/configure/",
        views.admin_configure_intern,
        name="admin-configure-intern",
    ),
    path(
        "admin/interns/<pk>/documents/",
        views.admin_upload_documents,
        name="admin-upload-documents",
    ),
    # Instructor routes — literal suffixes first, then detail
    path(
        "admin/instructors/",
        views.AdminInstructorListView.as_view(),
        name="admin-instructors",
    ),
    path(
        "admin/instructors/create/",
        views.admin_create_instructor,
        name="admin-create-instructor",
    ),
    path(
        "admin/instructors/<uuid:pk>/deactivate/",
        views.admin_deactivate_instructor,
        name="admin-deactivate-instructor",
    ),
    path(
        "admin/instructors/<uuid:pk>/reactivate/",
        views.admin_reactivate_instructor,
        name="admin-reactivate-instructor",
    ),
    path(
        "admin/instructors/<uuid:pk>/remove/",
        views.admin_remove_instructor,
        name="admin-remove-instructor",
    ),
    path(
        "admin/instructors/<uuid:pk>/",
        views.AdminInstructorDetailView.as_view(),
        name="admin-instructor-detail",
    ),
    path(
        "admin/interns/",
        views.AdminInternListCreateView.as_view(),
        name="admin-interns",
    ),
    path(
        "admin/interns/<pk>/",
        views.AdminInternDetailView.as_view(),
        name="admin-intern-detail",
    ),
    path(
        "admin/interns/<pk>/assign-instructor/",
        views.assign_instructor,
        name="assign-instructor",
    ),
    path(
        "admin/interns/<pk>/set-dates/",
        views.set_intern_dates,
        name="set-intern-dates",
    ),
    path(
        "admin/schedules/",
        views.AdminScheduleListCreateView.as_view(),
        name="admin-schedules",
    ),
    # Instructor
    path(
        "instructor/dashboard/", views.instructor_dashboard, name="instructor-dashboard"
    ),
    path("instructor/interns/", views.my_interns, name="my-interns"),
    path(
        "instructor/interns/<pk>/",
        views.instructor_intern_detail,
        name="instructor-intern-detail",
    ),
    path(
        "instructor/profile/",
        views.instructor_profile,
        name="instructor-profile",
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
        views.assign_task_to_interns,
        name="assign-task",
    ),
    path(
        "instructor/tasks/<uuid:pk>/attachments/",
        views.upload_task_attachments,
        name="upload-task-attachments",
    ),
    path(
        "instructor/assignments/<int:pk>/review/",
        views.review_task_assignment,
        name="review-task-assignment",
    ),
    # Intern
    path("intern/dashboard/", views.intern_dashboard, name="intern-dashboard"),
    path("intern/profile/", views.intern_own_profile, name="intern-own-profile"),
    path("intern/documents/", views.my_documents, name="my-documents"),
    path("intern/schedule/", views.my_schedule, name="my-schedule"),
    path("intern/tasks/", views.my_tasks, name="my-tasks"),
    path("intern/tasks/<int:pk>/submit/", views.submit_task, name="submit-task"),
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
    path("messages/users/", views.messageable_users, name="messageable-users"),
    path("messages/conversations/", views.conversations, name="conversations"),
    path(
        "messages/conversations/<uuid:pk>/",
        views.conversation_thread,
        name="conversation-thread",
    ),
    path(
        "messages/conversations/<uuid:pk>/messages/",
        views.send_message,
        name="send-message",
    ),
]
