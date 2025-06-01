import os from 'node:os';
import * as child from 'node:child_process';
import path from 'node:path';
import { promises as fsp } from 'node:fs';
import { promisify } from 'node:util';

const exec = promisify(child.exec);

export function GetTemp(name: string, ext?: string): string {
  const extension: string = ext && ext[0] !== '.' ? '.' + ext : ext ? ext : '';
  return path.join(os.tmpdir(), `${name}-tmp-${process.pid}${extension}`);
}

export function GetExtNoDot(fileName: string): string {
  const ext: string = path.extname(fileName);
  if (!ext) return ext;
  return ext.substring(1);
}

export function ChangeExt(fileName: string, newExt: string): string {
  const ext: string = GetExtNoDot(fileName);
  if (newExt && newExt.length > 1 && newExt[0] === '.') {
    newExt = newExt.substring(1);
  }
  let baseName = fileName.substring(0, fileName.length - ext.length);
  if (!baseName.endsWith('.')) {
    baseName += '.';
  }
  return baseName + newExt;
}

// Backslashes are annoying
export function Xplat(pathName: string): string {
  return pathName.replaceAll('\\', '/');
}

// Make sure the path has a final slash on it
export function TrailingSlash(pathName: string): string {
  if (pathName.endsWith('\\') || pathName.endsWith('/')) {
    return Xplat(pathName);
  } else {
    return Xplat(pathName + path.sep);
  }
}

// xplat helpers
export function Resolve(pathName: string): string {
  return Xplat(path.resolve(Xplat(pathName)));
}

export function Join(...pathNames: string[]): string {
  return Xplat(path.join(...pathNames));
}

export function DirName(pathname: string): string {
  return Xplat(path.dirname(pathname));
}

export async function GetRoots(): Promise<string[]> {
  switch (os.platform()) {
    case 'win32': {
      const { stdout, stderr } = await exec(
        'powershell -Command "Get-PSDrive -PSProvider FileSystem' +
          ' | Select-Object -ExpandProperty Root"',
      );
      if (stderr.length > 0) {
        return [];
      }
      return stdout
        .split('\r\r\n')
        .filter((value) => /^[A-Za-z]$/.test(value))
        .map((value) => value.trim() + ':');
    }
    case 'darwin': {
      const subdirs = await fsp.readdir('/Volumes');
      return subdirs.map((v) => path.join('/Volumes', v));
    }
    default:
      // TODO: Linux support
      return ['linux NYI'];
  }
}

const replacements = [
  ['?', 'Ɂ'], // U+0241
  ['*', '∗'], // U+2217
  [':', '։'], // U+0589
  [';', ';'], // Ux037e
  ['/', '╱'], // U+2571
  ['\\', '╲'], //	U+2572
  ['|', '┃'], // U+2503
  ['<', '˂'], // U+02c2
  ['>', '˃'], // U+02c3
  ['"', '＂'], // U+ff02
  // .	․	Trailing periods U+2024 require a bit more attention
];

// Switch characters that are not allowed in file names
// with ones that are similar but are allowed
export function CleanFileName(
  file: string,
  ignoreLastPeriod?: boolean,
): string {
  let res = file;
  for (const [i, r] of replacements) {
    if (res.indexOf(i) >= 0) {
      res = res.replaceAll(i, r);
    }
  }
  // Now deal with traililng periods
  if (res.endsWith('.') && !ignoreLastPeriod) {
    res = res.substring(0, res.length - 1) + '․'; // U+2024
  }
  return res.trim();
}

export function DirtyFileName(file: string): string {
  let res = file;
  for (const [i, r] of [...replacements, ['․', '․']]) {
    if (res.indexOf(r) >= 0) {
      res = res.replaceAll(r, i);
    }
  }
  return res.trim();
}

export const Basename = path.basename;
export const Extname = path.extname;
