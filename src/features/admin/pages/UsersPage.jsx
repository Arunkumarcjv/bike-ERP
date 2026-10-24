import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { ROLES, ROLE_PRESETS } from '../../../config/roles';
import { BRANCHES } from '../../../config/constants';
import {
  UserCog,
  Plus,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  History,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export function UsersPage() {
  const [users, setUsers] = useState([
    {
      id: 'usr-001',
      name: 'Rajesh Varma',
      email: 'rajesh.varma@bikeerpshowroom.com',
      phone: '+91 98450 11001',
      role: 'Super Admin',
      roleKey: 'SUPER_ADMIN',
      branch: 'Bangalore Central Flagship',
      branchId: 'br-blr-central',
      twoFactorEnabled: true,
      status: 'ACTIVE',
      lastLogin: 'Today, 09:15 AM',
      failedAttempts: 0,
      locked: false,
    },
    {
      id: 'usr-002',
      name: 'Anand Kumar',
      email: 'anand.kumar@bikeerpshowroom.com',
      phone: '+91 98450 22002',
      role: 'Sales Manager',
      roleKey: 'SALES_MANAGER',
      branch: 'Bangalore Central Flagship',
      branchId: 'br-blr-central',
      twoFactorEnabled: true,
      status: 'ACTIVE',
      lastLogin: 'Today, 10:20 AM',
      failedAttempts: 0,
      locked: false,
    },
    {
      id: 'usr-003',
      name: 'Pooja Iyer',
      email: 'pooja.iyer@bikeerpshowroom.com',
      phone: '+91 98450 33003',
      role: 'Accountant',
      roleKey: 'ACCOUNTANT',
      branch: 'Bangalore Central Flagship',
      branchId: 'br-blr-central',
      twoFactorEnabled: true,
      status: 'ACTIVE',
      lastLogin: 'Today, 09:30 AM',
      failedAttempts: 0,
      locked: false,
    },
    {
      id: 'usr-004',
      name: 'Suresh G.',
      email: 'suresh.g@bikeerpshowroom.com',
      phone: '+91 98450 44004',
      role: 'Service Manager',
      roleKey: 'SERVICE_MANAGER',
      branch: 'Bangalore Central Flagship',
      branchId: 'br-blr-central',
      twoFactorEnabled: false,
      status: 'ACTIVE',
      lastLogin: 'Today, 08:50 AM',
      failedAttempts: 0,
      locked: false,
    },
    {
      id: 'usr-005',
      name: 'Karthik Raja',
      email: 'karthik.raja@bikeerpshowroom.com',
      phone: '+91 98450 55005',
      role: 'Technician',
      roleKey: 'TECHNICIAN',
      branch: 'Bangalore Central Flagship',
      branchId: 'br-blr-central',
      twoFactorEnabled: false,
      status: 'ACTIVE',
      lastLogin: 'Today, 09:00 AM',
      failedAttempts: 1,
      locked: false,
    },
    {
      id: 'usr-006',
      name: 'Vikram Malhotra',
      email: 'vikram.m@bikeerpshowroom.com',
      phone: '+91 98450 66006',
      role: 'Sales Executive',
      roleKey: 'SALES_EXECUTIVE',
      branch: 'Indiranagar Experience Hub',
      branchId: 'br-blr-east',
      twoFactorEnabled: false,
      status: 'SUSPENDED',
      lastLogin: 'Yesterday, 06:15 PM',
      failedAttempts: 4,
      locked: true,
    },
  ]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserEdit, setCurrentUserEdit] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('SALES_EXECUTIVE');
  const [formBranch, setFormBranch] = useState('br-blr-central');
  const [form2Fa, setForm2Fa] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.branch.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setCurrentUserEdit(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('SALES_EXECUTIVE');
    setFormBranch('br-blr-central');
    setForm2Fa(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentUserEdit(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.roleKey);
    setFormBranch(user.branchId);
    setForm2Fa(user.twoFactorEnabled);
    setModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!formName || !formEmail) {
      toast.error('Name and email are required.');
      return;
    }

    const branchObj = BRANCHES.find((b) => b.id === formBranch);
    const roleObj = ROLES[formRole];

    if (currentUserEdit) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUserEdit.id
            ? {
                ...u,
                name: formName,
                email: formEmail,
                phone: formPhone,
                role: roleObj ? roleObj.label : formRole,
                roleKey: formRole,
                branch: branchObj ? branchObj.name : 'Main Hub',
                branchId: formBranch,
                twoFactorEnabled: form2Fa,
              }
            : u
        )
      );
      toast.success(`User ${formName} updated successfully.`);
    } else {
      const newUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: roleObj ? roleObj.label : formRole,
        roleKey: formRole,
        branch: branchObj ? branchObj.name : 'Main Hub',
        branchId: formBranch,
        twoFactorEnabled: form2Fa,
        status: 'ACTIVE',
        lastLogin: 'Never',
        failedAttempts: 0,
        locked: false,
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success(`Staff user ${formName} enrolled successfully.`);
    }
    setModalOpen(false);
  };

  const toggleLockout = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const locked = !u.locked;
          const status = locked ? 'SUSPENDED' : 'ACTIVE';
          toast.success(locked ? `Account for ${u.name} locked.` : `Account for ${u.name} unlocked.`);
          return { ...u, locked, status, failedAttempts: locked ? 4 : 0 };
        }
        return u;
      })
    );
  };

  const toggle2Fa = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const next = !u.twoFactorEnabled;
          toast.success(`2FA ${next ? 'enabled' : 'disabled'} for ${u.name}`);
          return { ...u, twoFactorEnabled: next };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            Users &amp; Staff Account Administration
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage staff credentials, 2-Factor Authentication enforcement, lockout states, and branch allocations.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} icon={Plus}>
          Add Staff User
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="p-3.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search staff by name, email, role, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role Persona</th>
                <th className="p-3">Assigned Branch</th>
                <th className="p-3 text-center">2FA Security</th>
                <th className="p-3">Status / Lockout</th>
                <th className="p-3">Last Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-text-main">{user.name}</div>
                    <div className="text-[11px] text-text-muted">{user.email} • {user.phone}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-text-main">{user.branch}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggle2Fa(user.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        user.twoFactorEnabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Click to toggle 2FA"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {user.twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={user.locked ? 'Rejected' : user.status === 'ACTIVE' ? 'Ready' : 'Draft'}
                        label={user.locked ? 'LOCKED OUT' : user.status}
                      />
                      {user.failedAttempts > 0 && (
                        <span className="text-[10px] font-mono text-status-red font-semibold">
                          ({user.failedAttempts} failed)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-text-muted font-mono text-[11px]">{user.lastLogin}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLockout(user.id)}
                        className={`text-[11px] h-7 px-2 ${user.locked ? 'text-green-600' : 'text-amber-600'}`}
                      >
                        {user.locked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 mr-1" /> Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 mr-1" /> Lock
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEdit(user)}
                        className="text-[11px] h-7 px-2"
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Create/Edit */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={currentUserEdit ? `Edit Staff: ${currentUserEdit.name}` : 'Enroll New Showroom Staff'}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-text-main block mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Ramesh Babu"
                className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-main block mb-1">Official Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ramesh@bikeerpshowroom.com"
                  className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-main block mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98450 77112"
                  className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-main block mb-1">Role Persona *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.keys(ROLES).map((rk) => (
                    <option key={rk} value={rk}>
                      {ROLES[rk].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-main block mb-1">Assigned Branch *</label>
                <select
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-surface-subtle border border-border rounded-card flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-main">Require Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-text-muted">Mandates SMS or TOTP OTP at login</div>
              </div>
              <input
                type="checkbox"
                checked={form2Fa}
                onChange={(e) => setForm2Fa(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                Save User Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UsersPage;

