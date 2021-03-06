import * as _ from 'lodash';
import * as ts from 'typescript';
import { readFileSync, writeFileSync, unlinkSync, lstatSync, readdirSync, mkdirSync } from 'fs';
import * as path from 'path';
import * as scandir from 'klaw-sync';

import { getProjectPath } from '../utils/common';

export enum TypeResolver {
  Query = 'Query',
  Mutation = 'Mutation',
  Subscription = 'Subscription',
  Type = 'Type',
  Generic = 'Generic',
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

export interface CustomFile {
  name: string;
  filePath: string;
  content: string;
}

export class ResolverService {
  constructor() {
    // do nothing
  }

  public desumeResolverNameFromContent(classContent: string): string[] {
    const output: string[] = [];
    const resolverRe = /^(.*)\: function \((.*)\) {$/igm;
    const result = ts.transpileModule(classContent, {
      compilerOptions: {
        strict: true,
        module: ts.ModuleKind.CommonJS
      }
    });
    const compiled = result.outputText;
    let m;
    while ((m = resolverRe.exec(compiled)) !== null) {
      if (m.index === resolverRe.lastIndex) {
        resolverRe.lastIndex++;
      }
      output.push(m[1].replace(/\s/g, ''));
    }
    return output;
  }

  public getResolversFromProject(projectId: string): {resolvers: Resolver[], customFiles: CustomFile[]} {
    const resolversPath = path.join(getProjectPath(projectId), 'server', 'resolvers');
    const files = scandir(resolversPath, {
      nodir: true
    });
    const resolvers: Resolver[] = [];
    const customFiles: CustomFile[] = [];

    _.each(files, (file: any) => {
      if (file.path.indexOf('index.ts') > -1) {
        return;
      }

      let type: TypeResolver = TypeResolver.Generic;
      if (file.path.indexOf('queries') > -1) {
        type = TypeResolver.Query;
      } else if (file.path.indexOf('mutations') > -1) {
        type = TypeResolver.Mutation;
      } else if (file.path.indexOf('subscriptions') > -1) {
        type = TypeResolver.Subscription;
      } else if (file.path.indexOf('types') > -1) {
        type = TypeResolver.Type;
      }

      const classContent = readFileSync(file.path, 'utf8');
      if (classContent.includes('resolver: {')) {
        // It's a legit resolver (note: maybe a better method is needed?)
        resolvers.push(
          this.getResolverEntityFromContent(file.path, classContent, type)
        );
      } else {
        customFiles.push(
          this.getCustomFileEntityFromContent(file.path, classContent)
        );
      }
    });

    return {resolvers, customFiles};
  }

  public getCustomFoldersFromProject(projectId: string): string[] {
    const resolversPath = path.join(getProjectPath(projectId), 'server', 'resolvers');

    const isReserved = (source: string) => (
      !source.includes('queries')
      && !source.includes('mutations')
      && !source.includes('subscriptions')
      && !source.includes('types')
    );
    const isAllowed = (source: string) => lstatSync(source).isDirectory() && !isReserved;
    const getDirectories = (source: string) =>
      readdirSync(source)
        .map(
          (name: string) => path.join(source, name)
        )
        .filter(
          isAllowed
        );

    return [
      '/',
      ...getDirectories(resolversPath).map((path: string) => path.replace(resolversPath, ''))
    ];
  }

  public createResolver(
    projectId: string,
    name: string,
    classContent: string,
    type: TypeResolver
  ): void {
    // creates file with classContent, uses name for file name, type for the folder
    // registers the export in the barrel file, uses name as reference
    let typeFolder = '';
    switch (type) {
      case TypeResolver.Query:
        typeFolder = 'queries';
        break;
      case TypeResolver.Mutation:
        typeFolder = 'mutations';
        break;
      case TypeResolver.Subscription:
        typeFolder = 'subscriptions';
        break;
      case TypeResolver.Type:
        typeFolder = 'types';
        break;
    }

    const destFilePath = path.join(
      getProjectPath(projectId),
      'server',
      'resolvers',
      typeFolder,
      `${name.toLowerCase().replace(/[^A-Za-z0-9\-\_]/, '-')}.ts`
    );

    // Removing empty entities
    classContent = classContent
      .replace('query: {},', '')
      .replace('mutation: {},', '')
      .replace('subscription: {},', '')
      .replace('type: {},', '')
      .replace('query: ``,', '')
      .replace('mutation: ``,', '')
      .replace('subscription: ``,', '')
      .replace('common: ``,', '')
    ;

    // Write the file
    writeFileSync(
      destFilePath,
      classContent,
      'utf8'
    );

    // Register class in the solution
    this.registerResolver(
      projectId,
      name,
      type
    );
  }

  public updateResolver(
    resolver: Resolver,
    classContent: string
  ): void {
    writeFileSync(
      resolver.filePath,
      classContent,
      'utf8'
    );
  }

  public deleteResolver(
    resolver: Resolver,
    projectId: string,
  ): void {
    let type: TypeResolver;
    if (resolver.isQuery) {
      type = TypeResolver.Query;
    } else if (resolver.isMutation) {
      type = TypeResolver.Mutation;
    } else if (resolver.isSubscription) {
      type = TypeResolver.Subscription;
    } else {
      type = TypeResolver.Type;
    }

    // Delete the file
    unlinkSync(resolver.filePath);

    // Unregister the resolver
    this.unregisterResolver(
      projectId,
      resolver.name,
      type
    );
  }

  public createFile(
    projectId: string,
    filename: string,
    destPath: string,
    fileContent: string,
  ): void {
    // Remove the first character if it's a slash + js/ts extentions
    filename = filename[0] == '/'
      ? filename
        .replace(/\.ts|\.js/, '')
        .substring(1, filename.length)
      : filename;

    // Split the filename and extracting
    // the containing folder
    const filenameParts = filename.split('/');
    let newFolderName: string | null = null;
    let newFilename: string;
    if (filenameParts.length > 1) {
      newFolderName = filenameParts[0];
      newFilename = filenameParts[1];

      // Create the containing folder
      // TODO: Skip if already existing
      mkdirSync(
        path.join(
          getProjectPath(projectId),
          'server',
          'resolvers',
          (destPath != '/' && destPath != '' ? destPath : ''),
          newFolderName
        )
      );
    } else {
      newFilename = filenameParts[0];
    }

    newFilename = newFilename[0] == '/'
      ? newFilename.substring(1, newFilename.length)
      : newFilename;
    newFilename = newFilename.replace(/\W/ig, '-');

    const fullFilepath = newFolderName != null
      ? `${newFolderName}/${newFilename}.ts`
      : `${newFilename}.ts`;

    const destFilePath = path.join(
      getProjectPath(projectId),
      'server',
      'resolvers',
      (destPath != '/' && destPath != '' ? destPath : ''),
      fullFilepath
    );

    this.updateFile(destFilePath, fileContent);
  }

  public updateFile(
    filePath: string,
    fileContent: string,
  ): void {
    writeFileSync(
      filePath,
      fileContent,
      'utf8'
    );
  }

  public deleteFile(
    filePath: string,
  ): void {
    // TODO: In case the containing folder is empty,
    // it should be removed as well
    unlinkSync(filePath);
  }

  private registerResolver(
    projectId: string,
    name: string,
    type: TypeResolver,
  ): void {
    let typeFolder = '';
    switch (type) {
      case TypeResolver.Query:
        typeFolder = 'queries';
        break;
      case TypeResolver.Mutation:
        typeFolder = 'mutations';
        break;
      case TypeResolver.Subscription:
        typeFolder = 'subscriptions';
        break;
      case TypeResolver.Type:
        typeFolder = 'types';
        break;
    }

    const indexFilePath = path.join(
      getProjectPath(projectId),
      'server',
      'resolvers',
      typeFolder,
      'index.ts'
    );
    let indexFileContent = readFileSync(
      indexFilePath,
      'utf8'
    );

    // Prepend the import
    indexFileContent =
    `import ${name} from './${name}';\n` +
    `${indexFileContent}`;
    // Add the export
    indexFileContent = indexFileContent.replace(
      'export default {',
      `export default {\n` +
      `  ${name},`
    );

    writeFileSync(
      indexFilePath,
      indexFileContent,
      'utf8'
    );
  }

  private unregisterResolver(
    projectId: string,
    name: string,
    type: TypeResolver,
  ): void {
    let typeFolder = '';
    switch (type) {
      case TypeResolver.Query:
        typeFolder = 'queries';
        break;
      case TypeResolver.Mutation:
        typeFolder = 'mutations';
        break;
      case TypeResolver.Subscription:
        typeFolder = 'subscriptions';
        break;
      case TypeResolver.Type:
        typeFolder = 'types';
        break;
    }

    const indexFilePath = path.join(
      getProjectPath(projectId),
      'server',
      'resolvers',
      typeFolder,
      'index.ts'
    );
    let indexFileContent = readFileSync(
      indexFilePath,
      'utf8'
    );
    indexFileContent = indexFileContent
      .replace(`import ${name} from './${name}';\n`, '')
      .replace(`  ${name},`, '');

    writeFileSync(
        indexFilePath,
        indexFileContent,
        'utf8'
      );
  }

  private getResolverEntityFromContent(
    filePath: string,
    classContent: string,
    type: TypeResolver
  ): Resolver {
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

  private getCustomFileEntityFromContent(
    filePath: string,
    classContent: string,
  ): CustomFile {
    return {
      name: path.parse(filePath).base.replace('.ts', ''),
      filePath,
      content: classContent,
    };
  }

  // TODO: Experimental
  // imports: this.getImportsEntitiesFromClass(classContent),
  /*
  private getImportsEntitiesFromClass(classContent: string): Import[] {
    return [] as Import[];
  }
  */
}