import minimist, { ParsedArgs, Opts as MinimistOpts } from 'minimist';
import shelljs from 'shelljs';
import * as Terser from 'terser';
import { globSync } from 'glob';
import fs, { promises as fsp } from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line no-console
const err = console.error;

function isObjectNonNull(obj: unknown): obj is { [key: string]: unknown } {
  return typeof obj === 'object' && !!obj;
}

function isString(obj: unknown): obj is string {
  return typeof obj === 'string';
}
function isBoolean(obj: unknown): obj is boolean {
  return typeof obj === 'boolean';
}
function has<K extends string>(
  x: unknown,
  key: K,
  // eslint-disable-next-line no-shadow
): x is { [key in K]: unknown } {
  return isObjectNonNull(x) && key in x;
}

// eslint-disable-next-line no-shadow
function hasStr<K extends string>(
  x: unknown,
  key: K,
  // eslint-disable-next-line no-shadow
): x is { [key in K]: string } {
  return has(x, key) && isString(x[key]);
}

const uglifyOptions: Terser.MinifyOptions = {
  toplevel: true,
  compress: {
    passes: 2,
  },
  mangle: true,
  output: {
    beautify: false,
    semicolons: false,
  },
  ecma: 2020,
};

function getSuffixedName(name: string, suffix: string, outDir: string) {
  const dir =
    outDir.length > 0
      ? path.join(outDir, path.dirname(name))
      : path.dirname(name);
  const p = `${path.basename(name, '.js')}.${suffix}.js`;
  return path.join(dir, p);
}

export type MinifyParams = {
  suffix?: string;
  inPlace: boolean;
  recurse: boolean;
  keepGoing: boolean;
  map: boolean;
  outDir?: string;
  args: string[];
};

export function minifyArgs(m: ParsedArgs): MinifyParams {
  return {
    suffix: hasStr(m, 's')
      ? m.s.replace(/^\.*/, '').replace(/\.*$/, '') // Get rid of .'s
      : undefined,
    inPlace: m.i === true,
    recurse: m.r === true,
    keepGoing: m.e === true,
    map: m.m === true,
    outDir: hasStr(m, 'o') ? m.o : undefined,
    args: m._,
  };
}

export async function minify(unparsed: string[]): Promise<number> {
  // -e : halt on first error (defaults to false)
  // -i : 'in-place', defaults to false (overwrites foo.js)
  // -r : 'recursive', defaults to false
  // -m : 'maps': read input maps (and product output map files)
  // -s min : 'suffix', defaults to min (i.e. foo.min.js)
  // -o dir : 'out-dir', defaults to '', prepended to path
  // everything else is either files or dirs to minify individually
  // eslint-disable-next-line
  const mo: MinimistOpts = { boolean: ['e', 'i', 'r', 'm'] };
  const m: ParsedArgs = minimist(unparsed, mo);

  const { suffix, inPlace, recurse, keepGoing, map, outDir, args } =
    minifyArgs(m);

  if (inPlace && suffix) {
    err("-i (in-place) and -s (suffix) don't work together");
    return -1;
  }
  if (recurse && outDir) {
    err("-r (recursive) and -o (output dir) don't work together");
    return -1;
  }
  if (args.length === 0) {
    err('Please pass some files or a directory or something');
    return -1;
  }

  // Run uglify on each file specified
  if (
    await ForFiles(
      args,
      async (loc): Promise<boolean> => {
        try {
          const orig = await fsp.readFile(loc, 'utf-8');
          if (map) {
            uglifyOptions.sourceMap = {
              content: await fsp.readFile(loc + '.map', 'utf-8'),
            };
          }
          const res = await Terser.minify(orig, uglifyOptions);
          if (!res || !res.code) {
            err('No results when minifying ' + loc);
            return false;
          }
          const dest = inPlace
            ? loc
            : getSuffixedName(loc, suffix || 'min', outDir || '');
          if (outDir) {
            shelljs.mkdir('-p', path.dirname(dest));
          }
          await fsp.writeFile(dest, res.code, 'utf-8');
          if (map && isString(res.map)) {
            await fsp.writeFile(dest + '.map', res.map, 'utf-8');
          } else if (map) {
            err('No map file produced for file ' + loc);
          }
          // console.log(`Before: ${orig.length} after ${res.code.length}`);
          return true;
        } catch (e) {
          err('Caught an exception while processing ' + loc);
          err(e);
          return false;
        }
      },
      { recurse, keepGoing, fileTypes: '.js' },
    )
  ) {
    return 0;
  }
  return -1;
}

async function ForFiles(
  seed: string | string[],
  func: (fileName: string) => Promise<boolean> | boolean,
  opts?: {
    recurse?: boolean;
    keepGoing?: boolean;
    fileTypes?: string[] | string;
  },
): Promise<boolean> {
  // Helper function to match the file types
  const recurse = opts && opts.recurse;
  const keepGoing = opts && opts.keepGoing;
  const fileTypes = opts && opts.fileTypes;
  const fileMatcher = fileTypes
    ? (str: string): boolean => {
        const uc = str.toLocaleUpperCase();
        if (isString(fileTypes)) {
          return uc.endsWith(fileTypes.toLocaleUpperCase());
        }
        const fsfx = fileTypes.map((val) => val.toLocaleUpperCase());
        for (const ft of fsfx) {
          if (uc.endsWith(ft)) {
            return true;
          }
        }
        return false;
      }
    : (): boolean => true;

  const queueArray: string[] = globSync(seed, { noext: true, nobrace: true });
  const queue: string[] = Array.prototype.concat(...queueArray) as string[];
  let overallResult = true;
  while (queue.length > 0) {
    const i = queue.pop();
    if (!i) {
      continue;
    }
    const st = await fsp.stat(i);
    if (st.isFile() && fileMatcher(i)) {
      let res = func(i);
      if (!isBoolean(res)) {
        res = await res;
      }
      if (res !== true) {
        overallResult = false;
        if (!keepGoing) {
          return false;
        }
      }
    } else if (st.isDirectory()) {
      // For directories in the queue, we walk all their files
      let dirents: fs.Dirent[] | null = null;
      try {
        dirents = await fsp.readdir(i, { withFileTypes: true });
      } catch (e) {
        err(`Unable to read ${i || '<unknown>'}`);
        continue;
      }
      if (!dirents) {
        continue;
      }
      for (const dirent of dirents) {
        try {
          if (dirent.isSymbolicLink()) {
            const ap = await fsp.realpath(path.join(i, dirent.name));
            const lst = await fsp.stat(ap);
            if (lst.isDirectory() && recurse) {
              queue.push(ap);
            } else if (lst.isFile()) {
              queue.push(ap);
            }
          } else if (dirent.isDirectory() && recurse) {
            queue.push(path.join(i, dirent.name));
          } else if (dirent.isFile()) {
            queue.push(path.join(i, dirent.name));
          }
        } catch (e) {
          err('Unable to process dirent:');
          err(dirent);
          continue;
        }
      }
    }
  }
  return overallResult;
}
