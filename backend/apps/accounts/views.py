import hmac
import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.audit.services import record_audit
from apps.tenants.permissions import HasRole, IsTenantMember
from apps.tenants.viewsets import TenantScopedViewSet

from .models import User
from .serializers import (LoginResponseSerializer, LoginSerializer, LogoutSerializer, UserSerializer,
                          UserWriteSerializer)
from .tokens import issue_tokens

logger = logging.getLogger('bikeerp.auth')


class LoginView(APIView):
    """
    Email + password login. Users with `twoFactorRequired` get `{"otpRequired": true}` first and
    must repeat the call with `otp`. Returns a JWT pair and the user profile.
    """

    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'login'

    @extend_schema(request=LoginSerializer, responses=LoginResponseSerializer, tags=['auth'])
    def post(self, request):
        payload = LoginSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        email = payload.validated_data['email'].lower()
        user = authenticate(request, email=email, password=payload.validated_data['password'])

        if user is None:
            logger.warning('login failed email=%s ip=%s', email, request.META.get('REMOTE_ADDR'))
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        if user.tenant_id and not user.tenant.is_active:
            return Response({'detail': 'Tenant is suspended.'}, status=status.HTTP_403_FORBIDDEN)

        if user.two_factor_required:
            otp = payload.validated_data.get('otp') or ''
            if not otp:
                return Response({'otpRequired': True})
            if not hmac.compare_digest(otp, settings.DEMO_OTP):
                logger.warning('login otp rejected user=%s', user.email)
                return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)

        update_last_login(None, user)
        request.user = user
        request.tenant = user.tenant
        request._request.tenant = user.tenant
        record_audit(request, 'USER_LOGIN', 'USER', user.ref or str(user.pk), None, {'email': user.email})
        logger.info('login ok user=%s tenant=%s', user.email, user.tenant.slug if user.tenant_id else '-')
        return Response({'otpRequired': False, **issue_tokens(user), 'user': UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(request=LogoutSerializer, responses={205: None}, tags=['auth'])
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data['refresh']).blacklist()
        except TokenError:
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=UserSerializer, tags=['auth'])
    def get(self, request):
        return Response(UserSerializer(request.user).data)


@extend_schema(tags=['auth'])
class RefreshView(TokenRefreshView):
    pass


@extend_schema(tags=['users'])
class UserViewSet(TenantScopedViewSet):
    """Staff accounts of the current tenant (admin only for writes)."""

    queryset = User.objects.all()
    permission_classes = (IsTenantMember, HasRole)
    write_roles = {'Super Admin'}
    lookup_field = 'pk'
    lookup_url_kwarg = 'pk'
    audit_entity = 'USER'
    search_fields = ('name', 'email', 'role')

    def get_serializer_class(self):
        return UserSerializer if self.request.method in ('GET', 'HEAD') else UserWriteSerializer

    def perform_create(self, serializer):
        user = serializer.save(tenant=self.request.tenant)
        record_audit(self.request, 'USER_CREATED', 'USER', str(user.pk), None, UserSerializer(user).data)

    def perform_update(self, serializer):
        user = serializer.save()
        record_audit(self.request, 'USER_UPDATED', 'USER', str(user.pk), None, UserSerializer(user).data)

    def perform_destroy(self, instance):
        # Deactivate instead of delete so the audit trail keeps resolving.
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        record_audit(self.request, 'USER_DEACTIVATED', 'USER', str(instance.pk), None, None)
