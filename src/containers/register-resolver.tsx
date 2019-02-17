import * as React from 'react';
import * as PropTypes from 'prop-types';

import * as _ from 'lodash';

import update from 'immutability-helper';

import { Project } from '../models/project';
import { ProjectService } from '../services';
import { ResolverService, Resolver, TypeResolver, CustomFile } from '../services/resolverService';

import Button from 'react-uwp/Button';
import ContentDialog, { ContentDialogProps } from 'react-uwp/ContentDialog';
import DropDownMenu from 'react-uwp/DropDownMenu';
import TextBox from 'react-uwp/TextBox';

// The editor
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/typescript';
import 'brace/theme/xcode';
import * as path from 'path';

export interface IRegisterResolverProps {
  onSuccess?: () => void;
  match: any;
  location: any;
  history: any;
  isFile: boolean;
}

interface RegisterResolverState {
  project?: Project;
  isNew?: boolean;
  showConfirmDialog?: boolean;
  availableResolverNames?: string[];
  availableFolders?: string[];
}

const defaultBtnStyle: React.CSSProperties = {
  padding: 10
};

const resolverTemplate = `
export default {
  resolver: {
    query: {},
    mutation: {},
    subscription: {},
    type: {},
  },
  query: \`\`,
  mutation: \`\`,
  subscription: \`\`,
  common: \`\`,
};
`;

export default class RegisterResolver extends React.PureComponent<IRegisterResolverProps, RegisterResolverState> {
  public context: { theme: ReactUWP.ThemeType };
  static contextTypes = { theme: PropTypes.object };

  static projectService: ProjectService = new ProjectService();
  static resolverService: ResolverService = new ResolverService();
  static resolver: Resolver | undefined;
  static customFile: CustomFile | undefined;

  private currentCode: string;
  private selectedName: string;
  private selectedType: string;
  private selectedFolder: string = '/';
  private currentFilename: string;

  private availableTypes: TypeResolver[] = [
    TypeResolver.Query,
    TypeResolver.Mutation,
    TypeResolver.Subscription,
    TypeResolver.Type,
  ];

  constructor(props: IRegisterResolverProps, context?: any) {
    super(props, context);

    this.state = {
      showConfirmDialog: false,
    };

    this.saveResolver = this.saveResolver.bind(this);
    this.deleteResolver = this.deleteResolver.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.onCodeChange = this.onCodeChange.bind(this);
  }

  static getDerivedStateFromProps(
    props: IRegisterResolverProps
  ): RegisterResolverState {
    let state: RegisterResolverState = {};
    let availableFolders: string[] = [];

    if (
      props.match.params.projectId
      && props.match.params.hash
    ) {
      // The name of the selected entity (resolver | customFile)
      const name = atob(props.match.params.hash);

      if (!props.isFile) {
        // Resolver file

        let {resolvers} = RegisterResolver.resolverService
          .getResolversFromProject(props.match.params.projectId);
        const resolver = _.find(resolvers, {name});

        if (!resolver) {
          throw new Error('Cannot find the resolver.');
        }

        // Setting current selected resolver
        RegisterResolver.resolver = resolver;
      } else {
        // Custom file
        let {customFiles} = RegisterResolver.resolverService
          .getResolversFromProject(props.match.params.projectId);

        availableFolders = RegisterResolver.resolverService
          .getCustomFoldersFromProject(props.match.params.projectId);

        const file = _.find(customFiles, {name});

        if (!file) {
          throw new Error('Cannot find the custom file.');
        }

        // Setting current selected custom file
        RegisterResolver.customFile = file;
      }

      state = {
        project: RegisterResolver.projectService
          .getProject(props.match.params.projectId),
        isNew: false,
        availableFolders: availableFolders
      };
    } else {
      if (!props.match.params.projectId) {
        throw new Error('Missing mandatory parameter');
      }

      RegisterResolver.resolver = undefined;
      RegisterResolver.customFile = undefined;

      if (!props.isFile) {
        // Brand new resolver
        state = {
          project: RegisterResolver.projectService
            .getProject(props.match.params.projectId),
          isNew: true
        };
      } else {
        // Brand new custom file
        availableFolders = RegisterResolver.resolverService
          .getCustomFoldersFromProject(props.match.params.projectId);

        state = {
          project: RegisterResolver.projectService
            .getProject(props.match.params.projectId),
          isNew: true,
          availableFolders: availableFolders
        };
      }
    }

    return state;
  }

