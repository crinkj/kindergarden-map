import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-gray-400">{icon}</div>}
      <p className="text-base font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
