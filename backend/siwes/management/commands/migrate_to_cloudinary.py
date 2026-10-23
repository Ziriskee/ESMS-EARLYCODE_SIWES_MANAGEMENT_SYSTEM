import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from cloudinary_storage.storage import RawMediaCloudinaryStorage


class Command(BaseCommand):
    help = "Migrates local media files to Cloudinary. Run while USE_CLOUDINARY=false."

    def handle(self, *args, **options):
        # ── Safety checks ──────────────────────────────────────
        if getattr(settings, "USE_CLOUDINARY", False):
            self.stdout.write(
                self.style.ERROR(
                    "ABORT: USE_CLOUDINARY is True. "
                    "Set USE_CLOUDINARY=false in .env, restart Django, and re-run."
                )
            )
            return

        cloud_name = settings.CLOUDINARY_STORAGE.get("CLOUD_NAME")
        if not cloud_name:
            self.stdout.write(
                self.style.ERROR("ABORT: CLOUDINARY_CLOUD_NAME is empty. Check .env.")
            )
            return

        # ── Pre-flight: prove Cloudinary accepts uploads ───────
        self.stdout.write("Pre-flight: testing Cloudinary connectivity...")
        storage = RawMediaCloudinaryStorage()
        try:
            test_name = storage.save(
                "_migration_test.txt",
                ContentFile(b"connectivity test", name="_migration_test.txt"),
            )
            storage.delete(test_name)
            self.stdout.write(
                self.style.SUCCESS(
                    f"  OK — Cloudinary reachable (test file: {test_name})"
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  FAIL — {e}"))
            self.stdout.write(
                self.style.ERROR("Fix network/credentials before retrying.")
            )
            return

        # ── Models to scan ─────────────────────────────────────
        from siwes.models import (
            User,
            InternProfile,
            InternDocument,
            TaskAttachment,
            TaskAssignment,
        )

        targets = [
            (InternDocument, "file"),
            (TaskAttachment, "file"),
            (TaskAssignment, "submission_file"),
            (User, "profile_picture"),
            (InternProfile, "it_letter"),
        ]

        migrated = 0
        skipped = 0
        missing = 0

        for model, field_name in targets:
            self.stdout.write(f"\n── {model.__name__}.{field_name} ──")
            qs = model.objects.exclude(**{f"{field_name}": ""}).exclude(
                **{f"{field_name}__isnull": True}
            )

            for instance in qs:
                file_field = getattr(instance, field_name)
                if not file_field:
                    continue

                name = file_field.name

                # Already a URL → already on Cloudinary
                if name.startswith("http://") or name.startswith("https://"):
                    self.stdout.write(f"  SKIP (URL): {name[:70]}")
                    skipped += 1
                    continue

                # Try to resolve local path
                try:
                    local_path = file_field.path
                except (NotImplementedError, ValueError):
                    self.stdout.write(f"  SKIP (no local path): {name}")
                    skipped += 1
                    continue

                if not os.path.exists(local_path):
                    self.stdout.write(
                        self.style.WARNING(f"  MISSING on disk: {local_path}")
                    )
                    missing += 1
                    continue

                # Upload via the storage backend (handles resource_type, public_id, etc.)
                try:
                    with open(local_path, "rb") as f:
                        content = f.read()
                    new_name = storage.save(
                        name, ContentFile(content, name=os.path.basename(name))
                    )

                    setattr(instance, field_name, new_name)
                    instance.save(update_fields=[field_name])

                    migrated += 1
                    self.stdout.write(self.style.SUCCESS(f"  OK: {name} → {new_name}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  FAIL: {name} — {e}"))

        # ── Summary ────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"DONE. Migrated: {migrated} | Skipped (already cloud): {skipped} | Missing on disk: {missing}"
            )
        )
        if migrated > 0:
            self.stdout.write(
                self.style.WARNING(
                    "NEXT STEP: set USE_CLOUDINARY=true in .env and restart Django."
                )
            )