  public render() {
    const { theme } = this.context;
    const { typographyStyles } = theme;
    const { subHeader } = typographyStyles || {subHeader: {fontSize: '12px'}};

    const editorCustomClass = this.state.isNew
      ? 'create'
      : 'edit';

    const title = this.state.isNew
      ? (<h5 className='content-title' style={subHeader}>Create a new {this.props.isFile ? 'file' : 'resolver'}</h5>)
      : '';

    const code = this.currentCode
     ? this.currentCode
     : (
        !this.props.isFile
          ? (
            RegisterResolver.resolver
            ? RegisterResolver.resolver.content
            : resolverTemplate
          )
          : (
            RegisterResolver.customFile
            ? RegisterResolver.customFile.content
            : ''
          )
      )
    ;

    const confirmDialogProps: ContentDialogProps = {
      title: 'Do you confirm the changes?',
      content: 'bla bla',
    };

    if (!this.props.isFile) {
      // Resolver editor
      const nameSelector = this.state.availableResolverNames && this.state.availableResolverNames.length > 0
        ? (
          <DropDownMenu
            defaultValue={this.selectedName}
            values={this.state.availableResolverNames}
            onChangeValue={(value: string) => { this.selectedName = value; }}
          />
        )
        : '';

      const typeSelector = (
        <DropDownMenu
          defaultValue={this.selectedType}
          values={this.availableTypes}
          onChangeValue={(value: string) => { this.selectedType = value; }}
        />
      );

      const resolverActions = this.state.isNew
        ? (
          <div className='resolver-props-selectors'>
            {nameSelector}
            {typeSelector}
          </div>
        )
        : (
          <Button
            style={defaultBtnStyle}
            icon='Delete'
            onClick={this.deleteResolver}
          >
            Delete
          </Button>
        );

      return (
        <div className={`register-resolver ${editorCustomClass} screen`}>
          {/* The title */}
          {title}

          {/* The tools */}
          <div className='toolbar'>
            {/* The resolver name/type selectors | delete button */}
            {resolverActions}

            <Button
              style={defaultBtnStyle}
              icon='Save'
              onClick={this.saveResolver}
            >
              Save
            </Button>
            <Button
              style={defaultBtnStyle}
              icon='HelpLegacy'
            >
              Help
            </Button>
          </div>

          {/* The code editor */}
          <AceEditor
            width='100%'
            mode='typescript'
            theme='xcode'
            name='resolver-editor'
            fontSize={14}
            tabSize={2}
            showGutter={true}
            editorProps={{
              $blockScrolling: Infinity,
            }}
            value={code}
            onChange={this.onCodeChange}
          />

          {/* The confirm dialog */}
          <ContentDialog
            {...confirmDialogProps}
            defaultShow={this.state.showConfirmDialog}
          />
        </div>
      );
    } else {
      const newFileFolderInputs = this.state.isNew
        ? (
          <React.Fragment>
            {/*
            <DropDownMenu
              defaultValue={this.selectedFolder}
              values={this.state.availableFolders}
              onChangeValue={(value: string) => { this.selectedFolder = value; }}
            />
            */}
            <TextBox
              className='new-folder-input'
              placeholder={`Type the filename here`}
              onChangeValue={(value: string) => { this.currentFilename = value; }}
            />
          </React.Fragment>
        )
        : '';

      const deleteButton = !this.state.isNew
        ? (
          <Button
            style={defaultBtnStyle}
            icon='Delete'
            onClick={this.deleteFile}
          >
            Delete
          </Button>
        )
        : '';

      // Custom file editor
      return (
        <div className={`register-resolver ${editorCustomClass} screen`}>
          {/* The title */}
          {title}

          {/* The tools */}
          <div className='toolbar'>
            {newFileFolderInputs}
            {deleteButton}
            <Button
              style={defaultBtnStyle}
              icon='Save'
              onClick={this.saveFile}
            >
              Save
            </Button>
            <Button
              style={defaultBtnStyle}
              icon='HelpLegacy'
            >
              Help
            </Button>
          </div>

          {/* The code editor */}
          <AceEditor
            width='100%'
            mode='typescript'
            theme='xcode'
            name='resolver-editor'
            fontSize={14}
            tabSize={2}
            showGutter={true}
            editorProps={{
              $blockScrolling: Infinity,
            }}
            value={code}
            onChange={this.onCodeChange}
          />

          {/* The confirm dialog */}
          <ContentDialog
            {...confirmDialogProps}
            defaultShow={this.state.showConfirmDialog}
          />
        </div>
      );
    }
  }

