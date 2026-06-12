import { Spinner as FluentSpinner } from '@fluentui/react-components';
import { ReactElement, Suspense } from 'react';

export type SpinnerProps = {
  children: React.JSX.Element | React.JSX.Element[];
  label?: string | ReactElement;
  position?: 'before' | 'after' | 'above' | 'below';
  size?:
    | 'small'
    | 'medium'
    | 'large'
    | 'tiny'
    | 'extra-small'
    | 'extra-large'
    | 'huge'
    | 'extra-tiny';
};

export function Spinner({
  children,
  label,
  position,
  size,
}: SpinnerProps): React.JSX.Element {
  const theLabel = label || 'Please wait...';
  const pos = position || 'after';
  const sz = size || 'medium';
  const theSpinner = (
    <div className="mySpinner">
      <FluentSpinner label={theLabel} labelPosition={pos} size={sz} />
    </div>
  );
  return <Suspense fallback={theSpinner}>{children}</Suspense>;
}
