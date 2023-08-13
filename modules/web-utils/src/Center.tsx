import React from 'react';
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
  children?: JSX.Element | string | (JSX.Element | string)[];
};

export type CenterProps = (
  | CenterDirectionBoth
  | CenterDirectionHorizontal
  | CenterDirectionName
  | CenterDirectionVertical
) &
  CenterPropsBasics;

const baseStyle: React.CSSProperties = {
  display: 'flex',
};

export function Center(props: CenterProps): JSX.Element {
  const divStyle = { ...baseStyle, ...props.style };
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
