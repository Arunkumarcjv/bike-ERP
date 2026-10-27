"""
Server-side port of src/store/selectors/dashboard.js + bayStats.js, so the API and the
React dashboard compute identical numbers. Dates are evaluated in Asia/Kolkata.
"""
from datetime import timedelta

from django.db.models import Count, F, Sum
from django.utils import timezone

from apps.erp.models import Bay, Booking, Invoice, JobCard, Lead, Part, VehicleUnit
from apps.erp.services import default_branch_ref

DAILY_VEHICLE_TARGET = 5
ITC_ESTIMATE_RATIO = 0.42


def bay_stats(tenant, branch_ref):
    bays = list(Bay.objects.filter(tenant=tenant, branch_id=branch_ref))
    stages = dict(JobCard.objects.filter(
        tenant=tenant, ref__in=[b.active_job_card_id for b in bays if b.active_job_card_id],
    ).values_list('ref', 'stage'))

    counts = {'occupied': 0, 'readyForDelivery': 0, 'waitingParts': 0, 'qualityCheck': 0, 'available': 0}
    for bay in bays:
        if not bay.active_job_card_id or bay.status in ('FREE', 'MAINTENANCE'):
            counts['available'] += 1
            continue
        stage = (stages.get(bay.active_job_card_id) or '').upper()
        if stage in ('READY', 'READY_FOR_DELIVERY'):
            counts['readyForDelivery'] += 1
        elif stage == 'WAITING_PARTS':
            counts['waitingParts'] += 1
        elif stage in ('QUALITY_CHECK', 'QC'):
            counts['qualityCheck'] += 1
        elif stage == 'IN_PROGRESS' or bay.status == 'OCCUPIED':
            counts['occupied'] += 1
        else:
            counts['available'] += 1
    total = len(bays)
    return {'total': total, **counts, 'utilisation': round(counts['occupied'] / total * 100) if total else 0}


def _day_bounds(day):
    start = timezone.localtime().replace(year=day.year, month=day.month, day=day.day,
                                         hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=1)


def dashboard_summary(tenant, branch_ref=None):
    branch_ref = branch_ref or default_branch_ref(tenant)
    now = timezone.localtime()
    posted = Invoice.objects.filter(tenant=tenant, status='POSTED')
    start, end = _day_bounds(now.date())
    today = posted.filter(date__gte=start, date__lt=end)

    totals = today.aggregate(gross=Sum('grand_total_paise'), tax=Sum('total_tax_paise'), count=Count('id'))
    gross = totals['gross'] or 0
    gst_output = totals['tax'] or 0
    vehicle_count = today.filter(type='VEHICLE_SALE').count()
    service_count = (totals['count'] or 0) - vehicle_count
    itc = round(gst_output * ITC_ESTIMATE_RATIO)
    bays = bay_stats(tenant, branch_ref)

    trend = []
    for offset in range(6, -1, -1):
        day = (now - timedelta(days=offset)).date()
        d_start, d_end = _day_bounds(day)
        agg = posted.filter(date__gte=d_start, date__lt=d_end).aggregate(t=Sum('grand_total_paise'), c=Count('id'))
        trend.append({'date': day.strftime('%m-%d'), 'revenueRupees': round((agg['t'] or 0) / 100),
                      'count': agg['c']})

    hourly = []
    today_rows = list(today.values('date', 'grand_total_paise'))
    for hour in range(9, max(9, min(now.hour, 21)) + 1):
        rows = [r for r in today_rows if timezone.localtime(r['date']).hour == hour]
        label = f'{hour:02d} AM' if hour < 12 else '12 PM' if hour == 12 else f'{hour - 12:02d} PM'
        hourly.append({'hour': label, 'revenue': round(sum(r['grand_total_paise'] for r in rows) / 100),
                       'count': len(rows)})

    vehicles = VehicleUnit.objects.filter(tenant=tenant)
    return {
        'branchId': branch_ref,
        'generatedAt': now.isoformat(),
        'grossSalesTodayPaise': gross,
        'invoicesClosedCount': totals['count'] or 0,
        'vehicleInvoicesCount': vehicle_count,
        'serviceInvoicesCount': service_count,
        'dailyVehicleTarget': DAILY_VEHICLE_TARGET,
        'vehicleTargetPercentage': round(vehicle_count / DAILY_VEHICLE_TARGET * 100),
        'bayStats': bays,
        'activeBaysCount': bays['occupied'],
        'readyBaysCount': bays['available'],
        'bayUtilisationPercentage': bays['utilisation'],
        'gstOutputTodayPaise': gst_output,
        'itcEstimateTodayPaise': itc,
        'netGstPayableTodayPaise': max(0, gst_output - itc),
        'stockSummary': {
            'freeVehiclesCount': vehicles.filter(status='IN_STOCK', allocated_booking_id__isnull=True).count(),
            'allocatedVehiclesCount': vehicles.filter(status='ALLOCATED').count(),
            'inTransitVehiclesCount': vehicles.filter(status='IN_TRANSIT').count(),
            'lowStockPartsCount': Part.objects.filter(tenant=tenant, stock_qty__lt=F('reorder_level')).count(),
        },
        'last7DaysTrend': trend,
        'hourlyTrend': hourly,
        'pendingLeadsCount': Lead.objects.filter(tenant=tenant).exclude(stage__in=('DELIVERY', 'LOST')).count(),
        'activeJobCardsCount': JobCard.objects.filter(tenant=tenant).exclude(stage='DELIVERED').count(),
        'openBookingsCount': Booking.objects.filter(tenant=tenant).exclude(status__in=('DELIVERED', 'CANCELLED')).count(),
    }
