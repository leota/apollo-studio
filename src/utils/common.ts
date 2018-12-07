import { spawn } from 'child_process';

import { Project } from '../models/project';
import { resolve } from 'path';

export const getProjectPath = (project: Project | string): string => {
  const projectId = typeof project == 'object'
   ? project.id
   : project;
  return `projects/org/${projectId}`;
};

export const executeShellCmd = (project: Project, cmd: string, args: string[]) => {
  const basePath = resolve(getProjectPath(project));

  const child = spawn(cmd, args, { stdio: 'pipe', cwd: basePath });
  return new Promise((resolve: any) => {
    child.stdout.on('data', function (data) {
      process.stdout.write(data);
    });
    child.stderr.on('data', function (data) {
      process.stdout.write(data);
    });
    child.on('exit', function (data) {
      resolve(data);
    });
  });
};

export const executeNpmScript = (project: Project, scriptName: string, outputFunc: any) => {
  const basePath = resolve(getProjectPath(project));

  const child = spawn(
    /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
    ['run', scriptName],
    { stdio: 'pipe', cwd: basePath }
  );

  child.stdout.on('data', (data: any): void => {
    if (typeof outputFunc === 'function') {
      outputFunc(data);
    } else {
      process.stdout.write(data);
    }
  });
  child.stderr.on('data', (data: any): void => {
    if (typeof outputFunc === 'function') {
      outputFunc(data);
    } else {
      process.stdout.write(data);
    }
  });
  child.on('exit', (data: any): void => {
    // do nothing
  });
};