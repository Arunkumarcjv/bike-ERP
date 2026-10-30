import re

from rest_framework import serializers

from .models import Branch, Tenant


def to_camel(name):
    return re.sub(r'_([a-z0-9])', lambda m: m.group(1).upper(), name)


class CamelCaseSerializerMixin:
    """
    Exposes snake_case model fields as camelCase JSON keys (the frontend's convention),
    including in the OpenAPI schema. `ref` is exposed as `id`.
    """

    def get_fields(self):
        fields = super().get_fields()
        renamed = {}
        for name, field in fields.items():
            if name == 'ref':
                key = 'id'
            else:
                key = to_camel(name)
            if key != name and field.source is None:
                field.source = name
            if key != name and isinstance(field, serializers.SerializerMethodField) and not field.method_name:
                field.method_name = f'get_{name}'
            renamed[key] = field
        return renamed


class TenantScopedSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    """
    Base serializer for TenantScopedModel. Unknown keys sent by the client are stored in
    `data` and merged back on read, so the frontend can round-trip its full object shape.
    """

    ref = serializers.CharField(required=False, max_length=64)

    def to_internal_value(self, payload):
        known = set(self.fields.keys())
        extra = {k: v for k, v in payload.items() if k not in known}
        validated = super().to_internal_value({k: v for k, v in payload.items() if k in known})
        if extra:
            base = dict(self.instance.data) if self.instance is not None else {}
            base.update(extra)
            validated['data'] = base
        return validated

    def to_representation(self, instance):
        core = super().to_representation(instance)
        return {**(instance.data or {}), **core}

    # The `ref` field is exposed under the key `id`, so DRF calls validate_id for it.
    def validate_id(self, value):
        request = self.context.get('request')
        model = self.Meta.model
        qs = model.objects.filter(tenant=request.tenant, ref=value) if request else model.objects.none()
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f'{model.__name__} with id "{value}" already exists.')
        return value


class BranchSerializer(TenantScopedSerializer):
    class Meta:
        model = Branch
        exclude = ('tenant', 'data', 'id', 'created_at', 'updated_at')


class TenantSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ('id', 'slug', 'name', 'gstin', 'state', 'state_code', 'profile', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')
