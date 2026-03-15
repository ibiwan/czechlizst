import { AddSpinnerIcon } from './icons/AddSpinnerIcon';
import { AddSpinnerLoader } from './icons/AddSpinnerLoader';

type AddSpinnerButtonProps = {
  label: string;
  loading: boolean;
  loadingLabel?: string;
  onClick: () => void;
  testId?: string;
};

export function AddSpinnerButton({
  label,
  loading,
  loadingLabel = 'Loading',
  onClick,
  testId
}: AddSpinnerButtonProps) {
  const labelText = loading ? loadingLabel : label;
  const labelMaxCh = Math.max(labelText.length + 4, 10);
  return (
    <button
      type="button"
      className="tw-add-spinner group"
      onClick={onClick}
      aria-label={labelText}
      data-testid={testId}
    >
      <span className="tw-add-spinner-lozenge">
        <span className="tw-add-spinner-icon-wrap">
          {loading ? (
            <AddSpinnerLoader className="tw-add-spinner-spinner" />
          ) : (
            <AddSpinnerIcon className="tw-add-spinner-icon" />
          )}
        </span>
      </span>

      <span
        className="tw-add-spinner-label-wrap"
        style={{ '--tw-add-spinner-max-ch': `${labelMaxCh}ch` } as React.CSSProperties}
      >
        <span className="tw-add-spinner-label">{labelText}</span>
      </span>
    </button>
  );
}
