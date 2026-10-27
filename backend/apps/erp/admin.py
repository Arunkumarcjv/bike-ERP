from django.contrib import admin

from . import models

for model in (models.Customer, models.Lead, models.Quotation, models.Booking, models.SalesOrder, models.VehicleUnit,
              models.Part, models.JobCard, models.Bay, models.Invoice, models.Approval, models.Notification):
    admin.site.register(model, list_display=('ref', 'tenant', 'updated_at'), list_filter=('tenant',),
                        search_fields=('ref',))