  private onCodeChange(value: string): void {
    this.currentCode = value;

    if (this.state.isNew) {
      this.setState(update(
        this.state,
        {
          availableResolverNames: {
            $set: RegisterResolver.resolverService
              .desumeResolverNameFromContent(this.currentCode)
          }
        }
      ));
    }
  }

  private saveResolver(): void {
    if (this.state.isNew) {
      if (!this.selectedName) {
        if (this.state.availableResolverNames
          && this.state.availableResolverNames.length === 1
        ) {
          // Use the only available name
          this.selectedName = this.state.availableResolverNames[0];
        } else {
          // TODO: Please select a name
          alert('Please, select a name');
          return;
        }
      }

      if (!this.selectedType) {
        // Use the default one
        this.selectedType = TypeResolver.Query;
      }

      // A new resolver
      this.commitChanges(
        this.currentCode,
        this.selectedName,
        this.selectedType as TypeResolver
      );
    } else {
      // Just update the content
      this.commitChanges(
        this.currentCode
      );
    }

    // All the operations above are sync,
    // it's safe to call the callback right away
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  }

  private deleteResolver(): void {
    if (!this.state.project || !RegisterResolver.resolver) {
      throw new Error('Unexpected error while deleting the current resolver.');
    }

    if (this.state.isNew) {
      throw new Error('Nothing to be deleted.');
    } else {
      // TODO: Ask confirm

      RegisterResolver.resolverService
        .deleteResolver(
          RegisterResolver.resolver,
          this.state.project.id,
        );

      this.props.history.push(`/edit/${this.state.project.id}`);

      // All the operations above are sync,
      // it's safe to call the callback right away
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    }
  }

  private saveFile(): void {
    if (this.state.isNew) {
      if (this.currentFilename.length == 0) {
        // TODO: Dialog
        alert('Please type a filename');
        return;
      }

      if (!this.selectedFolder) {
        this.selectedFolder = '/';
      }

      // A new file
      this.commitFileChanges(
        this.currentCode,
        this.selectedFolder,
        this.currentFilename,
      );
    } else {
      // Just update the content
      this.commitFileChanges(
        this.currentCode
      );
    }

    // All the operations above are sync,
    // it's safe to call the callback right away
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  }

  private deleteFile(): void {
    if (!this.state.project) {
      throw new Error('Unexpected error while deleting the current resolver.');
    }

    if (this.state.isNew || !RegisterResolver.customFile) {
      throw new Error('Nothing to be deleted.');
    } else {
      // TODO: Ask confirm

      RegisterResolver.resolverService
        .deleteFile(RegisterResolver.customFile.filePath);

      this.props.history.push(`/edit/${this.state.project.id}`);

      // All the operations above are sync,
      // it's safe to call the callback right away
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    }
  }

  private commitChanges(
    classContent: string,
    name?: string,
    type?: TypeResolver,
  ): void {
    if (!this.state.project) {
      throw new Error('Unexpected error while commiting changes on the current resolver.');
    }

    if (this.state.isNew) {
      if (!name || !type) {
        throw new Error('Missing properties for new resolver');
      }

      RegisterResolver.resolverService
        .createResolver(this.state.project.id, name, classContent, type);
    } else {
      if (!RegisterResolver.resolver) {
        throw new Error('Resolver not available.');
      }

      if (!this.currentCode) {
        // TODO: Alert not throw
        throw new Error('Nothing to commit.');
      }

      RegisterResolver.resolverService
        .updateResolver(RegisterResolver.resolver, classContent);
    }
  }

  private commitFileChanges(
    fileContent: string,
    destPath?: string,
    filename?: string,
  ): void {
    if (!this.state.project) {
      throw new Error('Unexpected error while commiting changes on the current resolver.');
    }

    if (this.state.isNew) {
      if (!filename || !destPath) {
        throw new Error('Missing properties for new file');
      }

      RegisterResolver.resolverService
        .createFile(this.state.project.id, filename, destPath, fileContent);
    } else {
      if (!RegisterResolver.customFile) {
        throw new Error('Missing selected file');
      }

      // Update file
      RegisterResolver.resolverService
        .updateFile(RegisterResolver.customFile.filePath, fileContent);
    }
  }
}
