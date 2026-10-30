from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Branch, Tenant
from .permissions import IsPlatformStaff
from .serializers import BranchSerializer, TenantSerializer
from .viewsets import TenantScopedViewSet


class CurrentTenantView(APIView):
    @extend_schema(responses=TenantSerializer, tags=['tenants'])
    def get(self, request):
        return Response(TenantSerializer(request.tenant).data)


@extend_schema(tags=['tenants'])
class BranchViewSet(TenantScopedViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    write_roles = {'Super Admin'}
    search_fields = ('name', 'code')


@extend_schema(tags=['platform'])
class PlatformTenantViewSet(viewsets.ModelViewSet):
    """Platform-staff only: onboard and suspend dealership tenants."""

    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = (IsPlatformStaff,)
    lookup_field = 'slug'
