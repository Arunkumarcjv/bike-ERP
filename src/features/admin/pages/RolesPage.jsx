import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Copy, 
  Plus, 
  Save, 
  Check, 
  X, 
  Users, 
  Sliders, 
  Search,
  AlertCircle
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../../config/permissions';
import { toast } from 'sonner';

// Group permissions by functional area for matrix layout
const PERMISSION_GROUPS = [
  {
    area: 'Operations & Sales',
    permissions: [
      { key: PERMISSIONS.LEAD_VIEW_ALL, label: 'View All Leads', desc: 'Can see leads from all sales executives' },
      { key: PERMISSIONS.LEAD_CREATE, label: 'Create Leads', desc: 'Capture customer walk-ins & queries' },
      { key: PERMISSIONS.QUOTATION_CREATE, label: 'Create Quotations', desc: 'Generate price breakdown quotes' },
      { key: PERMISSIONS.DISCOUNT_APPROVE, label: 'Approve Discounts', desc: 'Authorise discounts over executive limits' },
      { key: PERMISSIONS.BOOKING_CREATE, label: 'Create Bookings', desc: 'Collect advance & lock customer order' },
      { key: PERMISSIONS.ALLOCATION_MANAGE, label: 'Chassis Allocation', desc: 'Assign physical VIN/Chassis to booking' },
      { key: PERMISSIONS.DELIVERY_MANAGE, label: 'Gate Pass & Delivery', desc: 'Sign off final PDI and gate passes' },
      { key: PERMISSIONS.FLEET_MANAGE, label: 'Fleet & B2B Sales', desc: 'Bulk commercial deals and tender bids' },
    ]
  },
  {
    area: 'Workshop & Service',
    permissions: [
      { key: PERMISSIONS.SERVICE_APPOINTMENTS_MANAGE, label: 'Manage Appointments', desc: 'Slot service check-ins' },
      { key: PERMISSIONS.JOBCARD_CREATE, label: 'Open Job Cards', desc: 'Perform check-in inspection & issue JC' },
      { key: PERMISSIONS.BAY_MANAGE, label: 'Bay Allocation', desc: 'Assign service bays to active jobs' },
      { key: PERMISSIONS.QC_SIGN, label: 'Quality Check Sign-off', desc: 'Authorise post-service road test' },
      { key: PERMISSIONS.DVI_MANAGE, label: 'Digital Inspection (DVI)', desc: 'Run digital vehicle inspections & photo evidence' },
      { key: PERMISSIONS.PICKUP_MANAGE, label: 'Pickup & Drop', desc: 'Assign drivers and monitor transit' },
      { key: PERMISSIONS.RECALLS_MANAGE, label: 'Recalls & Service Bulletins', desc: 'Execute OEM safety recall campaigns' },
    ]
  },
  {
    area: 'Customer Care & CRM',
    permissions: [
      { key: PERMISSIONS.CUSTOMER_VIEW, label: 'View Customers', desc: 'Access Customer 360 dossiers' },
      { key: PERMISSIONS.CUSTOMER_PHONE_VIEW_FULL, label: 'Full Phone Access', desc: 'View unmasked customer mobile numbers' },
      { key: PERMISSIONS.COMPLAINTS_MANAGE, label: 'Manage Complaints', desc: 'Resolve customer grievances & SLA alerts' },
      { key: PERMISSIONS.FEEDBACK_VIEW, label: 'Feedback & NPS', desc: 'Monitor customer satisfaction surveys' },
      { key: PERMISSIONS.LOYALTY_MANAGE, label: 'Loyalty & Rewards', desc: 'Manage member tiers and referral points' },
      { key: PERMISSIONS.ROADSIDE_MANAGE, label: 'Roadside Assistance', desc: 'Dispatch breakdown response & tow trucks' },
      { key: PERMISSIONS.DOCUMENTS_VIEW, label: 'Document Vault', desc: 'Access KYC, RC & Insurance documents' },
    ]
  },
  {
    area: 'Finance & Accounts',
    permissions: [
      { key: PERMISSIONS.INVOICE_CREATE, label: 'Generate Invoices', desc: 'Create vehicle & service tax invoices' },
      { key: PERMISSIONS.INVOICE_POST, label: 'Post to Ledger', desc: 'Commit invoice to statutory books' },
      { key: PERMISSIONS.INVOICE_CANCEL, label: 'Cancel Invoices', desc: 'Requires dual control & justification' },
      { key: PERMISSIONS.ACCOUNTS_VIEW, label: 'Financial Statements', desc: 'View Trial Balance, P&L, Balance Sheet' },
      { key: PERMISSIONS.PERIOD_LOCK, label: 'Accounting Period Lock', desc: 'Lock financial month-end periods' },
      { key: PERMISSIONS.COLLECTIONS_MANAGE, label: 'Collections & Receivables', desc: 'Manage credit ageing & recovery' },
      { key: PERMISSIONS.EXPENSES_MANAGE, label: 'Petty Cash & Expenses', desc: 'Approve expense vouchers' },
      { key: PERMISSIONS.BANK_RECON_MANAGE, label: 'Bank Reconciliation', desc: 'Match bank feed with ERP books' },
      { key: PERMISSIONS.DAY_CLOSE_MANAGE, label: 'Day-End Cash Closing', desc: 'Cash denomination count & signoff' },
      { key: PERMISSIONS.COST_VIEW, label: 'Cost & Profit Margins', desc: 'View vehicle purchase cost & gross margin' },
    ]
  },
  {
    area: 'Administration & Governance',
    permissions: [
      { key: PERMISSIONS.USERS_MANAGE, label: 'Manage Staff Accounts', desc: 'Create, lock and assign branches to staff' },
      { key: PERMISSIONS.ROLES_MANAGE, label: 'Manage Roles & RBAC', desc: 'Modify access permission matrices' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Dealership Settings', desc: 'Change tax rates, branch GSTINs, targets' },
      { key: PERMISSIONS.AUDIT_VIEW, label: 'Audit Trail Access', desc: 'View immutable system event logs' },
      { key: PERMISSIONS.APPROVALS_MANAGE, label: 'Approvals Hub', desc: 'Review dual-control workflow requests' },
      { key: PERMISSIONS.PRIVACY_MANAGE, label: 'Privacy & DPDP Consent', desc: 'Manage customer data consent records' },
    ]
  }
];

export function RolesPage() {
  const [roles, setRoles] = useState([
    { id: 'super-admin', name: ROLES.SUPER_ADMIN, isSystem: true, usersCount: 1, permissions: Object.values(PERMISSIONS) },
    { id: 'sales-manager', name: ROLES.SALES_MANAGER, isSystem: true, usersCount: 2, permissions: ROLE_PERMISSIONS[ROLES.SALES_MANAGER] || [] },
    { id: 'sales-exec', name: ROLES.SALES_EXECUTIVE, isSystem: true, usersCount: 5, permissions: ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE] || [] },
    { id: 'service-manager', name: ROLES.SERVICE_MANAGER, isSystem: true, usersCount: 1, permissions: ROLE_PERMISSIONS[ROLES.SERVICE_MANAGER] || [] },
    { id: 'service-advisor', name: ROLES.SERVICE_ADVISOR, isSystem: true, usersCount: 3, permissions: ROLE_PERMISSIONS[ROLES.SERVICE_ADVISOR] || [] },
    { id: 'technician', name: ROLES.TECHNICIAN, isSystem: true, usersCount: 8, permissions: ROLE_PERMISSIONS[ROLES.TECHNICIAN] || [] },
    { id: 'accountant', name: ROLES.ACCOUNTANT, isSystem: true, usersCount: 2, permissions: ROLE_PERMISSIONS[ROLES.ACCOUNTANT] || [] },
    { id: 'inventory-manager', name: ROLES.INVENTORY_MANAGER, isSystem: true, usersCount: 1, permissions: ROLE_PERMISSIONS[ROLES.INVENTORY_MANAGER] || [] },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState('sales-manager');
  const [searchFilter, setSearchFilter] = useState('');
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const currentRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permKey) => {
    if (currentRole.id === 'super-admin') {
      toast.warning('Super Admin permissions cannot be restricted (system root role)');
      return;
    }

    setRoles(prevRoles => prevRoles.map(r => {
      if (r.id !== currentRole.id) return r;
      const exists = r.permissions.includes(permKey);
      const updated = exists 
        ? r.permissions.filter(p => p !== permKey)
        : [...r.permissions, permKey];
      return { ...r, permissions: updated };
    }));
  };

  const handleCloneRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    const clonedId = `role-${Date.now()}`;
    const newRole = {
      id: clonedId,
      name: newRoleName.trim(),
      isSystem: false,
      usersCount: 0,
      permissions: [...currentRole.permissions],
    };

    setRoles(prev => [...prev, newRole]);
    setSelectedRoleId(clonedId);
    setNewRoleName('');
    setShowCloneModal(false);
    toast.success(`Role "${newRole.name}" created with permissions cloned from "${currentRole.name}"`);
  };

  const handleSaveRole = () => {
    toast.success(`Permissions matrix updated for ${currentRole.name}`);
  };

  const filteredGroups = PERMISSION_GROUPS.map(group => ({
    ...group,
    permissions: group.permissions.filter(p => 
      p.label.toLowerCase().includes(searchFilter.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.key.toLowerCase().includes(searchFilter.toLowerCase())
    )
  })).filter(group => group.permissions.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              RBAC v2.4
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure granular capability flags across 6 operational areas. System roles are baseline secured.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            Clone Selected Role
          </button>
          <button
            onClick={handleSaveRole}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Grid: Roles sidebar + Permissions editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Roles List */}
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Defined Roles ({roles.length})</span>
            <Users className="w-3.5 h-3.5" />
          </div>

          {roles.map(role => {
            const isSelected = role.id === selectedRoleId;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate">{role.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>{role.permissions.length} perms</span>
                      <span>•</span>
                      <span>{role.usersCount} users</span>
                    </div>
                  </div>
                </div>

                {role.isSystem && (
                  <span title="System Core Role (Protected)" className="text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Permissions Configuration Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentRole.name}
                </h2>
                {currentRole.isSystem ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <Lock className="w-3 h-3" /> System Role
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Custom Role
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enabled capabilities: {currentRole.permissions.length} of {Object.keys(PERMISSIONS).length} system permissions
              </p>
            </div>

            {/* Filter */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search capabilities..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {currentRole.id === 'super-admin' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Super Administrator has unconditional root access</p>
                <p className="text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                  To prevent locking yourself out of critical operational modules, permissions cannot be disabled for Super Admin.
                </p>
              </div>
            </div>
          )}

          {/* Matrix by Functional Area */}
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div key={group.area} className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    {group.area}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {group.permissions.filter(p => currentRole.permissions.includes(p.key)).length} / {group.permissions.length} active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.permissions.map((perm) => {
                    const isGranted = currentRole.permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition ${
                          isGranted ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <div className="pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {perm.label}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {perm.key}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {perm.desc}
                          </p>
                        </div>

                        {/* Toggle switch checkbox */}
                        <div className="relative inline-flex items-center shrink-0">
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => {}} // Handled by parent div
                            disabled={currentRole.id === 'super-admin'}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full peer transition-colors ${
                            isGranted ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clone Role Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600" />
                Clone Role
              </h3>
              <button 
                onClick={() => setShowCloneModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a custom role based on <strong>{currentRole.name}</strong> with all current permission flags pre-populated.
            </p>

            <form onSubmit={handleCloneRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Role Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Service Advisor, Fleet Specialist"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create Cloned Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;
