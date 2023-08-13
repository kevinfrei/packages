/* eslint-disable @typescript-eslint/naming-convention */
import type { CenterProps as localCP } from './Center.js';
import { Center as localCenter } from './Center.js';
import type { DockProps as dP } from './Dock.js';
import { Dock as localDock } from './Dock.js';
import type { FillProps as fillP } from './Fill.js';
import { Fill as localFill } from './Fill.js';
import type { FullPageProps as fpP } from './FullPage.js';
import { FullPage as localFP } from './FullPage.js';

export * as Dialogs from './Dialogs.js';
// eslint-disable-next-line @typescript-eslint/no-namespace
export * from './FluentHelp.js';
export * from './FluentUIHelp.js';
export * from './Helpers.js';
export * from './Hooks.js';
export * from './ReactHelp.js';
export * from './RecoilHelp.js';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Layout {
  export const Dock = localDock;
  export const Fill = localFill;
  export const FullPage = localFP;
  export const Center = localCenter;
  export type FillProps = fillP;
  export type FullPageProps = fpP;
  export type DockProps = dP;
  export type CenterProps = localCP;
}
