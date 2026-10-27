from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import record_audit
from apps.tenants.viewsets import TenantScopedViewSet

from . import models, serializers, services

SALES = {'Sales Manager', 'Sales Executive'}
SERVICE = {'Service Manager', 'Service Advisor', 'Technician'}
MANAGERS = {'Sales Manager', 'Service Manager', 'Accountant'}


@extend_schema(tags=['customers'])
class CustomerViewSet(TenantScopedViewSet):
    queryset = models.Customer.objects.all()
    serializer_class = serializers.CustomerSerializer
    write_roles = SALES | {'Service Advisor'}
    search_fields = ('name', 'phone', 'email')


@extend_schema(tags=['sales'])
class LeadViewSet(TenantScopedViewSet):
    queryset = models.Lead.objects.all()
    serializer_class = serializers.LeadSerializer
    write_roles = SALES
    filterset_fields = ('stage', 'source', 'assigned_to_id')
    search_fields = ('customer_name', 'phone', 'model_name')


@extend_schema(tags=['sales'])
class QuotationViewSet(TenantScopedViewSet):
    queryset = models.Quotation.objects.all()
    serializer_class = serializers.QuotationSerializer
    write_roles = SALES
    filterset_fields = ('discount_status',)


@extend_schema(tags=['sales'])
class BookingViewSet(TenantScopedViewSet):
    queryset = models.Booking.objects.all()
    serializer_class = serializers.BookingSerializer
    write_roles = SALES
    filterset_fields = ('status', 'branch_id')
    search_fields = ('customer_name', 'booking_number')


@extend_schema(tags=['sales'])
class SalesOrderViewSet(TenantScopedViewSet):
    queryset = models.SalesOrder.objects.all()
    serializer_class = serializers.SalesOrderSerializer
    write_roles = SALES | {'Accountant'}


@extend_schema(tags=['inventory'])
class VehicleUnitViewSet(TenantScopedViewSet):
    queryset = models.VehicleUnit.objects.all()
    serializer_class = serializers.VehicleUnitSerializer
    write_roles = {'Inventory Manager', 'Sales Manager'}
    action_roles = {'allocate': {'Sales Manager', 'Inventory Manager'},
                    'deallocate': {'Sales Manager', 'Inventory Manager'}}
    filterset_fields = ('status', 'branch_id', 'model_name')
    search_fields = ('chassis_number', 'engine_number', 'model_name')
    audit_entity = 'VEHICLE_STOCK'

    @extend_schema(request=serializers.AllocateSerializer, responses=serializers.VehicleUnitSerializer)
    @action(detail=True, methods=['post'])
    def allocate(self, request, id=None):
        body = serializers.AllocateSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        before = {'status': self.get_object().status}
        unit, _ = services.allocate_chassis(request.tenant, id, body.validated_data['bookingId'])
        record_audit(request, 'CHASSIS_ALLOCATED', 'VEHICLE_STOCK', unit.ref, before,
                     {'status': unit.status, 'allocatedBookingId': unit.allocated_booking_id})
        return Response(self.get_serializer(unit).data)

    @extend_schema(request=None, responses=serializers.VehicleUnitSerializer)
    @action(detail=True, methods=['post'])
    def deallocate(self, request, id=None):
        before = self.get_object()
        old = {'status': before.status, 'allocatedBookingId': before.allocated_booking_id}
        unit = services.deallocate_chassis(request.tenant, id)
        record_audit(request, 'CHASSIS_DEALLOCATED', 'VEHICLE_STOCK', unit.ref, old,
                     {'status': unit.status, 'allocatedBookingId': None})
        return Response(self.get_serializer(unit).data)


@extend_schema(tags=['inventory'])
class PartViewSet(TenantScopedViewSet):
    queryset = models.Part.objects.all()
    serializer_class = serializers.PartSerializer
    write_roles = {'Inventory Manager'}
    search_fields = ('name', 'part_number')


