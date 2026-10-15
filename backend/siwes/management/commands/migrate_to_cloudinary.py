import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings


class Command(BaseCommand):
    help = (
        "Migrates local media files to Cloudinary. Run this while USE_CLOUDINARY=false."
    )

    def handle(self, *args, **options):
        if getattr(settings, "USE_CLOUDINARY", False):
            self.stdout.write(
                self.style.ERROR(
                    "Abort: USE_CLOUDINARY is currently True. "
                    "Set USE_CLOUDINARY=false in your .env, restart Django, and run this again."
                )
            )
            return

        # Import here to ensure settings are fully loaded
        from cloudinary_storage.storage import RawMediaCloudinaryStorage
        from siwes.models import (
            User,
            InternProfile,
            InternDocument,
            TaskAttachment,
            TaskAssignment,
        )

        cloudinary_storage = RawMediaCloudinaryStorage()

        models_and_fields = [
            (User, "profile_picture"),
            (InternProfile, "it_letter"),
            (InternDocument, "file"),
            (TaskAttachment, "file"),
            (TaskAssignment, "submission_file"),
        ]

        total_migrated = 0

        for model, field_name in models_and_fields:
            self.stdout.write(f"Scanning {model.__name__}.{field_name}...")
            queryset = model.objects.exclude(**{f"{field_name}": ""}).exclude(
                **{f"{field_name}__isnull": True}
            )

            for instance in queryset:
                file_field = getattr(instance, field_name)
                if not file_field:
                    continue

                try:
                    local_path = file_field.path
                except NotImplementedError:
                    # Already on cloud or unsupported storage
                    continue

                if not os.path.exists(local_path):
                    self.stdout.write(
                        self.style.WARNING(f"  Missing local file: {local_path}")
                    )
                    continue

                try:
                    with open(local_path, "rb") as f:
                        content = f.read()

                    # Upload to Cloudinary
                    cloudinary_name = cloudinary_storage.save(
                        file_field.name, ContentFile(content)
                    )

                    # Update the instance with the new name if Cloudinary altered the path
                    if cloudinary_name != file_field.name:
                        setattr(instance, field_name, cloudinary_name)
                        instance.save(update_fields=[field_name])

                    total_migrated += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"  Uploaded: {file_field.name}")
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"  Failed {file_field.name}: {e}")
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Uploaded {total_migrated} files to Cloudinary."
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "Next step: Flip USE_CLOUDINARY=true in your .env and restart Django."
            )
        )
