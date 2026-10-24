import requests
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings


class ResendAPIBackend(BaseEmailBackend):
    """
    Custom email backend that uses Resend's REST API instead of SMTP.
    This bypasses Render's free-tier outbound SMTP port blocks (465/587).
    """

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        api_key = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        from_email = getattr(
            settings, "DEFAULT_FROM_EMAIL", "SIWES EarlyCode <onboarding@resend.dev>"
        )

        sent_count = 0
        for message in email_messages:
            try:
                # Extract HTML content if it's a multipart message, otherwise use plain text
                html_content = message.body
                if hasattr(message, "alternatives") and message.alternatives:
                    for content, mimetype in message.alternatives:
                        if mimetype == "text/html":
                            html_content = content
                            break

                response = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": from_email,
                        "to": message.to,
                        "subject": message.subject,
                        "html": html_content,
                    },
                    timeout=10,
                )
                response.raise_for_status()
                sent_count += 1
            except Exception as e:
                if not self.fail_silently:
                    raise
        return sent_count
