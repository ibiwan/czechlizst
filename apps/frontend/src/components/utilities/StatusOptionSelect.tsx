import {
  canTransitionWorkStatus,
  getWorkStatusTransitionReason,
  type WorkStatus,
  workStatuses
} from '@app/contracts';

type StatusOptionSelectProps = {
  className: string;
  currentStatus: WorkStatus;
  disabled: boolean;
  onChange: (status: WorkStatus) => void;
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => void;
  testId?: string;
};

export function StatusOptionSelect({
  className,
  currentStatus,
  disabled,
  onChange,
  onClick,
  testId
}: StatusOptionSelectProps) {
  return (
    <select
      className={className}
      value={currentStatus}
      disabled={disabled}
      onClick={onClick}
      onChange={(event) => onChange(event.target.value as WorkStatus)}
      data-testid={testId}
    >
      {workStatuses.map((candidate) => {
        const allowed =
          candidate === currentStatus || canTransitionWorkStatus(currentStatus, candidate);
        const reason = getWorkStatusTransitionReason(currentStatus, candidate);
        return (
          <option
            key={candidate}
            value={candidate}
            disabled={!allowed}
            title={reason ?? undefined}
          >
            {allowed || candidate === currentStatus
              ? candidate
              : `${candidate} (not allowed)`}
          </option>
        );
      })}
    </select>
  );
}
