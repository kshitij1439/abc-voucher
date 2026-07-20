const StatsCard = ({ label, value, icon: Icon, accent = false }) => {
  return (
    <div className={`bg-white rounded-lg border px-5 py-4 ${accent ? 'border-teal-200' : 'border-stone-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold text-stone-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded flex items-center justify-center ${accent ? 'bg-teal-50 text-teal-600' : 'bg-stone-50 text-stone-400'}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
