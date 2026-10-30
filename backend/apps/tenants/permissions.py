from rest_framework.permissions import BasePermission


class IsTenantMember(BasePermission):
    message = 'Authentication with a tenant-bound account (or X-Tenant header for platform staff) is required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request, 'tenant', None))


class IsPlatformStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class HasRole(BasePermission):
    """
    Restricts unsafe methods (and custom actions) to the roles listed on the view.
    Views declare `write_roles = {...}` and optionally `action_roles = {'approve': {...}}`.
    Super Admin always passes.
    """

    message = 'Your role is not permitted to perform this action.'

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser or user.role == 'Super Admin':
            return True
        action = getattr(view, 'action', None)
        action_roles = getattr(view, 'action_roles', {})
        if action in action_roles:
            return user.role in action_roles[action]
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        write_roles = getattr(view, 'write_roles', None)
        return write_roles is None or user.role in write_roles
