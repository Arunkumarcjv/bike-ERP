from django.contrib import admin

from .models import AuditLog, RequestLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'tenant', 'user_name', 'action', 'entity_type', 'entity_id')
    list_filter = ('tenant', 'action', 'entity_type')

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RequestLog)
class RequestLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'tenant', 'method', 'path', 'status_code', 'duration_ms')
    list_filter = ('tenant', 'method', 'status_code')
