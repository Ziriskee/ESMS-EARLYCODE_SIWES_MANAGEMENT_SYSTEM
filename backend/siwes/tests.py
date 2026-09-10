from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from siwes.models import (
    InternProfile,
    Notification,
    Task,
    TaskAssignment,
)
from siwes.permissions import IsInstructor
from siwes.views import assign_task_to_interns

from django.core.signing import TimestampSigner
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class MagicLinkCookieAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="cookie-auth@test.com",
            email="cookie-auth@test.com",
            role="INTERN",
        )
        self.user.set_unusable_password()
        self.user.save()

        self.signer = TimestampSigner()

    def test_magic_link_sets_httponly_cookie_and_me_works(self):
        token = self.signer.sign(self.user.email)

        response = self.client.get(f"/api/auth/verify-magic-link/?token={token}")

        self.assertEqual(response.status_code, 200)

        # Cookie must exist
        self.assertIn("siwes_access", response.cookies)

        # Cookie must be httpOnly
        cookie = response.cookies["siwes_access"]
        self.assertTrue(cookie["httponly"])

        # Cookie should be automatically sent on next request
        me_response = self.client.get("/api/auth/me/")

        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.data["email"], self.user.email)

    def test_logout_clears_cookie(self):
        token = self.signer.sign(self.user.email)

        login_response = self.client.get(f"/api/auth/verify-magic-link/?token={token}")

        self.assertEqual(login_response.status_code, 200)

        logout_response = self.client.post("/api/auth/logout/")

        self.assertEqual(logout_response.status_code, 200)

        # After logout, /me/ should no longer work
        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, 401)


class AssignTaskToInternsRegressionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.instructor_user = Mock()
        self.instructor_user.is_authenticated = True
        self.instructor_user.is_instructor = True
        self.instructor_user.role = "INSTRUCTOR"
        self.instructor_user.instructorprofile = Mock()

        self.task = Mock()
        self.task.title = "Test Task"

        self.intern = Mock()
        self.intern.user = Mock()

    @patch.object(Notification.objects, "create")
    @patch.object(TaskAssignment.objects, "create")
    @patch.object(TaskAssignment.objects, "get_or_create")
    @patch.object(InternProfile.objects, "get")
    @patch.object(Task.objects, "get")
    @patch.object(IsInstructor, "has_permission", return_value=True)
    def test_assign_task_uses_get_or_create_and_returns_real_count(
        self,
        mock_permission,
        mock_task_get,
        mock_intern_get,
        mock_get_or_create,
        mock_old_create,
        mock_notification_create,
    ):
        mock_task_get.return_value = self.task
        mock_intern_get.return_value = self.intern
        mock_get_or_create.return_value = (Mock(), True)

        request = self.factory.post(
            "/",
            {"intern_ids": ["11111111-1111-1111-1111-111111111111"]},
            format="json",
        )

        force_authenticate(request, user=self.instructor_user)

        response = assign_task_to_interns(request, pk="task-id")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["assigned_count"], 1)
        self.assertEqual(response.data["skipped_count"], 0)

        mock_task_get.assert_called_once_with(
            pk="task-id",
            instructor=self.instructor_user.instructorprofile,
        )

        mock_intern_get.assert_called_once_with(
            pk="11111111-1111-1111-1111-111111111111",
            assigned_instructor=self.instructor_user.instructorprofile,
        )

        mock_get_or_create.assert_called_once_with(
            task=self.task,
            intern=self.intern,
        )

        mock_old_create.assert_not_called()
        mock_notification_create.assert_called_once()

    @patch.object(Notification.objects, "create")
    @patch.object(TaskAssignment.objects, "create")
    @patch.object(TaskAssignment.objects, "get_or_create")
    @patch.object(InternProfile.objects, "get")
    @patch.object(Task.objects, "get")
    @patch.object(IsInstructor, "has_permission", return_value=True)
    def test_duplicate_assignment_is_skipped_and_not_notified(
        self,
        mock_permission,
        mock_task_get,
        mock_intern_get,
        mock_get_or_create,
        mock_old_create,
        mock_notification_create,
    ):
        mock_task_get.return_value = self.task
        mock_intern_get.return_value = self.intern

        # False means the assignment already existed
        mock_get_or_create.return_value = (Mock(), False)

        request = self.factory.post(
            "/",
            {"intern_ids": ["11111111-1111-1111-1111-111111111111"]},
            format="json",
        )

        force_authenticate(request, user=self.instructor_user)

        response = assign_task_to_interns(request, pk="task-id")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["assigned_count"], 0)
        self.assertEqual(response.data["skipped_count"], 1)

        mock_old_create.assert_not_called()
        mock_notification_create.assert_not_called()
