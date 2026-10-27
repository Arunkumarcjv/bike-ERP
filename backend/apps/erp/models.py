"""
Core dealership entities. Columns that are filtered, aggregated or enforced server-side are
typed; the remaining frontend attributes live in `data` (see TenantScopedModel).
All money is integer paise.
"""
from django.db import models, transaction

from apps.tenants.models import Tenant, TenantScopedModel


def _uniq_ref(name):
    return [models.UniqueConstraint(fields=['tenant', 'ref'], name=f'uniq_{name}_ref')]


class Customer(TenantScopedModel):
    REF_PREFIX = 'cust'

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)

    class Meta:
        ordering = ['name']
        constraints = _uniq_ref('customer')


class Lead(TenantScopedModel):
    REF_PREFIX = 'lead'
    STAGES = ('ENQUIRY', 'TEST_RIDE', 'QUOTATION', 'BOOKING', 'FINANCE', 'DELIVERY', 'LOST')

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    stage = models.CharField(max_length=16, choices=[(s, s) for s in STAGES], default='ENQUIRY', db_index=True)
    source = models.CharField(max_length=32, blank=True)
    assigned_to_id = models.CharField(max_length=64, blank=True)
    assigned_to_name = models.CharField(max_length=150, blank=True)
    budget_paise = models.BigIntegerField(default=0)
    ai_score = models.PositiveSmallIntegerField(null=True, blank=True)
    follow_up_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('lead')


class Quotation(TenantScopedModel):
    REF_PREFIX = 'qt'

    quotation_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    discount_status = models.CharField(max_length=16, blank=True)
    total_on_road_paise = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('quotation')


class Booking(TenantScopedModel):
    REF_PREFIX = 'bk'

    booking_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150)
    model_name = models.CharField(max_length=150, blank=True)
    token_amount_paise = models.BigIntegerField(default=0)
    total_on_road_paise = models.BigIntegerField(default=0)
    status = models.CharField(max_length=24, default='CONFIRMED', db_index=True)
    booking_date = models.DateTimeField(null=True, blank=True)
    branch_id = models.CharField(max_length=64, blank=True)
    allocated_unit_id = models.CharField(max_length=64, blank=True, null=True)
    allocated_chassis_number = models.CharField(max_length=17, blank=True, null=True)

    class Meta:
        ordering = ['-booking_date', '-created_at']
        constraints = _uniq_ref('booking')


class SalesOrder(TenantScopedModel):
    REF_PREFIX = 'so'

    order_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=24, blank=True)
    grand_total_paise = models.BigIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('sales_order')


class VehicleUnit(TenantScopedModel):
    REF_PREFIX = 'unit'
    STATUSES = ('IN_STOCK', 'ALLOCATED', 'IN_TRANSIT', 'SOLD', 'DEMO')

    chassis_number = models.CharField(max_length=17)
    engine_number = models.CharField(max_length=32, blank=True)
    model_name = models.CharField(max_length=150)
    variant_name = models.CharField(max_length=100, blank=True)
    color_name = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=16, choices=[(s, s) for s in STATUSES], default='IN_STOCK', db_index=True)
    allocated_booking_id = models.CharField(max_length=64, blank=True, null=True)
    ex_showroom_paise = models.BigIntegerField(default=0)
    purchase_cost_paise = models.BigIntegerField(default=0)
    branch_id = models.CharField(max_length=64, blank=True)
    arrival_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['model_name', 'chassis_number']
        constraints = _uniq_ref('vehicle') + [
            models.UniqueConstraint(fields=['tenant', 'chassis_number'], name='uniq_vehicle_chassis'),
        ]


class Part(TenantScopedModel):
    REF_PREFIX = 'prt'

    part_number = models.CharField(max_length=40)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=80, blank=True)
    hsn = models.CharField(max_length=8, blank=True)
    gst_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    unit_price_paise = models.BigIntegerField(default=0)
    cost_price_paise = models.BigIntegerField(default=0)
    stock_qty = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)

    class Meta:
        ordering = ['name']
        constraints = _uniq_ref('part')


class JobCard(TenantScopedModel):
    REF_PREFIX = 'jc'

    job_card_number = models.CharField(max_length=32, blank=True)
    customer_name = models.CharField(max_length=150, blank=True)
    registration_number = models.CharField(max_length=20, blank=True)
    model_name = models.CharField(max_length=150, blank=True)
    stage = models.CharField(max_length=24, default='CHECKED_IN', db_index=True)
    service_type = models.CharField(max_length=32, blank=True)
    bay_number = models.PositiveSmallIntegerField(null=True, blank=True)
    technician_id = models.CharField(max_length=64, blank=True, null=True)
    technician_name = models.CharField(max_length=150, blank=True, null=True)
    grand_total_paise = models.BigIntegerField(default=0)
    branch_id = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = _uniq_ref('jobcard')


