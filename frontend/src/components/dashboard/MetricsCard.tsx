import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'purple';
  subtext?: string;
  badgeText?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'brand',
  subtext,
  badgeText,
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-950/60',
      border: 'border-brand-800/50',
      iconBg: 'bg-brand-900/60',
      iconText: 'text-brand-400',
    },
    emerald: {
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-800/50',
      iconBg: 'bg-emerald-900/60',
      iconText: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-950/60',
      border: 'border-amber-800/50',
      iconBg: 'bg-amber-900/60',
      iconText: 'text-amber-400',
    },
    rose: {
      bg: 'bg-rose-950/60',
      border: 'border-rose-800/50',
      iconBg: 'bg-rose-900/60',
      iconText: 'text-rose-400',
    },
    purple: {
      bg: 'bg-purple-950/60',
      border: 'border-purple-800/50',
      iconBg: 'bg-purple-900/60',
      iconText: 'text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${scheme.iconBg} ${scheme.iconText}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scheme.bg} ${scheme.iconText} ${scheme.border}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
