import { Spinner, SpinnerProps } from '@fluentui/react-components';
import { hasField } from '@freik/typechk';
import { Suspense } from 'react';

export type SpinnerUIProps = SpinnerProps & {
  children: JSX.Element | JSX.Element[];
};

export function SpinSuspense(props: Partial<SpinnerUIProps>): JSX.Element {
  const children = hasField(props, 'children') ? props.children : <></>;
  const theProps: SpinnerProps = {
    label: 'Please wait...',
    labelPosition: 'below',
    ...props,
  };
  const theSpinner = (
    <div className="mySpinner">
      <Spinner {...theProps} />
    </div>
  );
  return <Suspense fallback={theSpinner}>{children}</Suspense>;
}
