import uuid

from django.db import models


class Tenant(models.Model):
    """A dealership organisation. Every business record belongs to exactly one tenant."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=63, unique=True)
    name = models.CharField(max_length=200)
    gstin = models.CharField(max_length=15, blank=True)
    state = models.CharField(max_length=64, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    profile = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


def generate_ref(prefix='rec'):
    return f'{prefix}-{uuid.uuid4().hex[:12]}'


class TenantScopedModel(models.Model):
    """
    Base for tenant-owned rows. `ref` is the public string id (e.g. "jc-2627-001") and is
    unique per tenant, so each dealership keeps the same ids the frontend already uses.
    """

    REF_PREFIX = 'rec'

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='+')
    ref = models.CharField(max_length=64)
    # Frontend-specific attributes that are not queried server-side are kept verbatim here.
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.ref:
            self.ref = generate_ref(self.REF_PREFIX)
        super().save(*args, **kwargs)


class Branch(TenantScopedModel):
    REF_PREFIX = 'br'

    code = models.CharField(max_length=32)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    gstin = models.CharField(max_length=15, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    bays = models.PositiveIntegerField(default=0)
    is_headquarters = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_headquarters', 'name']
        constraints = [models.UniqueConstraint(fields=['tenant', 'ref'], name='uniq_branch_ref')]

    def __str__(self):
        return self.name
