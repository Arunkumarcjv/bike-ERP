from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'role', 'tenant', 'is_active', 'is_staff')
    list_filter = ('tenant', 'role', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AKASH Bajaj', {'fields': ('tenant', 'ref', 'name', 'role', 'avatar', 'department', 'branch_ref',
                                 'two_factor_required')}),
    )
