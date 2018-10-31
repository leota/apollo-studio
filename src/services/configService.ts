import * as localConfs from '../../confs/studio.json';
import { writeFileSync, existsSync } from 'fs';

export class ConfigService {
  private static currentConfigurations: any;
  private filePath: string = './confs/studio.json';

  constructor() {
    ConfigService.currentConfigurations = localConfs;
  }

  public getConfigurations(): any {
    return ConfigService.currentConfigurations;
  }

  public updateConfiguration(group: string, name: string, newValue: any): boolean {
    const groupConfs = ConfigService.currentConfigurations[group];
    if (groupConfs) {
      let conf = groupConfs[name];
      if (conf) {
        conf.value = newValue;
        return true;
      } else {
        throw new Error('Config not found');
      }
    } else {
      throw new Error('Config group not found');
    }
  }

  public saveConfigurations(): void {
    if (existsSync(this.filePath)) {
      writeFileSync(
        this.filePath,
        JSON.stringify(
          ConfigService.currentConfigurations,
          null,
          2
        ),
        'utf8'
      );
    } else {
      throw new Error('Cannot find configuration file');
    }
  }
}