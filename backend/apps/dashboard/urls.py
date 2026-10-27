from django.urls import path

from .views import ActivityView, BootstrapView, SummaryView

urlpatterns = [
    path('summary/', SummaryView.as_view(), name='dashboard-summary'),
    path('activity/', ActivityView.as_view(), name='dashboard-activity'),
    path('bootstrap/', BootstrapView.as_view(), name='dashboard-bootstrap'),
]
