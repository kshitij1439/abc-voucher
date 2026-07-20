const statusConfig = {
  draft: {
    label: 'Draft',
    className: 'bg-stone-100 text-stone-600 border border-stone-300',
  },
  submitted: {
    label: 'Pending Approval',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
