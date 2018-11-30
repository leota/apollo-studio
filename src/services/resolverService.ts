import { Project } from '../models/project';

import { readFileSync } from 'fs';
import * as path from 'path';
import * as readdirp from 'readdirp';

import { getProjectPath } from '../utils/common';

enum TypeResolver {
  Query = 0,
  Mutation = 1,
  Subscription = 2,
  Type = 3,
}

export interface Import {
  className: string;
  alias?: string;
  from: string;
}

export interface ResolverAtom {
  func: string;
  definition: string;
}

export interface Resolver {
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
  isType: boolean;
  content: string;
  imports?: Import[];         // TODO: Experimental
  atom?: ResolverAtom;        // TODO: Experimental
  commonDefinitions?: string; // TODO: Experimental
}

export class ResolverService {
  constructor() {
    // do nothing
  }

  public getResolversFromProject(projectId: string): Promise<Resolver[]> {
    const output: Resolver[] = [];
    const resolversPath = path.join(getProjectPath(projectId), 'server', 'resolvers');

    return new Promise((resolve: any, reject: any) => {
      readdirp({ root: resolversPath, fileFilter: '*.ts' })
        .on('data', (file: any) => {
          if (file.name === 'index.ts') {
            return;
          }

          let type: TypeResolver;
          if (file.path.indexOf('queries') > -1) {
            type = TypeResolver.Query;
          } else if (file.path.indexOf('mutations') > -1) {
            type = TypeResolver.Mutation;
          } else if (file.path.indexOf('subscriptions') > -1) {
            type = TypeResolver.Subscription;
          } else if (file.path.indexOf('types') > -1) {
            type = TypeResolver.Type;
          } else {
            return;
          }

          const classContent = readFileSync(file.fullPath, 'utf8');
          output.push(
            this.getResolverEntityFromClass(classContent, type)
          );
        })
        .on('end', () => {
          resolve(output);
        });
    });
  }

  private getResolverEntityFromClass(classContent: string, type: TypeResolver): Resolver {
    // Remove comments
    // const commentsRe = new RegExp([
    //   /\/(\*)[^*]*\*+(?:[^*\/][^*]*\*+)*\//.source,           // $1: multi-line comment
    //   /\/(\/)[^\n]*$/.source,                                 // $2 single-line comment
    //   /"(?:[^"\\]*|\\[\S\s])*"|'(?:[^'\\]*|\\[\S\s])*'/.source, // - string, don't care about embedded eols
    //   /(?:[$\w\)\]]|\+\+|--)\s*\/(?![*\/])/.source,           // - division operator
    //   /\/(?=[^*\/])[^[/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[/\\]*)*?\/[gim]*/.source
    //   ].join('|'),                                            // - regex
    //   'gm'  // note: global+multiline with replace() need test
    // );
    // classContent = classContent.replace(commentsRe, (match: any, mlc: any, slc: any) => {
    //   return mlc ? ' ' :         // multiline comment (replace with space)
    //          slc ? '' :          // single/multiline comment
    //          match;              // divisor, regex, or string, return as-is
    // });
    // Converts string literals to default strings
    // classContent = classContent.replace(/`/g, "'");

    // Removes returns carriage
    // const processableClassContent = classContent.replace(/[\n\r\t]+/g, '');
    // let exportedPortion = processableClassContent.match(/export default \{(.*?)\};$/gmi);
    // if (exportedPortion && exportedPortion[0]) {
    //   // replaces the 'export default' syntax with a standard bracket
    //   exportedPortion[0] = exportedPortion[0]
    //     .replace('export default {', '{');
    //   // removes closing bracket and semicolumn
    //   exportedPortion[0] = exportedPortion[0]
    //     .substr(0, exportedPortion[0].length - 3);
    //   // adds closing bracket
    //   exportedPortion[0] += '}';
    //   console.log(exportedPortion[0]);
    // }

    return {
      isQuery: type === TypeResolver.Query,
      isMutation: type === TypeResolver.Mutation,
      isSubscription: type === TypeResolver.Subscription,
      isType: type === TypeResolver.Type,
      content: classContent,
    };
  }

  // TODO: Experimental
  // imports: this.getImportsEntitiesFromClass(classContent),
  private getImportsEntitiesFromClass(classContent: string): Import[] {
    return [] as Import[];
  }
}