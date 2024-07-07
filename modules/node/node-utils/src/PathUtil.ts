import * as os from 'os';
import * as child from 'child_process';
import * as path from 'path';
import { promises as fsp } from 'fs';
import { promisify } from 'util';

const exec = promisify(child.exec);

export function getTemp(name: string, ext?: string): string {
  const extension: string = ext && ext[0] !== '.' ? '.' + ext : ext ? ext : '';
  return path.join(os.tmpdir(), `${name}-tmp-${process.pid}${extension}`);
}

export function getExtNoDot(fileName: string): string {
  const ext: string = path.extname(fileName);
  if (!ext) return ext;
  return ext.substring(1);
}

export function changeExt(fileName: string, newExt: string): string {
  const ext: string = getExtNoDot(fileName);
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
export function xplat(pathName: string): string {
  return pathName.replaceAll('\\', '/');
}

// Make sure the path has a final slash on it
export function trailingSlash(pathName: string): string {
  if (pathName.endsWith('\\') || pathName.endsWith('/')) {
    return xplat(pathName);
  } else {
    return xplat(pathName + path.sep);
  }
}

// xplat helpers
export function resolve(pathName: string): string {
  return xplat(path.resolve(xplat(pathName)));
}

export function join(...pathNames: string[]): string {
  return xplat(path.join(...pathNames));
}

export function dirname(pathname: string): string {
  return xplat(path.dirname(pathname));
}

export async function getRoots(): Promise<string[]> {
  switch (os.platform()) {
    case 'win32': {
      const { stdout, stderr } = await exec('wmic logicaldisk get name');
      if (stderr.length > 0) {
        return [];
      }
      return stdout
        .split('\r\r\n')
        .filter((value) => /[A-Za-z]:/.test(value))
        .map((value) => value.trim());
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
  // Trailing periods and matching quotes require a bit more attention
  // .	․	Trailing periods U+2024
  // "	“ and/or ”	U+201C / U+201D
];

export function fileClean(file: string, ignoreLastPeriod?: boolean): string {
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
  // Last, but not least, double-quotes
  const splits = res.split('"');
  res = '';
  let isEven = true;
  for (let i = 0; i < splits.length; i++) {
    const cur = splits[i];
    if (cur === '') {
      if (i === 0) {
        res += '“';
      } else if (i !== splits.length - 1) {
        res += isEven ? '“' : '”';
        isEven = !isEven;
      }
    } else if (cur.endsWith(' ')) {
      isEven = false;
      res += cur + '“';
    } else if (/[0-9]$/.test(cur)) {
      res += cur + '”'; // 12" single => 12” single, right?
    } else if (i === splits.length - 1) {
      // For the last string, don't end it with a double-quote :)
      res += cur;
    } else {
      res += cur + (isEven ? '“' : '”');
      isEven = !isEven;
    }
  }
  return res.trim();
}

export const basename = path.basename;

export const extname = path.extname;
