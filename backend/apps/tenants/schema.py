from drf_spectacular.extensions import OpenApiAuthenticationExtension


class TenantJWTScheme(OpenApiAuthenticationExtension):
    """Shows the Bearer "Authorize" button in Swagger UI for TenantJWTAuthentication."""

    target_class = 'apps.tenants.authentication.TenantJWTAuthentication'
    name = 'jwtAuth'

    def get_security_definition(self, auto_schema):
        return {'type': 'http', 'scheme': 'bearer', 'bearerFormat': 'JWT'}
