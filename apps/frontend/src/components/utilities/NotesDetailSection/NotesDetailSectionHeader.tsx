import { type ReactNode } from 'react';

type NotesDetailSectionHeaderProps = {
  headerAction?: ReactNode;
  testId?: string;
  title: string;
  titleNode?: ReactNode;
};

export function NotesDetailSectionHeader({
  headerAction,
  testId,
  title,
  titleNode
}: NotesDetailSectionHeaderProps) {
  return (
    <div className="panel-header" data-testid={testId}>
      {titleNode ?? <h3 className="panel-title detail-title">{title}</h3>}
      {headerAction}
    </div>
  );
}
