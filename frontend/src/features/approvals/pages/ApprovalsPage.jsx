import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { useAppStore } from '../../../store';
import { approvalsService } from '../../../services/api/approvals';
import { formatMoney } from '../../../lib/format';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  User,
  Filter,
  FileText,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export function ApprovalsPage() {
  const state = useAppStore();
  const currentUser = state.currentUser;
  const approvals = state.approvals || [];

  const [activeTab, setActiveTab] = useState('PENDING_ME'); // 'PENDING_ME', 'REQUESTED_ME', 'HISTORY'
  const [search, setSearch] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' or 'REJECT'
  const [actionReason, setActionReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Filter approvals by tab
  const filteredApprovals = approvals.filter((item) => {
    const isMine =
      item.requestedById === currentUser?.id || item.requestedBy === currentUser?.name;

    if (activeTab === 'PENDING_ME') {
      if (item.status !== 'PENDING' || isMine) return false;
    } else if (activeTab === 'REQUESTED_ME') {
      if (!isMine) return false;
    } else if (activeTab === 'HISTORY') {
      if (item.status === 'PENDING') return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        item.title?.toLowerCase().includes(q) ||
        item.requestedBy?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleOpenAction = (approval, type) => {
    setSelectedApproval(approval);
    setActionType(type);
    setActionReason(type === 'APPROVE' ? 'Approved under managerial authority.' : '');
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApproval) return;
    try {
      if (actionType === 'APPROVE') {
        approvalsService.approveRequest(selectedApproval.id, actionReason);
        toast.success(`Approval granted for ${selectedApproval.title}`);
      } else {
        if (!actionReason.trim()) {
          toast.error('Rejection reason is mandatory.');
          return;
        }
        approvalsService.rejectRequest(selectedApproval.id, actionReason);
        toast.error(`Request rejected: ${selectedApproval.title}`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Dual-Control Approvals Center
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Strict statutory governance: discounts, refunds, write-offs, journal entries, and campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Dual-Control Active: Requesters cannot self-approve.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('PENDING_ME')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'PENDING_ME'
              ? 'border-primary text-primary bg-surface shadow-xs font-semibold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span>Pending for Me</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-900 font-bold">
            {approvals.filter((a) => a.status === 'PENDING' && a.requestedBy !== currentUser?.name).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REQUESTED_ME')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'REQUESTED_ME'
              ? 'border-primary text-primary bg-surface shadow-xs font-semibold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span>Requested by Me</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-medium">
            {approvals.filter((a) => a.requestedBy === currentUser?.name).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'border-primary text-primary bg-surface shadow-xs font-semibold'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span>Approval History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
            {approvals.filter((a) => a.status !== 'PENDING').length}
          </span>
        </button>
      </div>

      {/* Search & Filter */}
      <Card className="p-3.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by Request ID, title, requester name, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </Card>

      {/* Approvals Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle text-text-muted uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Request Summary</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Requester</th>
                <th className="p-3">Triggered Governance Rule</th>
                <th className="p-3">SLA / Escalation</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted">
                    No approval requests found in this view.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{item.id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-text-main">{item.title}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{item.reason}</div>
                    </td>
                    <td className="p-3 font-mono font-bold tabular-nums text-text-main">
                      {item.amountPaise ? formatMoney(item.amountPaise) : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-text-main">{item.requestedBy}</div>
                      <div className="text-[10px] text-text-muted">{item.requestedByRole || 'Staff'}</div>
                    </td>
                    <td className="p-3 text-text-muted text-[11px] max-w-xs truncate">
                      {item.ruleTriggered}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.escalationHours ? `${item.escalationHours}h SLA` : '4h SLA'}
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        status={
                          item.status === 'APPROVED'
                            ? 'Approved'
                            : item.status === 'REJECTED'
                            ? 'Rejected'
                            : 'Pending'
                        }
                        label={item.status}
                      />
                    </td>
                    <td className="p-3 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenAction(item, 'APPROVE')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAction(item, 'REJECT')}
                            className="text-red-600 hover:bg-red-50 text-[11px] h-7 px-2"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-muted">
                          {item.reviewedBy ? `By ${item.reviewedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Decision Modal */}
      {modalOpen && selectedApproval && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`${actionType === 'APPROVE' ? 'Approve' : 'Reject'} Request: ${selectedApproval.title}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-card bg-surface-subtle border border-border space-y-1">
              <div>
                <span className="text-text-muted">Requester:</span>{' '}
                <strong>{selectedApproval.requestedBy}</strong> ({selectedApproval.requestedByRole})
              </div>
              <div>
                <span className="text-text-muted">Amount Involved:</span>{' '}
                <strong className="font-mono text-primary">
                  {selectedApproval.amountPaise ? formatMoney(selectedApproval.amountPaise) : 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-text-muted">Justification:</span>{' '}
                <span>{selectedApproval.reason}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-main block mb-1">
                {actionType === 'APPROVE'
                  ? 'Managerial Approval Note (Optional)'
                  : 'Mandatory Rejection Justification *'}
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'Add any conditions or remarks for audit logs...'
                    : 'Explain why this discount, refund, or transaction is rejected...'
                }
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
                onClick={handleConfirmAction}
                className={actionType === 'APPROVE' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}
              >
                {actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ApprovalsPage;

