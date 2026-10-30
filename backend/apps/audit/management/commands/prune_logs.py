from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.audit.models import RequestLog


class Command(BaseCommand):
    help = 'Delete API request logs older than REQUEST_LOG_RETENTION_DAYS (audit logs are never pruned).'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=settings.REQUEST_LOG_RETENTION_DAYS)

    def handle(self, *args, **opts):
        cutoff = timezone.now() - timedelta(days=opts['days'])
        deleted, _ = RequestLog.objects.filter(timestamp__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} request logs older than {opts["days"]} days.'))
