import * as React from 'react';
import * as _ from 'lodash';

import update from 'immutability-helper';

import { Project } from '../models/project';
import { ProjectService } from '../services';
import { ResolverService, Resolver, TypeResolver } from '../services/resolverService';

import Button from 'react-uwp/Button';
import ContentDialog, { ContentDialogProps } from 'react-uwp/ContentDialog';
import DropDownMenu from 'react-uwp/DropDownMenu';

// The editor
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/typescript';
import 'brace/theme/cobalt';

export interface IRegisterResolverProps {
  onSuccess?: () => void;
  match: any;
  location: any;
  history: any;
}

interface RegisterResolverState {
  project?: Project;
  isNew?: boolean;
  showConfirmDialog?: boolean;
  availableResolverNames?: string[];
}

const defaultBtnStyle: React.CSSProperties = {
  padding: 10
};
const defaultDropDownStyle: React.CSSProperties = {
  marginRight: '20px',
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
  static projectService: ProjectService = new ProjectService();
  static resolverService: ResolverService = new ResolverService();
  static resolver: Resolver | undefined;

  private currentCode: string;
  private selectedName: string;
  private selectedType: string;

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
    this.onCodeChange = this.onCodeChange.bind(this);
  }

  static getDerivedStateFromProps(
    props: IRegisterResolverProps,
    state: RegisterResolverState
  ): RegisterResolverState {
    let output = {};

    if (
      props.match.params.projectId
      && props.match.params.hash
    ) {
      output = {
        project: RegisterResolver.projectService
          .getProject(props.match.params.projectId),
        isNew: false,
      };

      const resolvers: Resolver[] = RegisterResolver.resolverService
        .getResolversFromProject(props.match.params.projectId);

      const name = atob(props.match.params.hash);
      const resolver = _.find(resolvers, {name});

      if (!resolver) {
        throw new Error('Cannot find the resolver.');
      }

      // Setting current selected resolver
      RegisterResolver.resolver = resolver;
    } else {
      if (!props.match.params.projectId) {
        throw new Error('Missing mandatory parameter');
      }

      RegisterResolver.resolver = undefined;
      output = {
        project: RegisterResolver.projectService
          .getProject(props.match.params.projectId),
        isNew: true
      };
    }

    return output;
  }

  public render() {
    const title = this.state.isNew
      ? (<h2>Create a new resolver</h2>)
      : '';

    const code = this.currentCode
     ? this.currentCode
     : (
        RegisterResolver.resolver
          ? RegisterResolver.resolver.content
          : resolverTemplate
      )
    ;

    const propsSelectors = this.state.isNew
      ? (
        <div className='resolver-props-selectors'>
          <DropDownMenu
            style={defaultDropDownStyle}
            defaultValue={this.selectedName}
            values={this.state.availableResolverNames}
            onChangeValue={(value: string) => { this.selectedName = value; }}
          />
          <DropDownMenu
            style={defaultDropDownStyle}
            defaultValue={this.selectedType}
            values={this.availableTypes}
            onChangeValue={(value: string) => { this.selectedType = value; }}
          />
        </div>
      )
      : '';

    const confirmDialogProps: ContentDialogProps = {
      title: 'Do you confirm the changes?',
      content: 'bla bla',
    };

    return (
      <div className='register-resolver screen'>
        {/* The title */}
        {title}

        {/* The tools */}
        <div className='toolbar'>
          {/* The resolver name/type selectors */}
          {propsSelectors}

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
          theme='cobalt'
          name='resolver-editor'
          tabSize={2}
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
        }
      }

      if (!this.selectedType) {
        // Use the default one
        this.selectedType = TypeResolver.Query;
      }

      if (this.selectedName && this.selectedType) {
        // A new resolver
        this.commitChanges(
          this.currentCode,
          this.selectedName,
          this.selectedType as TypeResolver
        );
      }

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

      RegisterResolver.resolverService
        .updateResolver(this.state.project.id, RegisterResolver.resolver, classContent);
    }
  }
}
