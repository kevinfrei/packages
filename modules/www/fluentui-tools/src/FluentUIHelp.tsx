import { Spinner, SpinnerProps } from '@fluentui/react-components';
import { hasField } from '@freik/typechk';
import React, { ReactNode } from 'react';
import { Suspense } from 'react';

export type SpinnerUIProps = SpinnerProps & {
  children?: ReactNode;
};

export function SpinSuspense(
  props: Partial<SpinnerUIProps & { className: string }>,
): React.JSX.Element {
  const children = hasField(props, 'children') ? props.children : <></>;
  const theProps: SpinnerProps = {
    label: 'Please wait...',
    labelPosition: 'below',
    ...props,
  };
  const theSpinner = (
    <div className={props.className || 'mySpinner'}>
      <Spinner {...theProps} />
    </div>
  );
  return <Suspense fallback={theSpinner}>{children}</Suspense>;
}
