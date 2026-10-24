import { useAppStore } from '../../store';

/**
 * Shared Approvals Engine Service
 * Enforces dual-control governance: a requester cannot approve their own request.
 */

export const approvalsService = {
  getApprovals() {
    return useAppStore.getState().approvals || [];
  },

  createApprovalRequest({
    type, // 'discount', 'refund', 'booking_cancellation', 'stock_adjustment', 'journal_voucher', 'campaign', 'period_reopen', 'purchase_order', 'credit_note', 'expense'
    entityId,
    entityType,
    title,
    amountPaise = 0,
    thresholdPaise = 0,
    reason,
    ruleTriggered,
    escalationHours = 4,
  }) {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;

    const newApproval = {
      id: `appr-${Date.now()}`,
      type,
      entityId,
      entityType: entityType || type.toUpperCase(),
      title,
      requestedBy: currentUser?.name || 'Sales Staff',
      requestedByRole: currentUser?.role || 'Staff',
      requestedById: currentUser?.id || 'staff',
      requestedAt: new Date().toISOString(),
      amountPaise,
      thresholdPaise,
      reason,
      ruleTriggered: ruleTriggered || `Amount exceeds threshold of ₹${Math.round(thresholdPaise / 100)}`,
      escalationHours,
      status: 'PENDING', // PENDING, APPROVED, REJECTED
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
    };

    const currentList = state.approvals || [];
    useAppStore.setState({ approvals: [newApproval, ...currentList] });

    if (state.logAudit) {
      state.logAudit('APPROVAL_REQUESTED', 'APPROVAL', newApproval.id, null, newApproval);
    }

    return newApproval;
  },

  approveRequest(approvalId, reviewerReason = '') {
    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const item = currentList.find((a) => a.id === approvalId);

    if (!item) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    // MANDATORY DUAL-CONTROL RULE: Requester cannot approve their own request
    if (item.requestedById === currentUser?.id || item.requestedBy === currentUser?.name) {
      throw new Error('Dual-control violation: You cannot approve your own request.');
    }

    const updated = {
      ...item,
      status: 'APPROVED',
      reviewedBy: currentUser?.name || 'Supervisor',
      reviewedAt: new Date().toISOString(),
      reviewerReason: reviewerReason || 'Approved under delegation authority',
    };

    useAppStore.setState({
      approvals: currentList.map((a) => (a.id === approvalId ? updated : a)),
    });

    if (state.logAudit) {
      state.logAudit('APPROVAL_GRANTED', 'APPROVAL', approvalId, item, updated);
    }

    return updated;
  },

  rejectRequest(approvalId, rejectionReason) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('A mandatory reason must be provided when rejecting an approval request.');
    }

    const state = useAppStore.getState();
    const currentUser = state.currentUser;
    const currentList = state.approvals || [];
    const item = currentList.find((a) => a.id === approvalId);

    if (!item) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    const updated = {
      ...item,
      status: 'REJECTED',
      reviewedBy: currentUser?.name || 'Supervisor',
      reviewedAt: new Date().toISOString(),
      rejectionReason,
    };

    useAppStore.setState({
      approvals: currentList.map((a) => (a.id === approvalId ? updated : a)),
    });

    if (state.logAudit) {
      state.logAudit('APPROVAL_REJECTED', 'APPROVAL', approvalId, item, updated);
    }

    return updated;
  },
};
