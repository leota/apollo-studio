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
  [remoteName: string]: string;
}
export interface Project {
  id: string;
  name: string;
  targetDomain: string;
  defaults: Defaults;
  graphql: Graphql;
  rest: Rest;
  views: Views;
  cors: Cors;
  remotes: Remotes;
}