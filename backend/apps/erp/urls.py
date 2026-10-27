from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('customers', views.CustomerViewSet, basename='customer')
router.register('leads', views.LeadViewSet, basename='lead')
router.register('quotations', views.QuotationViewSet, basename='quotation')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('sales-orders', views.SalesOrderViewSet, basename='sales-order')
router.register('vehicles', views.VehicleUnitViewSet, basename='vehicle')
router.register('parts', views.PartViewSet, basename='part')
router.register('job-cards', views.JobCardViewSet, basename='job-card')
router.register('bays', views.BayViewSet, basename='bay')
router.register('invoices', views.InvoiceViewSet, basename='invoice')
router.register('approvals', views.ApprovalViewSet, basename='approval')
router.register('notifications', views.NotificationViewSet, basename='notification')

urlpatterns = router.urls
