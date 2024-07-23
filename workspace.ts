import { promises as fs } from 'fs';
import path from 'path';
import { $, Glob } from 'bun';
// Gotta import stuff directly from source, because this is used in a script.
import * as TC from './modules/agnostic/typechk/src/TypeChk.ts';

// This is used to do workspace-wide things, because Bun (and yarn+lerna+nx) don't bother to consider dev/peer deps as actual dependencies :(

type Dependency = { name: string; location: string; deps: string[] };

// Just read a JSON text file, and return the JSON object.
async function readJson(filename: string): Promise<JSON> {
  const pkg = (await fs.readFile(filename)).toString();
  return JSON.parse(pkg);
}

// Get the list of workspaces, and returns the list of matching directories that contain package.json files.
async function getProjects(): Promise<string[]> {
  const topLevelPkg = await readJson('package.json');
  if (!TC.hasFieldType(topLevelPkg, 'workspaces', TC.isArrayOfString)) {
    throw new Error('workspaces field must be an array of strings');
  }
  const workspaces = topLevelPkg.workspaces;
  const res: string[] = [];
  for (const ws of workspaces) {
    const glob = new Glob(ws);
    const files = glob.scan({ onlyFiles: false });
    for await (const file of files) {
      if ((await fs.stat(file)).isDirectory()) {
        const pkgFile = path.join(file, 'package.json');
        if (await fs.exists(pkgFile)) {
          res.push(pkgFile);
        }
      }
    }
  }
  return res;
}

// Given a list of dependencies, return just ones that are workspaces.
function workspaceDeps(deps: { [key: string]: string }): string[] {
  return Object.keys(deps).filter((dep) => deps[dep].startsWith('workspace:'));
}

const depKeys = ['dependencies', 'devDependencies', 'peerDependencies'];

// Given a package.json file, return the name, location, and list of workspace dependencies.
async function readDeps(pkgFile: string): Promise<Dependency> {
  const pkg = await readJson(pkgFile);
  const deps = new Set<string>();
  if (!TC.hasFieldType(pkg, 'name', TC.isString)) {
    throw new Error('name field must be a string');
  }
  for (const key of depKeys) {
    if (!TC.hasField(pkg, key)) {
      continue;
    }
    if (!TC.hasFieldType(pkg, key, TC.isObjectOfString)) {
      throw new Error(`${key} field must be an object of strings`);
    }
    workspaceDeps(pkg[key]).forEach((k) => deps.add(k));
  }
  return {
    name: pkg.name,
    location: path.dirname(pkgFile),
    deps: [...deps],
  };
}

async function getDependencies(): Promise<Dependency[]> {
  // First, load the package.json's from the workspaces
  const pkgFiles = await getProjects();
  return await Promise.all(pkgFiles.map(readDeps));
}

// The rest of this code is really dumb right now.
// I'll make it smarter when I need to later.
// Ways to make it smarter: First, make it schedule, because it's
// conservative: It makes everything wait until the previous gen
// of deps is completed, rather than only making things wait on their
// own deps. The ordering logic is also pretty terrible. In general,
// this ought to be a scheduler rather than a sorter and processor.

function orderDeps(deps: Dependency[]): Dependency[][] {
  // Sort the dependencies such that each 'row' of the result can be run in parallel.
  const res: Dependency[][] = [];
  const visited = new Set<string>();
  const lookup = new Map<string, Dependency>(deps.map((d) => [d.name, d]));
  while (lookup.size > 0) {
    const curRow: Dependency[] = [];
    for (const dep of lookup.values()) {
      if (dep.deps.find((d) => !visited.has(d)) === undefined) {
        curRow.push(dep);
      }
    }
    if (curRow.length == 0) {
      throw new Error(
        'Unable to complete dependency graph, likely due to a circular dependency',
      );
    }
    res.push(curRow);
    for (const dep of curRow) {
      visited.add(dep.name);
      lookup.delete(dep.name);
    }
  }
  return res;
}

async function doit(filepath: string, cmds: string[]): Promise<void> {
  await $`cd "${filepath}" && ${{ raw: cmds.map((v) => $.escape(v)).join(' ') }}`;
}

async function main(args: string[]) {
  const deps = await getDependencies();
  const ordered = orderDeps(deps);
  for (const order of ordered) {
    console.log(`[${order.map((d) => d.name).join(', ')}]`);
    await Promise.all(order.map((d) => doit(d.location, args)));
  }
}

main(process.argv.slice(2)).catch(console.error);