@extend_schema(tags=['service'])
class JobCardViewSet(TenantScopedViewSet):
    queryset = models.JobCard.objects.all()
    serializer_class = serializers.JobCardSerializer
    write_roles = SERVICE
    action_roles = {'stage': SERVICE}
    filterset_fields = ('stage', 'bay_number', 'technician_id')
    search_fields = ('job_card_number', 'registration_number', 'customer_name')
    audit_entity = 'JOB_CARD'

    @extend_schema(request=serializers.StageSerializer, responses=serializers.JobCardSerializer)
    @action(detail=True, methods=['post'])
    def stage(self, request, id=None):
        card = self.get_object()
        old_stage = card.stage
        # Extra keys (qcSignedBy, etc.) are merged through the normal partial-update path.
        serializer = self.get_serializer(card, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        card = serializer.save()
        record_audit(request, 'JOBCARD_STAGE_UPDATED', 'JOB_CARD', card.ref, {'stage': old_stage},
                     {'stage': card.stage})
        return Response(self.get_serializer(card).data)


@extend_schema(tags=['service'])
class BayViewSet(TenantScopedViewSet):
    queryset = models.Bay.objects.all()
    serializer_class = serializers.BaySerializer
    write_roles = {'Service Manager'}
    action_roles = {'assign': {'Service Manager', 'Service Advisor'},
                    'release': {'Service Manager', 'Service Advisor'}}
    filterset_fields = ('branch_id', 'status')
    audit_entity = 'SERVICE_BAY'

    @extend_schema(request=serializers.BayAssignSerializer, responses=serializers.BaySerializer)
    @action(detail=False, methods=['post'])
    def assign(self, request):
        body = serializers.BayAssignSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        data = body.validated_data
        bay, card = services.assign_bay(request.tenant, data['bayNumber'], data['jobCardId'], data.get('branchId'))
        record_audit(request, 'BAY_ALLOCATED', 'SERVICE_BAY', f'bay-{bay.bay_number}', None,
                     {'bayNumber': bay.bay_number, 'jobCardId': card.ref})
        return Response(self.get_serializer(bay).data)

    @extend_schema(request=serializers.BayReleaseSerializer, responses=serializers.BaySerializer)
    @action(detail=False, methods=['post'])
    def release(self, request):
        body = serializers.BayReleaseSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        bay = services.release_bay(request.tenant, body.validated_data['bayNumber'],
                                   body.validated_data.get('branchId'))
        record_audit(request, 'BAY_RELEASED', 'SERVICE_BAY', f'bay-{bay.bay_number}', None,
                     {'bayNumber': bay.bay_number})
        return Response(self.get_serializer(bay).data)


@extend_schema(tags=['billing'])
class InvoiceViewSet(TenantScopedViewSet):
    """Posted invoices are immutable: no update/delete. Numbers are gap-free per tenant (VI/2627/00001)."""

    queryset = models.Invoice.objects.all()
    serializer_class = serializers.InvoiceSerializer
    http_method_names = ('get', 'post', 'head', 'options')
    write_roles = {'Accountant'}
    filterset_fields = ('type', 'status', 'payment_status', 'branch_id')
    search_fields = ('invoice_number', 'customer_name')
    audit_entity = 'INVOICE'

    def perform_create(self, serializer):
        user = self.request.user
        now = timezone.now()
        instance = serializer.save(
            tenant=self.request.tenant,
            invoice_number=services.next_invoice_number(self.request.tenant),
            status='POSTED',
            date=serializer.validated_data.get('date') or now,
            posted_at=now,
            posted_by=f'{user.name} ({user.role})',
            branch_id=serializer.validated_data.get('branch_id') or services.default_branch_ref(self.request.tenant),
        )
        record_audit(self.request, 'INVOICE_POSTED', 'INVOICE', instance.ref, None,
                     {'invoiceNumber': instance.invoice_number, 'grandTotalPaise': instance.grand_total_paise})


@extend_schema(tags=['approvals'])
class ApprovalViewSet(TenantScopedViewSet):
    """Dual-control approvals: the requester can never approve their own request."""

    queryset = models.Approval.objects.all()
    serializer_class = serializers.ApprovalSerializer
    http_method_names = ('get', 'post', 'head', 'options')
    write_roles = None  # anyone may raise a request
    action_roles = {'approve': MANAGERS, 'reject': MANAGERS}
    filterset_fields = ('status', 'type')
    audit_entity = 'APPROVAL'

    def perform_create(self, serializer):
        user = self.request.user
        instance = serializer.save(
            tenant=self.request.tenant, requested_by=user.name or user.email, requested_by_id=user.ref or str(user.pk),
            requested_by_role=user.role, requested_at=timezone.now(), status='PENDING',
        )
        record_audit(self.request, 'APPROVAL_REQUESTED', 'APPROVAL', instance.ref, None,
                     self.get_serializer(instance).data)

    def _decide(self, request, id, approve):
        body = serializers.ApprovalDecisionSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        item, before = services.decide_approval(request.tenant, request.user, id, approve,
                                                body.validated_data.get('reason', ''))
        record_audit(request, 'APPROVAL_GRANTED' if approve else 'APPROVAL_REJECTED', 'APPROVAL', item.ref,
                     before, {'status': item.status})
        return Response(self.get_serializer(item).data, status=status.HTTP_200_OK)

    @extend_schema(request=serializers.ApprovalDecisionSerializer, responses=serializers.ApprovalSerializer)
    @action(detail=True, methods=['post'])
    def approve(self, request, id=None):
        return self._decide(request, id, True)

    @extend_schema(request=serializers.ApprovalDecisionSerializer, responses=serializers.ApprovalSerializer)
    @action(detail=True, methods=['post'])
    def reject(self, request, id=None):
        return self._decide(request, id, False)


@extend_schema(tags=['notifications'])
class NotificationViewSet(TenantScopedViewSet):
    queryset = models.Notification.objects.all()
    serializer_class = serializers.NotificationSerializer
    write_roles = None
    filterset_fields = ('read', 'severity', 'type')
