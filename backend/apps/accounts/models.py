from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from apps.tenants.models import Tenant


class Role(models.TextChoices):
    SUPER_ADMIN = 'Super Admin'
    SALES_MANAGER = 'Sales Manager'
    SALES_EXECUTIVE = 'Sales Executive'
    SERVICE_MANAGER = 'Service Manager'
    SERVICE_ADVISOR = 'Service Advisor'
    TECHNICIAN = 'Technician'
    ACCOUNTANT = 'Accountant'
    INVENTORY_MANAGER = 'Inventory Manager'


class EmailUserManager(UserManager):
    def create_user(self, email, password=None, **extra):
        extra.setdefault('username', email)
        return super().create_user(email=email, password=password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('username', email)
        return super().create_superuser(email=email, password=password, **extra)


class User(AbstractUser):
    """Staff account. `tenant` is null only for platform staff (Django superusers)."""

    email = models.EmailField(unique=True)
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.CASCADE, related_name='users')
    ref = models.CharField(max_length=64, blank=True, help_text='Persona id used by the frontend, e.g. "super-admin".')
    name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.SALES_EXECUTIVE)
    avatar = models.CharField(max_length=4, blank=True)
    department = models.CharField(max_length=64, blank=True)
    branch_ref = models.CharField(max_length=64, blank=True)
    two_factor_required = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = EmailUserManager()

    def __str__(self):
        return f'{self.name or self.email} ({self.role})'
