from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet, RequestLogViewSet

router = DefaultRouter()
router.register('audit-logs', AuditLogViewSet, basename='audit-log')
router.register('request-logs', RequestLogViewSet, basename='request-log')

urlpatterns = router.urls
