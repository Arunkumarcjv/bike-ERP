from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BranchViewSet, CurrentTenantView, PlatformTenantViewSet

router = DefaultRouter()
router.register('branches', BranchViewSet, basename='branch')
router.register('platform/tenants', PlatformTenantViewSet, basename='platform-tenant')

urlpatterns = [path('tenant/', CurrentTenantView.as_view(), name='current-tenant'), *router.urls]
