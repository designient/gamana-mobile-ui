import { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { Story, StorySource, StoryNotice, SourceType } from '../../types';
import TrustChip from '../shared/TrustChip';

interface TrustCardProps {
  story: Story;
  sources: StorySource[];
  notices: StoryNotice[];
}

const sourceTypeStyles: Record<SourceType, { label: string; cls: string }> = {
  academic: { label: 'Academic', cls: 'bg-safe-info/10 text-safe-info' },
  oral: { label: 'Oral', cls: 'bg-trust-legend/10 text-trust-legend' },
  archive: { label: 'Archive', cls: 'bg-trust-verified/10 text-trust-verified' },
  news: { label: 'News', cls: 'bg-gamana-100 text-gamana-700' },
};

export default function TrustCard({ story, sources, notices }: TrustCardProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const hasSources = sources.length > 0;
  const hasNotices = notices.length > 0;

  return (
    <div className="mx-4 mt-4 bg-surface rounded-2xl shadow-card overflow-hidden">
      <div className="p-4">
        <div className="border-l-[3px] border-gamana-500 pl-3">
          <p className="text-xs font-semibold text-gamana-700 uppercase tracking-wider mb-1">Why this matters</p>
          <p className="text-sm text-heading leading-relaxed">{story.why_this_matters}</p>
        </div>
      </div>

      {hasNotices && (
        <>
          <div className="h-px bg-surface-muted mx-4" />
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Eye size={14} className="text-gamana-500" />
              <span className="text-xs font-semibold text-heading">What to notice right now</span>
            </div>
            <div className="space-y-2.5">
              {notices.map((notice) => (
                <div key={notice.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-trust-verified mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-secondary leading-relaxed">{notice.body}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-surface-muted mx-4" />
      <div className="px-4 py-3 flex items-center gap-2">
        <TrustChip level={story.trust_level} />
        {hasSources && (
          <span className="text-[11px] text-muted font-medium">
            Based on {sources.length} source{sources.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {hasSources && (
        <>
          <div className="h-px bg-surface-muted mx-4" />
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gamana-600 hover:bg-gamana-50/50 transition-colors"
          >
            <span>View sources</span>
            {sourcesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {sourcesExpanded && (
            <div className="px-4 pb-4 space-y-2.5 animate-fade-in">
              {sources.map((source) => {
                const style = sourceTypeStyles[source.source_type];
                return (
                  <div key={source.id} className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.cls}`}>
                      {style.label}
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-gamana-600 hover:text-gamana-700 truncate"
                    >
                      {source.label}
                    </a>
                    <ExternalLink size={12} className="text-faint flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
