from drf_spectacular.utils import extend_schema
from rest_framework import viewsets

from apps.tenants.permissions import HasRole, IsTenantMember

from .models import AuditLog, RequestLog
from .serializers import AuditLogSerializer, RequestLogSerializer

LOG_VIEWER_ROLES = {'Super Admin', 'Accountant'}


class _LogViewerRole(HasRole):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.role in LOG_VIEWER_ROLES))


@extend_schema(tags=['logs'])
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Immutable audit trail for the current tenant. Read-only by design."""

    serializer_class = AuditLogSerializer
    permission_classes = (IsTenantMember, _LogViewerRole)
    filterset_fields = ('action', 'entity_type', 'entity_id', 'user_role')
    search_fields = ('action', 'entity_id', 'user_name')

    queryset = AuditLog.objects.none()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return AuditLog.objects.none()
        return AuditLog.objects.filter(tenant=self.request.tenant).select_related('user')


@extend_schema(tags=['logs'])
class RequestLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API request log (method, path, status, latency) for the current tenant."""

    serializer_class = RequestLogSerializer
    permission_classes = (IsTenantMember, _LogViewerRole)
    filterset_fields = ('method', 'status_code')
    search_fields = ('path',)

    queryset = RequestLog.objects.none()

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return RequestLog.objects.none()
        return RequestLog.objects.filter(tenant=self.request.tenant).select_related('user')
