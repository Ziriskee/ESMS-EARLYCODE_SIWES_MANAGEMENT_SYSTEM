"""
SIWES Management System — Custom Permission Classes
Enforces role-based access control on every API endpoint.
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Only admins can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsInstructor(permissions.BasePermission):
    """Only instructors can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_instructor


class IsIntern(permissions.BasePermission):
    """Only interns can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_intern


class CanMessageRecipient(permissions.BasePermission):
    """
    Interns can only message their assigned instructor or admin.
    Instructors can message their assigned interns or admin.
    Admins can message anyone.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_admin:
            return True
        return True  # Further checks in view

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        if request.user.is_instructor:
            # Instructor can message their interns or admin
            return (
                obj.recipient.is_intern
                and obj.recipient.intern_profile.assigned_instructor.user
                == request.user
            )
        if request.user.is_intern:
            # Intern can message their instructor or admin
            return (
                obj.recipient.is_instructor
                and obj.recipient
                == request.user.intern_profile.assigned_instructor.user
            )
        return False
