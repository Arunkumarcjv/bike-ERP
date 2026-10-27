from rest_framework import serializers

from apps.tenants.serializers import TenantScopedSerializer

from . import models

_EXCLUDE = ('tenant', 'data', 'id', 'created_at', 'updated_at')


def scoped_serializer(model_cls, read_only=(), extra_fields=None):
    attrs = {'Meta': type('Meta', (), {'model': model_cls, 'exclude': _EXCLUDE, 'read_only_fields': read_only})}
    attrs.update(extra_fields or {})
    return type(f'{model_cls.__name__}Serializer', (TenantScopedSerializer,), attrs)


class TimestampedSerializerMixin:
    """Expose the row's creation time as `createdAt` unless the frontend supplied its own."""

    def to_representation(self, instance):
        out = super().to_representation(instance)
        out.setdefault('createdAt', instance.created_at.isoformat())
        return out


CustomerSerializer = scoped_serializer(models.Customer)
LeadSerializer = type('LeadSerializer', (TimestampedSerializerMixin, scoped_serializer(models.Lead)), {})
QuotationSerializer = scoped_serializer(models.Quotation)
BookingSerializer = scoped_serializer(models.Booking)
SalesOrderSerializer = scoped_serializer(models.SalesOrder)
VehicleUnitSerializer = scoped_serializer(models.VehicleUnit, read_only=('allocated_booking_id',))
PartSerializer = scoped_serializer(models.Part)
JobCardSerializer = type('JobCardSerializer', (TimestampedSerializerMixin, scoped_serializer(models.JobCard)), {})
BaySerializer = scoped_serializer(models.Bay)
NotificationSerializer = scoped_serializer(models.Notification)
InvoiceSerializer = scoped_serializer(
    models.Invoice,
    read_only=('invoice_number', 'status', 'posted_at', 'posted_by'),
    extra_fields={'date': serializers.DateTimeField(required=False)},
)
ApprovalSerializer = scoped_serializer(
    models.Approval,
    read_only=('requested_by', 'requested_by_id', 'requested_by_role', 'requested_at', 'status', 'reviewed_by',
               'reviewed_at', 'reviewer_reason', 'rejection_reason'),
)


class StageSerializer(serializers.Serializer):
    stage = serializers.CharField(max_length=24)


class BayAssignSerializer(serializers.Serializer):
    bayNumber = serializers.IntegerField(min_value=1)
    jobCardId = serializers.CharField()
    branchId = serializers.CharField(required=False)


class BayReleaseSerializer(serializers.Serializer):
    bayNumber = serializers.IntegerField(min_value=1)
    branchId = serializers.CharField(required=False)


class AllocateSerializer(serializers.Serializer):
    bookingId = serializers.CharField()


class ApprovalDecisionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
