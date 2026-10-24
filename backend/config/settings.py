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
load_dotenv(_BACKEND_DIR / ".env", override=True)
load_dotenv(_BACKEND_DIR.parent / ".env", override=True)

print(f"🚨 DEBUG CHECK: LOG_MAGIC_LINKS = {os.environ.get('LOG_MAGIC_LINKS')}")
print(f"🚨 DEBUG CHECK: DEBUG = {os.environ.get('DEBUG')}" )

BASE_DIR = Path(__file__).resolve().parent.parent

# ═══════════════════════════════════════════════════════════════
# 1. SECURITY (CHANGE THESE FOR PRODUCTION)
# ═══════════════════════════════════════════════════════════════

# Fail-closed security: require explicit env vars in production
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    if os.environ.get("DEBUG", "True").lower() == "true":
        SECRET_KEY = "dev-secret-key-change-me-in-production"
    else:
        raise ValueError(
            "SECRET_KEY environment variable is strictly required in production"
        )

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
    "csp",
    # Your app
    "siwes",
]

# ═══════════════════════════════════════════════════════════════
# 3. MIDDLEWARE
# ═══════════════════════════════════════════════════════════════

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ← MUST be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # ← ADD (after SecurityMiddleware)
    "csp.middleware.CSPMiddleware",
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

# ── Cloudinary & Static media storage ────────────────────────
# Django 6.x resolves file storage ONLY from STORAGES.
USE_CLOUDINARY = os.environ.get("USE_CLOUDINARY", "false").lower() == "true"

STORAGES = {
    "default": {
        "BACKEND": (
            "cloudinary_storage.storage.RawMediaCloudinaryStorage"
            if USE_CLOUDINARY
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    "API_KEY": os.environ.get("CLOUDINARY_API_KEY", ""),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET", ""),
    "RESOURCE_TYPE": "raw",  # Allow all file types (images, docs, etc.)
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
    origin.strip()
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
]

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================
# Gmail SMTP — works in both dev and production.
# Credentials read from environment variables (set in .env).
# Use Resend REST API to bypass Render's free-tier SMTP port blocks
EMAIL_BACKEND = "siwes.resend_backend.ResendAPIBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "False").lower() == "true"
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_TIMEOUT = 10  # Fail fast to prevent Gunicorn SIGKILL
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL", "SIWES EarlyCode <noreply@localhost>"
)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# Development shortcut: set EMAIL_BACKEND=locmem in .env to go back to
# console-only mode without touching this file.
if os.environ.get("EMAIL_BACKEND", "").lower() == "locmem":
    EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"  # Prevents clickjacking
SECURE_SSL_REDIRECT = not DEBUG  # Force HTTPS in production
SECURE_CROSS_ORIGIN_OPENER_POLICY = (
    "same-origin"  # Prevents cross-origin window manipulation
)
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"  # Prevents leaking full URLs

# Cookie Security (Crucial for our HttpOnly JWT)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# HSTS (Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# ============================================================================
# CONTENT SECURITY POLICY (CSP)
# ============================================================================
# Updated to django-csp >= 4.0 format
CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ("'self'",),
        "script-src": ("'self'", "'unsafe-inline'"),
        "style-src": ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com"),
        "img-src": ("'self'", "data:", "https:"),
        "font-src": ("'self'", "https://fonts.gstatic.com"),
        "connect-src": ("'self'",),
        "frame-ancestors": ("'none'",),
    }
}


# ============================================================================
# LOGGING
# ============================================================================
# Django ships no LOGGING dict by default, which silently drops app-level
# logger.info / logger.debug. This wires the siwes logger to the console so
# backend diagnostics actually appear in the runserver terminal.
#
# LOG_MAGIC_LINKS=True  -> DEBUG level, full token diagnostics (DEV ONLY)
# LOG_MAGIC_LINKS=False -> WARNING level, no tokens anywhere (PRODUCTION)
LOG_MAGIC_LINKS = os.environ.get("LOG_MAGIC_LINKS", "false").lower() == "true"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "[{levelname}] {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "siwes": {
            "handlers": ["console"],
            "level": "DEBUG" if LOG_MAGIC_LINKS else "WARNING",
            "propagate": False,
        },
    },
}


print(
    f"--- DEBUG={DEBUG} | SSL_REDIRECT={SECURE_SSL_REDIRECT} | CORS={CORS_ALLOWED_ORIGINS}"
)
