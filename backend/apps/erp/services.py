"""Business rules enforced server-side (mirrors the frontend store actions)."""
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.tenants.models import Branch

from .models import Approval, Bay, Booking, DocumentSequence, Invoice, JobCard, ServiceAppointment, VehicleUnit

FY_CODE = '2627'


def default_branch_ref(tenant):
    branch = Branch.objects.filter(tenant=tenant).order_by('-is_headquarters', 'name').first()
    return branch.ref if branch else ''


def _get(model, tenant, **lookup):
    obj = model.objects.select_for_update().filter(tenant=tenant, **lookup).first()
    if obj is None:
        raise NotFound(f'{model.__name__} {lookup} not found.')
    return obj


@transaction.atomic
def assign_bay(tenant, bay_number, job_card_ref, branch_ref=None):
    branch_ref = branch_ref or default_branch_ref(tenant)
    bay = _get(Bay, tenant, branch_id=branch_ref, bay_number=bay_number)
    card = _get(JobCard, tenant, ref=job_card_ref)
    if bay.status == 'MAINTENANCE':
        raise ValidationError(f'Bay #{bay_number} is under maintenance.')
    if bay.active_job_card_id and bay.active_job_card_id != card.ref:
        raise ValidationError(f'Bay #{bay_number} is already occupied by job card {bay.active_job_card_id}.')

    # A job card occupies at most one bay: free the one it was in before.
    if card.bay_number and card.bay_number != bay_number:
        Bay.objects.filter(tenant=tenant, branch_id=branch_ref, bay_number=card.bay_number,
                           active_job_card_id=card.ref).update(
            status='FREE', active_job_card_id=None, vehicle_registration=None, model_name=None,
            technician_id=None, technician_name=None, started_at=None, sla_status='NORMAL')

    bay.status = 'OCCUPIED'
    bay.active_job_card_id = card.ref
    bay.vehicle_registration = card.registration_number
    bay.model_name = card.model_name
    bay.technician_id = card.technician_id
    bay.technician_name = card.technician_name
    bay.started_at = timezone.now()
    bay.sla_status = 'NORMAL'
    bay.save()
    card.bay_number = bay_number
    card.save(update_fields=['bay_number', 'updated_at'])
    return bay, card


@transaction.atomic
def release_bay(tenant, bay_number, branch_ref=None):
    branch_ref = branch_ref or default_branch_ref(tenant)
    bay = _get(Bay, tenant, branch_id=branch_ref, bay_number=bay_number)
    if bay.active_job_card_id:
        JobCard.objects.filter(tenant=tenant, ref=bay.active_job_card_id, bay_number=bay_number).update(bay_number=None)
    bay.status = 'FREE'
    bay.active_job_card_id = None
    bay.vehicle_registration = None
    bay.model_name = None
    bay.technician_id = None
    bay.technician_name = None
    bay.started_at = None
    bay.sla_status = 'NORMAL'
    bay.save()
    return bay


@transaction.atomic
def allocate_chassis(tenant, unit_ref, booking_ref):
    unit = _get(VehicleUnit, tenant, ref=unit_ref)
    booking = _get(Booking, tenant, ref=booking_ref)
    if unit.allocated_booking_id and unit.allocated_booking_id != booking.ref:
        raise ValidationError(f'Chassis {unit.chassis_number} is already allocated to booking '
                              f'{unit.allocated_booking_id}. Double allocation blocked.')
    if unit.status not in ('IN_STOCK', 'ALLOCATED'):
        raise ValidationError(f'Chassis {unit.chassis_number} is {unit.status} and cannot be allocated.')
    # Release whatever unit this booking held before.
    if booking.allocated_unit_id and booking.allocated_unit_id != unit.ref:
        VehicleUnit.objects.filter(tenant=tenant, ref=booking.allocated_unit_id).update(
            status='IN_STOCK', allocated_booking_id=None)
    unit.status = 'ALLOCATED'
    unit.allocated_booking_id = booking.ref
    unit.save()
    booking.allocated_unit_id = unit.ref
    booking.allocated_chassis_number = unit.chassis_number
    booking.save()
    return unit, booking


@transaction.atomic
def deallocate_chassis(tenant, unit_ref):
    unit = _get(VehicleUnit, tenant, ref=unit_ref)
    Booking.objects.filter(tenant=tenant, allocated_unit_id=unit.ref).update(
        allocated_unit_id=None, allocated_chassis_number=None)
    unit.status = 'IN_STOCK'
    unit.allocated_booking_id = None
    unit.save()
    return unit


def next_job_card_number(tenant, when=None):
    """Daily sequence, e.g. JC20251014-001 (as on the job card form)."""
    day = timezone.localtime(when or timezone.now()).strftime('%Y%m%d')
    return f'JC{day}-{DocumentSequence.next_value(tenant, f"jobcard-{day}"):03d}'


@transaction.atomic
def link_appointment(tenant, appointment_ref, job_card_ref):
    """Checking a booked vehicle in: the appointment points at its job card and leaves the open list."""
    appointment = _get(ServiceAppointment, tenant, ref=appointment_ref)
    if appointment.status == 'CANCELLED':
        raise ValidationError({'appointmentId': 'This appointment was cancelled.'})
    if appointment.job_card_id and appointment.job_card_id != job_card_ref:
        raise ValidationError({'appointmentId': f'Appointment already has job card {appointment.job_card_id}.'})
    appointment.job_card_id = job_card_ref
    appointment.status = 'CHECKED_IN'
    appointment.save(update_fields=['job_card_id', 'status', 'updated_at'])
    return appointment


def next_invoice_number(tenant):
    return f'VI/{FY_CODE}/{DocumentSequence.next_value(tenant, f"invoice-{FY_CODE}"):05d}'


def sync_invoice_sequence(tenant):
    """After importing invoices, make the counter continue from the highest existing number."""
    prefix = f'VI/{FY_CODE}/'
    numbers = Invoice.objects.filter(tenant=tenant, invoice_number__startswith=prefix).values_list(
        'invoice_number', flat=True)
    highest = max((int(n[len(prefix):]) for n in numbers if n[len(prefix):].isdigit()), default=0)
    DocumentSequence.objects.update_or_create(tenant=tenant, key=f'invoice-{FY_CODE}',
                                              defaults={'last_value': highest})


def decide_approval(tenant, user, approval_ref, approve, reason=''):
    with transaction.atomic():
        item = _get(Approval, tenant, ref=approval_ref)
        if item.status != 'PENDING':
            raise ValidationError(f'Approval is already {item.status}.')
        if approve and (item.requested_by_id == (user.ref or str(user.pk)) or item.requested_by == user.name):
            raise PermissionDenied('Dual-control violation: you cannot approve your own request.')
        if not approve and not reason.strip():
            raise ValidationError('A mandatory reason must be provided when rejecting an approval request.')
        before = {'status': item.status}
        item.status = 'APPROVED' if approve else 'REJECTED'
        item.reviewed_by = user.name or user.email
        item.reviewed_at = timezone.now()
        if approve:
            item.reviewer_reason = reason or 'Approved under delegation authority'
        else:
            item.rejection_reason = reason
        item.save()
        return item, before
