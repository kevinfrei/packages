import React from 'react';
import { isArray } from '@freik/typechk';
import { hasField, hasStrField } from '@freik/typechk';

export type CenterDirectionName = {
  direction?:
    | 'vertical'
    | 'horizontal'
    | 'v'
    | 'h'
    | 'row'
    | 'r'
    | 'column'
    | 'c'
    | 'both'
    | 'b'
    | 'hv';
};

export type CenterDirectionHorizontal =
  | { horizontal: boolean }
  | { column: boolean }
  | { col: boolean };
export type CenterDirectionVertical = { vertical: boolean } | { row: boolean };
export type CenterDirectionBoth =
  | { both: boolean }
  | (CenterDirectionHorizontal & CenterDirectionVertical);

export type CenterPropsBasics = {
  style?: React.CSSProperties;
  children?: React.JSX.Element | string | (React.JSX.Element | string)[];
};

export type CenterProps = (
  | CenterDirectionBoth
  | CenterDirectionHorizontal
  | CenterDirectionName
  | CenterDirectionVertical
) &
  CenterPropsBasics;

const centerBaseStyle: React.CSSProperties = {
  display: 'flex',
};

export function Center(props: CenterProps): React.JSX.Element {
  const divStyle = { ...centerBaseStyle, ...props.style };
  const h =
    hasField(props, 'horizontal') ||
    hasField(props, 'column') ||
    hasField(props, 'col') ||
    hasField(props, 'both') ||
    (hasStrField(props, 'direction') &&
      (props.direction[0] === 'h' ||
        props.direction[0] === 'c' ||
        props.direction[0] === 'b'));
  const v =
    hasField(props, 'vertical') ||
    hasField(props, 'row') ||
    hasField(props, 'both') ||
    (hasStrField(props, 'direction') &&
      (props.direction === 'hv' ||
        props.direction[0] === 'v' ||
        props.direction[0] === 'r' ||
        props.direction[0] === 'b'));
  if (h) {
    divStyle.flexDirection = 'column';
  } else if (v) {
    divStyle.flexDirection = 'row';
  }
  if (h || v) {
    divStyle.justifyContent = 'center';
  }
  if (h && v) {
    divStyle.alignItems = 'center';
  }
  return (
    <div className={`Center${h ? 'H' : ''}${v ? 'V' : ''}`} style={divStyle}>
      {props.children}
    </div>
  );
}

const dockStyle = new Map<
  string,
  'column' | 'column-reverse' | 'row' | 'row-reverse'
>([
  ['top', 'column'],
  ['bottom', 'column-reverse'],
  ['left', 'row'],
  ['right', 'row-reverse'],
]);

export type DockProps = {
  location: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
  children?: React.JSX.Element | string | (React.JSX.Element | string)[];
};

const theStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch', // Maybe switch to center based on something?
  alignContent: 'stretch',
  flexBasis: 'auto', // '100%',
};

export function Dock({
  location,
  style,
  children,
}: DockProps): React.JSX.Element {
  const mostChildren = isArray(children)
    ? children.slice(0, children.length - 1)
    : [];
  const lastChild = isArray(children)
    ? children[children.length - 1]
    : children;
  const flexDirection = dockStyle.get(location)!;
  const divStyle = {
    ...theStyle,
    flexDirection,
    justifyContent: flexDirection.indexOf('-') > 0 ? 'flex-end' : 'flex-start',
    ...style,
  };
  return (
    <div className={`Dock${location}`} style={divStyle}>
      {mostChildren}
      <div style={{ flexGrow: 1 }}>{lastChild}</div>
    </div>
  );
}

export type FillProps = {
  direction?:
    | 'vertical'
    | 'horizontal'
    | 'v'
    | 'h'
    | 'row'
    | 'r'
    | 'column'
    | 'c';
  style?: React.CSSProperties;
  children?: React.JSX.Element | string | (React.JSX.Element | string)[];
};

const fillBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
};

export function Fill({
  direction: which,
  style,
  children,
}: FillProps): React.JSX.Element {
  const divStyle = { ...fillBaseStyle, ...style };
  if (which && (which[0] === 'v' || which[0] === 'c')) {
    divStyle.flexDirection = 'row';
    divStyle.height = '100%';
  } else {
    divStyle.flexDirection = 'column';
    divStyle.width = '100%';
  }
  return (
    <div className={`Fill${which ?? 'undefined'}`} style={divStyle}>
      {children}
    </div>
  );
}

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
  children?: React.JSX.Element | string | (React.JSX.Element | string)[];
};

export function FullPage({
  style,
  className,
  children,
}: FullPageProps): React.JSX.Element {
  const newStyle = { ...fullPageSize, ...style };
  return (
    <div className={className || ''} style={newStyle}>
      {children}
    </div>
  );
}
