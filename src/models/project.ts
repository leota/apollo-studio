import { Resolver, ResolverService, CustomFile } from '../services/resolverService';
import { getProjectPath } from '../utils/common';
import { existsSync } from 'fs';

export interface Defaults {
  port: number;
  addr: string;
}
export interface Graphql {
  path: string;
}
export interface Rest {
  path: string;
}
export interface Views {
  src: string;
  engine: string;
}
export interface Cors {
  acceptedDomains: string[];
  methods: string[];
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}
export interface Remotes {
  [remoteName: string]: string | RemoteConfiguration | any;
}

export interface RemoteConfiguration {
  default: string;
}

export interface IProject {
  id: string;
  name: string;
  targetDomain: string;
  defaults: Defaults;
  graphql: Graphql;
  rest: Rest;
  views: Views;
  cors: Cors;
  remotes?: Remotes;
  resolvers?: any;
}

export const initialProject = {
  'id': '',
  'name': '',
  'targetDomain': '',
  'defaults': {
    'port': 3000,
    'addr': 'localhost'
  },
  'graphql': {
    'path': '/graphql'
  },
  'rest': {
    'path': '/api'
  },
  'views': {
    'src': '__root/server/views/',
    'engine': 'ejs'
  },
  'cors': {
    'acceptedDomains': ['*'],
    'methods': ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    'preflightContinue': false,
    'optionsSuccessStatus': 200
  },
  'remotes': {
    'getCookies': 'https://cookiefarm.com/cookies',
    'getBread': 'https://breadcorp.com/bread'
  }
};

export class Project implements IProject {
  public id: string;
  public name: string;
  public targetDomain: string;
  public defaults: Defaults;
  public graphql: Graphql;
  public rest: Rest;
  public views: Views;
  public cors: Cors;
  public remotes: Remotes;

  constructor(
    data: IProject
  ) {
    Object.assign(this, data);
  }

  public get resolvers(): Resolver[] {
    const {resolvers} = new ResolverService().getResolversFromProject(this.id);
    return resolvers;
  }

  public get customFiles(): CustomFile[] {
    const {customFiles} = new ResolverService().getResolversFromProject(this.id);
    return customFiles;
  }

  public get exists(): boolean {
    return existsSync(getProjectPath(this.id));
  }
}