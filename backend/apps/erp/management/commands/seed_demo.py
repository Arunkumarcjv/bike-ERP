"""
Loads backend/fixtures/demo_seed.json (exported from the frontend by `npm run export:seed`)
into a tenant. All timestamps are shifted so the export day becomes today, keeping the
"today" dashboard KPIs populated no matter when the seed is loaded.
"""
import json
import re
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import models as dj_models
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime

from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.erp import models as erp
from apps.erp.services import sync_invoice_sequence
from apps.tenants.models import Branch, Tenant, generate_ref

FIXTURE = Path(settings.BASE_DIR) / 'fixtures' / 'demo_seed.json'
ISO_RE = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}')
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
SKIP_FIELDS = {'id', 'tenant', 'ref', 'data', 'created_at', 'updated_at'}

COLLECTIONS = [
    ('customers', erp.Customer), ('leads', erp.Lead), ('quotations', erp.Quotation), ('bookings', erp.Booking),
    ('salesOrders', erp.SalesOrder), ('vehicleStock', erp.VehicleUnit), ('partsStock', erp.Part),
    ('jobCards', erp.JobCard), ('appointments', erp.ServiceAppointment), ('bays', erp.Bay), ('invoices', erp.Invoice), ('approvals', erp.Approval),
    ('notifications', erp.Notification),
]


def camel_to_snake(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()


def shift_dates(value, delta):
    if isinstance(value, dict):
        return {k: shift_dates(v, delta) for k, v in value.items()}
    if isinstance(value, list):
        return [shift_dates(v, delta) for v in value]
    if isinstance(value, str) and ISO_RE.match(value):
        parsed = parse_datetime(value)
        if parsed:
            return (parsed + delta).isoformat().replace('+00:00', 'Z')
    if isinstance(value, str) and DATE_RE.match(value):
        parsed = parse_date(value)
        if parsed:
            return (parsed + delta).isoformat()
    return value


def build_instance(model, tenant, record):
    fields = {f.name: f for f in model._meta.concrete_fields if f.name not in SKIP_FIELDS}
    # bulk_create skips save(), so records without an id (e.g. bays) get their ref here.
    ref = str(record.get('id') or '') or (
        f"bay-{record.get('branchId')}-{record.get('bayNumber')}" if model is erp.Bay else generate_ref(model.REF_PREFIX))
    kwargs, extra = {'tenant': tenant, 'ref': ref}, {}
    for key, value in record.items():
        if key == 'id':
            continue
        field = fields.get(camel_to_snake(key))
        if field is None:
            extra[key] = value
            continue
        if isinstance(field, dj_models.DateTimeField) and isinstance(value, str):
            value = parse_datetime(value)
        elif isinstance(field, dj_models.DateField) and isinstance(value, str):
            value = parse_date(value[:10])
        elif isinstance(field, dj_models.CharField) and value is None and not field.null:
            value = ''
        elif isinstance(field, dj_models.CharField) and value is not None:
            value = str(value)[:field.max_length]
        kwargs[field.name] = value
    return model(data=extra, **kwargs)


class Command(BaseCommand):
    help = 'Create (or reset) a demo tenant populated with the frontend seed data.'

    def add_arguments(self, parser):
        parser.add_argument('--tenant', default='bike-erp', help='Tenant slug (default: bike-erp)')
        parser.add_argument('--name', default=None, help='Tenant display name')
        parser.add_argument('--reset', action='store_true', help='Delete the tenant first if it exists')

    @transaction.atomic
    def handle(self, *args, **opts):
        if not FIXTURE.exists():
            raise CommandError(f'{FIXTURE} not found. Run `npm run export:seed` in the frontend first.')
        raw = json.loads(FIXTURE.read_text(encoding='utf-8'))
        exported = parse_datetime(raw['exportedAt'])
        day_shift = (timezone.localdate() - timezone.localtime(exported).date()).days
        data = shift_dates(raw, timedelta(days=day_shift))

        slug = opts['tenant']
        existing = Tenant.objects.filter(slug=slug).first()
        if existing and not opts['reset']:
            raise CommandError(f'Tenant "{slug}" already exists. Use --reset to recreate it.')
        if existing:
            User.objects.filter(tenant=existing).delete()
            existing.delete()

        dealer = data.get('dealership', {})
        tenant = Tenant.objects.create(
            slug=slug, name=opts['name'] or dealer.get('name', slug), gstin=dealer.get('gstin', ''),
            state=dealer.get('state', ''), state_code=dealer.get('stateCode', ''), profile=dealer,
        )

        Branch.objects.bulk_create(build_instance(Branch, tenant, b) for b in data['branches'])
        for key, model in COLLECTIONS:
            model.objects.bulk_create(build_instance(model, tenant, r) for r in data.get(key, []))
        sync_invoice_sequence(tenant)

        hq = Branch.objects.filter(tenant=tenant, is_headquarters=True).first()
        password = settings.DEMO_USER_PASSWORD
        for persona in data['users']:
            email = persona['email'].lower()
            if slug != 'bike-erp':
                local, domain = email.split('@')
                email = f'{local}+{slug}@{domain}'
            user = User(
                tenant=tenant, email=email, username=email, ref=persona['id'], name=persona['name'],
                role=persona['role'], avatar=persona.get('avatar', ''), department=persona.get('department', ''),
                two_factor_required=persona.get('twoFactorRequired', False), branch_ref=hq.ref if hq else '',
            )
            user.set_password(password)
            user.save()

        AuditLog.objects.create(tenant=tenant, user_name='System', user_role='System', action='TENANT_SEEDED',
                                entity_type='TENANT', entity_id=slug, timestamp=timezone.now())

        counts = ', '.join(f'{key}={model.objects.filter(tenant=tenant).count()}' for key, model in COLLECTIONS)
        self.stdout.write(self.style.SUCCESS(f'Seeded tenant "{slug}" (dates shifted {day_shift:+d}d): {counts}'))
        self.stdout.write(f'Login: any persona email, password "{password}"; 2FA OTP "{settings.DEMO_OTP}".')
