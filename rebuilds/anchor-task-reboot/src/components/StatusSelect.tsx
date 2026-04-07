import * as Ariakit from '@ariakit/react';

import type { WorkStatus } from '../types';

const STATUSES: WorkStatus[] = ['todo', 'started', 'active', 'done', 'dropped'];

export function StatusSelect({
  disabled,
  onChange,
  value
}: {
  disabled?: boolean;
  onChange: (status: WorkStatus) => void;
  value: WorkStatus;
}) {
  return (
    <Ariakit.SelectProvider setValue={onChange} value={value}>
      <Ariakit.Select
        className={`status-pill status-select-trigger status-${value}`}
        disabled={disabled}
      >
        {value}
        <span className="status-select-caret" aria-hidden="true" />
      </Ariakit.Select>
      <Ariakit.SelectPopover className="status-select-popover" gutter={6}>
        {STATUSES.map((status) => (
          <Ariakit.SelectItem
            className={`status-select-item status-${status}`}
            key={status}
            value={status}
          >
            <span className="status-select-item-check">
              {value === status ? '✓' : ''}
            </span>
            <span className={`status-pill status-${status}`}>{status}</span>
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
