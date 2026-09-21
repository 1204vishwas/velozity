import React from 'react';
import { Project } from '../../types';
import { Link } from 'react-router-dom';
import { Building2, User, ArrowRight, Layers } from 'lucide-react';

export const ProjectCard: React.FC<{
  project: Project;
  onEdit?: (project: Project) => void;
  canEdit?: boolean;
}> = ({ project, onEdit, canEdit = false }) => {
  const taskCount = project._count?.tasks ?? project.tasks?.length ?? 0;

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
    PLANNING: { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/60' },
    COMPLETED: { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700/60' },
    ARCHIVED: { bg: 'bg-slate-900', text: 'text-slate-500', border: 'border-slate-800' },
  };

  const statusStyle = statusColors[project.status] || statusColors.ACTIVE;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header: Company & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-brand-400 font-medium truncate">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{project.client?.company || 'Client'}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {project.status}
          </span>
        </div>

        {/* Project Name & Description */}
        <div>
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/60 space-y-3">
        {/* Metadata: Manager & Tasks */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.manager?.name || 'Manager'}</span>
          </div>
          <div className="flex items-center space-x-1 font-medium text-slate-300">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>{taskCount} tasks</span>
          </div>
        </div>

        {/* Links / Actions */}
        <div className="flex items-center justify-between pt-1">
          {canEdit && onEdit ? (
            <button
              onClick={() => onEdit(project)}
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
            >
              Edit Settings
            </button>
          ) : (
            <div></div>
          )}

          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>View Board</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
