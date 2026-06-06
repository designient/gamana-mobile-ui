import { useState } from 'react';
import { trackExperienceEvent } from '../../../lib/experience-analytics';

interface ExperienceDescriptionBlockProps {
  text: string;
  experienceId: string;
}

const PREVIEW_CHARS = 280;

export default function ExperienceDescriptionBlock({
  text,
  experienceId,
}: ExperienceDescriptionBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = text.length > PREVIEW_CHARS;
  const display = expanded || !needsCollapse ? text : `${text.slice(0, PREVIEW_CHARS).trim()}…`;

  return (
    <>
      <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{display}</p>
      {needsCollapse && (
        <button
          type="button"
          onClick={() => {
            setExpanded((e) => !e);
            if (!expanded) {
              trackExperienceEvent('experience_detail_section_viewed', {
                experienceId,
                section: 'description_expand',
              });
            }
          }}
          className="mt-3 text-xs font-semibold text-gamana-500"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </>
  );
}
