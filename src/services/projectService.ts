import * as _ from 'lodash';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import * as localProjects from '../../confs/projects.json';

import * as rimraf from 'rimraf';
import * as GitDownload from 'download-git-repo';

import { Project, IProject } from '../models/project';
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
    const orgs = JSON.parse(
      readFileSync('confs/projects.json', 'utf8')
    );

    // Mapping JSON to Classes
    const out: any = {};
    _.each(orgs, (org: any) => out[org] = _.map(org, (project: Project) => new Project(project)));
    return out;
  }

  public getProject(id: string): Project | undefined {
    let output: Project | undefined = void 0;
    _.each(ProjectService.currentProjects, (org: Project[]) => {
      const project = _.find(org, {id});
      if (project) {
        output = project;
      }
    });
    return output;
  }

  public saveProject(org: string, newConf: IProject | Project): Promise<boolean> {
    if (newConf.id === '') {
      newConf.id = btoa(String(Math.random() + new Date().getTime()));
    }

    let project = _.find(ProjectService.currentProjects[org], {id: newConf.id}) as Project;
    return project
        ? this.updateProject(org, newConf)
        : this.createProject(org, new Project(newConf));
  }

  public updateProject(org: string, newConf: IProject): Promise<boolean> {
    const index = _.findIndex(ProjectService.currentProjects[org], {id: newConf.id});
    ProjectService.currentProjects[org].splice(index, 1, newConf);

    return new Promise((resolve: any, reject: any) => {
      writeFileSync(
        this.filePath,
        JSON.stringify(ProjectService.currentProjects, null, 2),
        'utf8'
      );
      resolve(true);
    });
  }

  public createProject(org: string, project: Project): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      if (project.id === '' || project.name === '') {
        reject(new Error('Cannot create project with empty name'));
      }

      ProjectService.currentProjects[org].push(project);

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

  public deleteProject(org: string, project: Project): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      const projectPath = getProjectPath(project);
      _.remove(ProjectService.currentProjects[org], {id: project.id});
      rimraf.sync(projectPath);
      writeFileSync(
        this.filePath,
        JSON.stringify(ProjectService.currentProjects, null, 2),
        'utf8'
      );
      resolve(true);
    });
  }
}