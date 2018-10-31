import * as localProjects from '../../confs/projects.json';
import { writeFileSync, existsSync } from 'fs';

export class ProjectService {
  private static currentProjects: any;
  private filePath: string = './confs/projects.json';

  constructor() {
    ProjectService.currentProjects = localProjects;
  }

  public getServices(): any {
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

  public saveProject(): void {
    if (existsSync(this.filePath)) {
      writeFileSync(
        this.filePath,
        JSON.stringify(
          ProjectService.currentProjects,
          null,
          2
        ),
        'utf8'
      );
    } else {
      throw new Error('Cannot find projects file');
    }
  }
}