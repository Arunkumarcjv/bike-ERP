from django.contrib import admin

from .models import Branch, Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'gstin', 'is_active', 'created_at')
    search_fields = ('name', 'slug')


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'ref', 'tenant', 'bays', 'is_headquarters')
    list_filter = ('tenant',)
