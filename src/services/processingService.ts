import { Project } from '../models/project';

import { getProjectPath } from '../utils/common';
import { existsSync, writeFileSync } from 'fs';

export class ProcessingService {
  constructor() {
    // do nothing
  }

  public postCreate(project: Project): Promise<boolean> {
    this.processConfigurations(project);

    return new Promise((resolve: any, reject: any) => {
      resolve(true);
    });
  }

  private processConfigurations(project: Project): boolean {
    const destPath = `${getProjectPath(project)}/serviceconfig.json`;
    if (existsSync(destPath)) {
      writeFileSync(
        destPath,
        JSON.stringify(project, null, 2),
        'utf8'
      );
      return true;
    } else {
      return false;
    }
  }
}