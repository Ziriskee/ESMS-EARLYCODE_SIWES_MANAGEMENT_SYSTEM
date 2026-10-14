"""
One-time deadline reminders for pending task assignments.
Idempotent: each assignment gets at most one DUE_SOON and one OVERDUE
notification, tracked by boolean flags on the row.
Run daily (Task Scheduler / cron):  python manage.py task_reminders
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from siwes.models import Notification, TaskAssignment

DUE_SOON_WINDOW = timedelta(hours=48)


class Command(BaseCommand):
    help = "Sends one-time 'due soon' and 'overdue' reminders for pending tasks."

    def handle(self, *args, **options):
        now = timezone.now()
        sent = 0

        due_soon = TaskAssignment.objects.filter(
            status=TaskAssignment.Status.PENDING,
            due_soon_notified=False,
            task__due_date__isnull=False,
            task__due_date__gt=now,
            task__due_date__lte=now + DUE_SOON_WINDOW,
        ).select_related("task", "intern__user")
        for a in due_soon:
            Notification.objects.create(
                user=a.intern.user,
                type=Notification.Type.TASK_DUE_SOON,
                message=(
                    f"Task “{a.task.title}” is due soon "
                    f"({a.task.due_date:%b %d, %H:%M})."
                ),
            )
            a.due_soon_notified = True
            a.save(update_fields=["due_soon_notified"])
            sent += 1

        overdue = TaskAssignment.objects.filter(
            status=TaskAssignment.Status.PENDING,
            overdue_notified=False,
            task__due_date__isnull=False,
            task__due_date__lt=now,
        ).select_related("task", "intern__user")
        for a in overdue:
            Notification.objects.create(
                user=a.intern.user,
                type=Notification.Type.TASK_OVERDUE,
                message=(
                    f"Task “{a.task.title}” is overdue. "
                    "Submit it as soon as possible."
                ),
            )
            a.overdue_notified = True
            a.save(update_fields=["overdue_notified"])
            sent += 1

        self.stdout.write(self.style.SUCCESS(f"Reminders sent: {sent}"))
