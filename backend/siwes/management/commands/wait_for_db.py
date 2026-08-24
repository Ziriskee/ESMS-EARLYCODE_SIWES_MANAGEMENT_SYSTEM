"""
Django management command: wait_for_db
Waits for PostgreSQL to be ready before running migrations.
Place in: backend/siwes/management/commands/wait_for_db.py
"""

import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Waits for PostgreSQL to be available"

    def handle(self, *args, **options):
        self.stdout.write("Waiting for database...")
        db_conn = None
        attempts = 0
        max_attempts = 30

        while not db_conn and attempts < max_attempts:
            try:
                db_conn = connections["default"]
                db_conn.cursor()
            except OperationalError:
                attempts += 1
                self.stdout.write(
                    f"Database unavailable, waiting 1 second... (attempt {attempts}/{max_attempts})"
                )
                time.sleep(1)

        if db_conn:
            self.stdout.write(self.style.SUCCESS("Database available!"))
        else:
            self.stdout.write(
                self.style.ERROR("Database connection failed after maximum attempts")
            )
            exit(1)
