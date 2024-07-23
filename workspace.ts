import { $, Glob } from 'bun';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
// Gotta import stuff directly from source, because this is used in a script.
import * as TC from './modules/agnostic/typechk/src/TypeChk.ts';

const execP = promisify(exec);

// This is used to do workspace-wide things, because Bun (and yarn+lerna+nx) don't bother to consider dev/peer deps as actual dependencies :(

type Module = { name: string; location: string; requires: string[] };
type ModuleNode = Module & { dependedOnBy: string[] };
type ModuleResolutionNode = ModuleNode & {
  unresolvedRequirements: Set<string>;
};

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
async function readModule(pkgFile: string): Promise<Module> {
  const pkg = await readJson(pkgFile);
  const requires = new Set<string>();
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
    workspaceDeps(pkg[key]).forEach((k) => requires.add(k));
  }
  return {
    name: pkg.name,
    location: path.dirname(pkgFile),
    requires: [...requires],
  };
}

async function getModules(): Promise<Module[]> {
  // First, load the package.json's from the workspaces
  const pkgFiles = await getProjects();
  return await Promise.all(pkgFiles.map(readModule));
}

// The rest of this code is really dumb right now.
// I'll make it smarter when I need to later.
// Ways to make it smarter: First, make it schedule, because it's
// conservative: It makes everything wait until the previous gen
// of deps is completed, rather than only making things wait on their
// own deps. The ordering logic is also pretty terrible. In general,
// this ought to be a scheduler rather than a sorter and processor.

function orderDeps(deps: Module[]): Module[][] {
  // Sort the dependencies such that each 'row' of the result can be run in parallel.
  const res: Module[][] = [];
  const visited = new Set<string>();
  const lookup = new Map<string, Module>(deps.map((d) => [d.name, d]));
  while (lookup.size > 0) {
    const curRow: Module[] = [];
    for (const dep of lookup.values()) {
      if (dep.requires.find((d) => !visited.has(d)) === undefined) {
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

type DependencyGraph = {
  ready: string[];
  provides: Map<string, Set<string>>;
  unresolved: Map<string, Set<string>>;
};

function calcDependencyGraph(deps: Module[]): DependencyGraph {
  const provides = new Map<string, Set<string>>(
    deps.map((d) => [d.name, new Set<string>()]),
  );
  const ready = new Set<string>(deps.map((d) => d.name));
  const unresolved = new Map<string, Set<string>>();
  for (const dep of deps) {
    for (const d of dep.requires) {
      if (!provides.has(d)) {
        throw new Error(`Dependency ${d} not found`);
      }
      provides.get(d)!.add(dep.name);
      ready.delete(dep.name);
      if (!unresolved.has(dep.name)) {
        unresolved.set(dep.name, new Set<string>());
      }
      unresolved.get(dep.name)!.add(d);
    }
  }
  // Assert that none of the ready tasks should be in unresolved, right?
  if (ready.size + unresolved.size !== deps.length) {
    throw new Error('Dependency graph calculation failed');
    // Could go into something more detailed here, but I'm lazy.
  }
  return { ready: [...ready], provides, unresolved };
}

async function main(args: string[]): Promise<void> {
  const modules = await getModules();
  const ordered = orderDeps(modules);
  for (const order of ordered) {
    console.log(`[${order.map((d) => d.name).join(', ')}]`);
    await Promise.all(order.map((d) => doit(d.name, d.location, args)));
  }
}

async function scheduler(args: string[]): Promise<void> {
  const modules = await getModules();
  const moduleMap = new Map<string, Module>(modules.map((m) => [m.name, m]));
  const { ready, provides, unresolved } = calcDependencyGraph(modules);

  function runTask(name: string): Promise<void> {
    const mod = moduleMap.get(name);
    if (!mod) {
      throw new Error(`Module ${name} not found!`);
    }
    return resolveTask(doit(mod.name, mod.location, args));
  }

  // When a task (promise) completes, it needs to update the ready set, and if
  // there are newly ready tasks, it should then wait on their tasks to complete,
  // otherwise, it should just return.

  // So, a task-resolver:
  async function resolveTask(waitOn: Promise<string>): Promise<void> {
    // The task is done, so check to see if any tasks that depend on it are now ready.
    const name = await waitOn;
    const maybeReadyDeps = provides.get(name);
    if (maybeReadyDeps) {
      const ready: string[] = [];
      for (const depToResolve of maybeReadyDeps) {
        // For each task that depends on this one, remove this task from its dependencies.
        // If the pending set is empty, add it to the ready set
        const unresolvedDeps = unresolved.get(depToResolve);

        // TODO: CONTINUE HERE
      }
      // Now wait on all of the remaining resolve tasks (recursion is fun!)
      await Promise.all(ready.map((dep) => runTask(dep)));
    }
  }
  // Seed the recursion with the initially ready tasks.
  await Promise.all(ready.map((dep) => runTask(dep)));
}

async function doit(
  name: string,
  filepath: string,
  cmds: string[],
): Promise<string> {
  // This doesn't work on windows, so I have to use Node-compatible stuff :(
  // const output = await $`${{ raw: cmds.map((v) => $.escape(v)).join(' ') }}`.cwd(filepath);
  const command = cmds.map((v) => $.escape(v)).join(' ');
  const res = await execP(command, { cwd: filepath });
  if (res.stderr) {
    console.error(res.stderr.trimEnd());
  }
  console.log(res.stdout.trimEnd());
  return name;
}

main(process.argv.slice(2))
  .catch((e) => console.error('Error', e))
  .finally(() => console.log('Done'));
