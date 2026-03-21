import {
  canTransitionWorkStatus,
  getWorkStatusTransitionReason,
  storedWorkStatuses,
  type StoredWorkStatus
} from '@app/contracts';

type StatusOptionSelectProps = {
  className: string;
  currentStatus: StoredWorkStatus;
  disabled: boolean;
  getOptionReason?: (status: StoredWorkStatus) => string | null;
  isOptionAllowed?: (status: StoredWorkStatus) => boolean;
  onChange: (status: StoredWorkStatus) => void;
  onClick?: (event: React.MouseEvent<HTMLSelectElement>) => void;
  options?: readonly StoredWorkStatus[];
  testId?: string;
};

export function StatusOptionSelect({
  className,
  currentStatus,
  disabled,
  getOptionReason,
  isOptionAllowed,
  onChange,
  onClick,
  options = storedWorkStatuses,
  testId
}: StatusOptionSelectProps) {
  const visibleOptions = options.includes(currentStatus) ? options : [currentStatus, ...options];

  return (
    <select
      className={className}
      value={currentStatus}
      disabled={disabled}
      onClick={onClick}
      onChange={(event) => onChange(event.target.value as StoredWorkStatus)}
      data-testid={testId}
    >
      {visibleOptions.map((candidate) => {
        const allowed = isOptionAllowed
          ? isOptionAllowed(candidate)
          : candidate === currentStatus || canTransitionWorkStatus(currentStatus, candidate);
        const reason = getOptionReason
          ? getOptionReason(candidate)
          : getWorkStatusTransitionReason(currentStatus, candidate);
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
