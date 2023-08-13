import React from 'react';

const fullPageSize: React.CSSProperties = {
  position: 'fixed',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignContent: 'stretch',
  alignItems: 'stretch',
  top: 0,
  left: 0,
};

export type FullPageProps = {
  style?: React.CSSProperties;
  className?: string;
  children?: JSX.Element | string | (JSX.Element | string)[];
};

export function FullPage({
  style,
  className,
  children,
}: FullPageProps): JSX.Element {
  const newStyle = { ...fullPageSize, ...style };
  return (
    <div className={className || ''} style={newStyle}>
      {children}
    </div>
  );
}
