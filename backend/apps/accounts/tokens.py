from rest_framework_simplejwt.tokens import RefreshToken


def issue_tokens(user):
    """Refresh/access pair carrying tenant + role claims (checked by TenantJWTAuthentication)."""
    refresh = RefreshToken.for_user(user)
    refresh['tenant_id'] = str(user.tenant_id) if user.tenant_id else None
    refresh['tenant'] = user.tenant.slug if user.tenant_id else None
    refresh['role'] = user.role
    refresh['name'] = user.name
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}
