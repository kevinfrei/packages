import { Spinner, SpinnerProps } from '@fluentui/react-components';
import { hasField } from '@freik/typechk';
import React from 'react';
import { Suspense } from 'react';

export type SpinnerUIProps = SpinnerProps & {
  children: React.JSX.Element | React.JSX.Element[];
};

export function SpinSuspense(
  props: Partial<SpinnerUIProps>,
): React.JSX.Element {
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
