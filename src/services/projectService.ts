import * as _ from 'lodash';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import * as localProjects from '../../confs/projects.json';

import * as GitDownload from 'download-git-repo';

import { Project } from '../models/project';
import { ProcessingService } from './processingService';
import { getProjectPath } from '../utils/common';

export class ProjectService {
  private static currentProjects: any;
  private filePath: string = './confs/projects.json';

  constructor(
    private processingService: ProcessingService = new ProcessingService()
  ) {
    ProjectService.currentProjects = localProjects;
  }

  public getProjects(): any {
    return JSON.parse(
      readFileSync('confs/projects.json', 'utf8')
    );
  }

  public getProject(id: string): Project | undefined {
    let output: Project | undefined = void 0;
    _.each(ProjectService.currentProjects, (org: Project[]) => {
      const project = _.find(org, {id});
      if (project) {
        console.log(project);
        output = project;
      }
    });
    return output;
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
          'marcellobarile/typescript-express-graphql-seed#develop-apollo-2',
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

              this.processingService
                .postCreate(project)
                .then(resolve)
                .catch(reject);
            }
          }
        );
      } else {
        reject(new Error('Cannot find projects file'));
      }
    });
  }
}