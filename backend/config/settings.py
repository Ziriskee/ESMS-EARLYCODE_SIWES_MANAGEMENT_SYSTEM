"""
Django settings for config project.
Django 5.x / 6.x compatible.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv
from pathlib import Path as _Path

_BACKEND_DIR = _Path(__file__).resolve().parent.parent  # backend/
load_dotenv(_BACKEND_DIR / ".env")  # backend/.env, if it ever exists
load_dotenv(_BACKEND_DIR.parent / ".env")  # project-root .env (your current location)

USE_CLOUDINARY = os.environ.get("USE_CLOUDINARY", "true").lower() == "true"


BASE_DIR = Path(__file__).resolve().parent.parent

# ═══════════════════════════════════════════════════════════════
# 1. SECURITY (CHANGE THESE FOR PRODUCTION)
# ═══════════════════════════════════════════════════════════════

# Get from environment variable, fallback to dev key
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me-in-production")

# True in development, False in production
DEBUG = os.environ.get("DEBUG", "True").lower() == "true"

# Who can access your site
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# ═══════════════════════════════════════════════════════════════
# 2. APPLICATIONS
# ═══════════════════════════════════════════════════════════════

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",
    # Your app
    "siwes",
]

# ═══════════════════════════════════════════════════════════════
# 3. MIDDLEWARE
# ═══════════════════════════════════════════════════════════════

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ← MUST be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ═══════════════════════════════════════════════════════════════
# 4. URLS & TEMPLATES
# ═══════════════════════════════════════════════════════════════

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ═══════════════════════════════════════════════════════════════
# 5. DATABASE (PostgreSQL)
# ═══════════════════════════════════════════════════════════════

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get(
            "DATABASE_URL", "postgres://siwes_user:123456@localhost:5432/siwes_db"
        )
    )
}

# ═══════════════════════════════════════════════════════════════
# 6. PASSWORD VALIDATION
# ═══════════════════════════════════════════════════════════════

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ═══════════════════════════════════════════════════════════════
# 7. INTERNATIONALIZATION
# ═══════════════════════════════════════════════════════════════

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Lagos"  # ← Changed to Nigeria time
USE_I18N = True
USE_TZ = True

# ═══════════════════════════════════════════════════════════════
# 8. STATIC & MEDIA FILES
# ═══════════════════════════════════════════════════════════════

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── Cloudinary media storage ─────────────────────────────────
# All FileField/ImageField uploads (documents, task attachments,
# profile pictures) go to Cloudinary instead of local disk.
# Django 6.x resolves file storage ONLY from STORAGES.
# (DEFAULT_FILE_STORAGE was removed in Django 5.1 and is ignored.)
# Replace the STORAGES block with:
STORAGES = {
    "default": {
        "BACKEND": (
            "cloudinary_storage.storage.MediaCloudinaryStorage"
            if USE_CLOUDINARY
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": "drzzwy76",
    "API_KEY": "598266562319256",
    "API_SECRET": "G6wNshCmupTmWlL6Ck_UJKxPbQg",
    "RESOURCE_TYPE": "auto",
}

# ═══════════════════════════════════════════════════════════════
# 9. AUTH & REST FRAMEWORK
# ═══════════════════════════════════════════════════════════════

AUTH_USER_MODEL = "siwes.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "siwes.authentication.CookieJWTAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# Magic link login token lifetime
MAGIC_LINK_MAX_AGE = 60 * 120  # 2 hours in seconds

# Session cookie settings
ACCESS_COOKIE_NAME = "siwes_access"
SESSION_COOKIE_MAX_AGE = 60 * 60 * 18  # 18 hours in seconds

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(seconds=SESSION_COOKIE_MAX_AGE),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
}

# ═══════════════════════════════════════════════════════════════
# 10. CORS (React frontend access)
# ═══════════════════════════════════════════════════════════════

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
]

CORS_ALLOW_CREDENTIALS = True


CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",  # ← ADD THIS
    "http://127.0.0.1:4173",  # ← ADD THIS
]

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

# Development: prints emails to console (terminal)
if DEBUG:
    # locmem stores emails in memory (django.core.mail.outbox) without
    # printing. The 🟢 dev link in request_magic_link is the only console
    # output you'll see — which is the working link for manual testing.
    EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@earlycode.local"
FRONTEND_URL = "http://localhost:5173"

# Production: uncomment and fill in your SMTP details
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'  # or your SMTP server
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'your-email@gmail.com'
# EMAIL_HOST_PASSWORD = 'your-app-password'
# DEFAULT_FROM_EMAIL = 'EarlyCode SIWES <noreply@earlycode.com>'


# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"  # Prevents clickjacking

# Cookie Security (Crucial for our HttpOnly JWT)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# HSTS (Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
