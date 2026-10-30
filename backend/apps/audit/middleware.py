import logging
import time

from .services import client_ip

logger = logging.getLogger('bikeerp.requests')

SKIP_PREFIXES = ('/static/', '/api/schema', '/api/docs', '/api/redoc', '/admin/jsi18n')


class RequestLogMiddleware:
    """Writes every /api/ call to logs/requests.log and the RequestLog table."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started = time.perf_counter()
        response = self.get_response(request)
        path = request.path
        if not path.startswith('/api/') or path.startswith(SKIP_PREFIXES) or request.method == 'OPTIONS':
            return response

        duration_ms = int((time.perf_counter() - started) * 1000)
        user = getattr(request, 'user', None)
        user = user if user is not None and user.is_authenticated else None
        tenant = getattr(request, 'tenant', None)
        logger.info('%s %s %s %dms user=%s tenant=%s', request.method, path, response.status_code, duration_ms,
                    user.email if user else '-', tenant.slug if tenant else '-')
        try:
            from .models import RequestLog

            RequestLog.objects.create(
                tenant=tenant, user=user, method=request.method, path=path[:255],
                status_code=response.status_code, duration_ms=duration_ms, ip_address=client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:255],
            )
        except Exception:  # logging must never break the response
            logging.getLogger('bikeerp').exception('failed to persist request log')
        return response
