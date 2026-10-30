from django.apps import AppConfig


class TenantsConfig(AppConfig):
    name = 'apps.tenants'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        from . import schema  # noqa: F401  registers the Swagger auth extension
