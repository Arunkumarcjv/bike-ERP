from django.conf import settings
from django.db import models

from apps.tenants.models import Tenant


class AuditLog(models.Model):
    """Append-only business audit trail (who changed what, with before/after values)."""

    tenant = models.ForeignKey(Tenant, null=True, on_delete=models.CASCADE, related_name='+')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    user_name = models.CharField(max_length=150, blank=True)
    user_role = models.CharField(max_length=32, blank=True)
    action = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, db_index=True)
    entity_id = models.CharField(max_length=64, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-timestamp', '-id']
        indexes = [models.Index(fields=['tenant', '-timestamp'])]


class RequestLog(models.Model):
    """One row per API call; feeds the dashboard's API health panel."""

    tenant = models.ForeignKey(Tenant, null=True, on_delete=models.CASCADE, related_name='+')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+')
    method = models.CharField(max_length=8)
    path = models.CharField(max_length=255)
    status_code = models.PositiveSmallIntegerField()
    duration_ms = models.PositiveIntegerField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp', '-id']
        indexes = [models.Index(fields=['tenant', '-timestamp'])]
