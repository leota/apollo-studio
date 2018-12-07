import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as scandir from 'klaw-sync';

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
  name: string;
  filePath: string;
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

  public getResolversFromProject(projectId: string): Resolver[] {
    const resolversPath = path.join(getProjectPath(projectId), 'server', 'resolvers');
    const files = scandir(resolversPath, {
        nodir: true
    });
    const resolvers: Resolver[] = [];
    _.each(files, (file: any) => {
      if (file.path.indexOf('index.ts') > -1) {
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

      const classContent = readFileSync(file.path, 'utf8');
      resolvers.push(
        this.getResolverEntityFromClass(file.path, classContent, type)
      );
    });

    return resolvers;
  }

  private getResolverEntityFromClass(filePath: string, classContent: string, type: TypeResolver): Resolver {
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
      name: path.parse(filePath).base.replace('.ts', ''),
      filePath,
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