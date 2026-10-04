from rest_framework.throttling import AnonRateThrottle


class MagicLinkThrottle(AnonRateThrottle):
    rate = "5/minute"  # Max 5 emails per minute per IP


class RegisterThrottle(AnonRateThrottle):
    rate = "3/hour"  # Max 3 registrations per hour per IP
