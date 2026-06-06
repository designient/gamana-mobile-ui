import type { ReactNode } from 'react';

interface DetailSectionProps {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  noBorder?: boolean;
}

export default function DetailSection({
  id,
  title,
  children,
  className = '',
  noBorder = false,
}: DetailSectionProps) {
  return (
    <section
      id={id}
      className={`px-4 py-5 ${noBorder ? '' : 'border-b border-gamana-100/70'} ${className}`}
    >
      {title && (
        <h2 className="text-sm font-semibold text-heading mb-3">{title}</h2>
      )}
      {children}
    </section>
  );
}