class Bay(TenantScopedModel):
    REF_PREFIX = 'bay'

    branch_id = models.CharField(max_length=64)
    bay_number = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=32, blank=True)
    type = models.CharField(max_length=16, default='GENERAL')
    status = models.CharField(max_length=16, default='FREE')  # FREE, OCCUPIED, MAINTENANCE
    active_job_card_id = models.CharField(max_length=64, blank=True, null=True)
    vehicle_registration = models.CharField(max_length=20, blank=True, null=True)
    model_name = models.CharField(max_length=150, blank=True, null=True)
    technician_id = models.CharField(max_length=64, blank=True, null=True)
    technician_name = models.CharField(max_length=150, blank=True, null=True)
    started_at = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=60)
    sla_status = models.CharField(max_length=16, default='NORMAL')

    class Meta:
        ordering = ['branch_id', 'bay_number']
        constraints = _uniq_ref('bay') + [
            models.UniqueConstraint(fields=['tenant', 'branch_id', 'bay_number'], name='uniq_bay_number'),
        ]


class Invoice(TenantScopedModel):
    REF_PREFIX = 'inv'

    invoice_number = models.CharField(max_length=16)
    type = models.CharField(max_length=24, db_index=True)  # VEHICLE_SALE, SERVICE, PARTS, ...
    date = models.DateTimeField(db_index=True)
    customer_id = models.CharField(max_length=64, blank=True, null=True)
    customer_name = models.CharField(max_length=150)
    status = models.CharField(max_length=16, default='POSTED', db_index=True)
    items = models.JSONField(default=list)
    taxable_amount_paise = models.BigIntegerField(default=0)
    cgst_paise = models.BigIntegerField(default=0)
    sgst_paise = models.BigIntegerField(default=0)
    igst_paise = models.BigIntegerField(default=0)
    total_tax_paise = models.BigIntegerField(default=0)
    round_off_paise = models.BigIntegerField(default=0)
    grand_total_paise = models.BigIntegerField(default=0)
    paid_amount_paise = models.BigIntegerField(default=0)
    balance_due_paise = models.BigIntegerField(default=0)
    payment_status = models.CharField(max_length=16, blank=True)
    payment_mode = models.CharField(max_length=32, blank=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_by = models.CharField(max_length=150, blank=True)
    branch_id = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-date']
        constraints = _uniq_ref('invoice') + [
            models.UniqueConstraint(fields=['tenant', 'invoice_number'], name='uniq_invoice_number'),
        ]


class Approval(TenantScopedModel):
    REF_PREFIX = 'appr'

    type = models.CharField(max_length=32)
    entity_id = models.CharField(max_length=64, blank=True)
    entity_type = models.CharField(max_length=32, blank=True)
    title = models.CharField(max_length=255)
    requested_by = models.CharField(max_length=150, blank=True)
    requested_by_id = models.CharField(max_length=64, blank=True)
    requested_by_role = models.CharField(max_length=32, blank=True)
    requested_at = models.DateTimeField()
    amount_paise = models.BigIntegerField(default=0)
    threshold_paise = models.BigIntegerField(default=0)
    reason = models.TextField(blank=True)
    rule_triggered = models.CharField(max_length=255, blank=True)
    escalation_hours = models.PositiveSmallIntegerField(default=4)
    status = models.CharField(max_length=16, default='PENDING', db_index=True)
    reviewed_by = models.CharField(max_length=150, blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_reason = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-requested_at']
        constraints = _uniq_ref('approval')


class Notification(TenantScopedModel):
    REF_PREFIX = 'notif'

    type = models.CharField(max_length=32)
    severity = models.CharField(max_length=16, default='MEDIUM')
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    timestamp = models.DateTimeField()
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-timestamp']
        constraints = _uniq_ref('notification')


class DocumentSequence(models.Model):
    """Gap-free per-tenant counters (e.g. invoice numbers), incremented under a row lock."""

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='+')
    key = models.CharField(max_length=32)
    last_value = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['tenant', 'key'], name='uniq_sequence_key')]

    @classmethod
    def next_value(cls, tenant, key):
        with transaction.atomic():
            seq, _ = cls.objects.select_for_update().get_or_create(tenant=tenant, key=key)
            seq.last_value += 1
            seq.save(update_fields=['last_value'])
            return seq.last_value
