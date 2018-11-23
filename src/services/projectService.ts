import * as localProjects from '../../confs/projects.json';
import { writeFileSync, readFileSync, existsSync } from 'fs';

import * as GitDownload from 'download-git-repo';

import { getProjectPath } from '../utils/common';

import { Project } from '../models/project';

export class ProjectService {
  private static currentProjects: any;
  private filePath: string = './confs/projects.json';

  constructor() {
    ProjectService.currentProjects = localProjects;
  }

  public getServices(): any {
    // TODO: Reload JSON
    return ProjectService.currentProjects;
  }

  public updateProject(org: string, projectId: string, newConf: any): boolean {
    const organization = ProjectService.currentProjects[org];
    if (organization) {
      let project = organization[projectId];
      if (project) {
        project = newConf;
        return true;
      } else {
        throw new Error('Project not found');
      }
    } else {
      throw new Error('Organization not found');
    }
  }

  public createProject(project: Project): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      if (project.id === '' || project.name === '') {
        reject(new Error('Cannot create project with empty name'));
      }

      // TODO: 'org' shall be configured
      ProjectService.currentProjects['org'].push(project);

      // TODO: check if project already exists on the filesystem
      if (existsSync(this.filePath)) {
        GitDownload(
          'marcellobarile/typescript-express-graphql-seed',
          getProjectPath(project),
          (err: any) => {
            if (err) {
              reject(new Error('Cannot download the repo'));
            } else {
              writeFileSync(
                this.filePath,
                JSON.stringify(ProjectService.currentProjects, null, 2),
                'utf8'
              );

              resolve(true);
            }
          }
        );
      } else {
        reject(new Error('Cannot find projects file'));
      }
    });
  }
}