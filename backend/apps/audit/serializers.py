from rest_framework import serializers

from apps.tenants.serializers import CamelCaseSerializerMixin

from .models import AuditLog, RequestLog


class AuditLogSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ('id', 'timestamp', 'user_id', 'user_name', 'user_role', 'action', 'entity_type', 'entity_id',
                  'old_value', 'new_value', 'ip_address')

    def get_id(self, obj) -> str:
        return f'aud-{obj.pk}'

    def get_user_id(self, obj) -> str:
        if obj.user_id is None:
            return 'system'
        return obj.user.ref or str(obj.user_id)


class RequestLogSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', default=None, read_only=True)

    class Meta:
        model = RequestLog
        fields = ('id', 'timestamp', 'method', 'path', 'status_code', 'duration_ms', 'user_email', 'ip_address')
