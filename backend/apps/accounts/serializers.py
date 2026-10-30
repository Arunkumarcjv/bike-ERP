from rest_framework import serializers

from apps.tenants.serializers import CamelCaseSerializerMixin

from .models import User


class UserSerializer(CamelCaseSerializerMixin, serializers.ModelSerializer):
    """Shape matches the frontend `currentUser` persona object."""

    id = serializers.SerializerMethodField()
    tenant_slug = serializers.CharField(source='tenant.slug', read_only=True, default=None)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'avatar', 'department', 'branch_ref', 'two_factor_required',
                  'tenant_slug', 'is_active', 'last_login')
        read_only_fields = ('last_login',)

    def get_id(self, obj) -> str:
        return obj.ref or str(obj.pk)


class UserWriteSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('password',)

    def create(self, validated):
        password = validated.pop('password', None)
        user = User(**validated)
        user.username = user.email
        user.set_password(password) if password else user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated):
        password = validated.pop('password', None)
        instance = super().update(instance, validated)
        if password:
            instance.set_password(password)
            instance.save(update_fields=['password'])
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(required=False, allow_blank=True, max_length=8)


class LoginResponseSerializer(serializers.Serializer):
    otpRequired = serializers.BooleanField()
    access = serializers.CharField(required=False)
    refresh = serializers.CharField(required=False)
    user = UserSerializer(required=False)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
