import json
import logging

from django.core.serializers.json import DjangoJSONEncoder
from django.utils import timezone

logger = logging.getLogger('bikeerp.audit')


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')


def _json_safe(value):
    return None if value is None else json.loads(json.dumps(value, cls=DjangoJSONEncoder))


def record_audit(request, action, entity_type, entity_id, old_value=None, new_value=None):
    from .models import AuditLog

    user = getattr(request, 'user', None)
    authenticated = bool(user and user.is_authenticated)
    entry = AuditLog.objects.create(
        tenant=getattr(request, 'tenant', None),
        user=user if authenticated else None,
        user_name=(user.name or user.email) if authenticated else 'System',
        user_role=user.role if authenticated else 'System',
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id or ''),
        old_value=_json_safe(old_value),
        new_value=_json_safe(new_value),
        ip_address=client_ip(request),
        timestamp=timezone.now(),
    )
    logger.info('audit action=%s entity=%s:%s user=%s', action, entity_type, entity_id, entry.user_name)
    return entry
