import * as React from 'react';
import * as PropTypes from 'prop-types';

import { Project } from '../models/project';

import ServiceProperties from '../components/serviceProperties';
import { ProjectService } from '../services';

import Button from 'react-uwp/Button';

export interface IEditProps {
  match: any;
  location: any;
  history: any;
  onLoading?: (state: boolean) => void;
  onSuccess?: () => void;
  onError?: (err?: Error) => void;
}

interface EditState {
  project?: Project;
}

export default class Edit extends React.PureComponent<IEditProps, EditState> {
  static contextTypes = { theme: PropTypes.object };
  public context: { theme: ReactUWP.ThemeType };

  private static projectService: ProjectService = new ProjectService();

  constructor(props: IEditProps, context?: any) {
    super(props, context);
    this.state = { };
    this.onSave = this.onSave.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onError = this.onError.bind(this);
  }

  static getDerivedStateFromProps(
    props: IEditProps,
    state: EditState
  ): EditState {
    if (state.project && props.match.params.id === state.project.id) {
      console.log('Project already loaded');
      return state;
    }

    return {
      project: Edit.projectService.getProject(props.match.params.id)
    };
  }

  public render() {
    const { theme } = this.context;
    const { typographyStyles } = theme;
    const { subHeader } = typographyStyles || {subHeader: {fontSize: '12px'}};

    if (!this.state.project) {
      return (
        <div className='create screen'>
          Please, select a service to edit.
        </div>
      );
    } else {
      return (
        <div className='create screen'>
          <h5 className='content-title' style={subHeader}>
            Edit {this.state.project.name}
            <Button
              className='title-action'
              icon='Delete'
              onClick={() => { this.onDelete(); }}
            >
              Delete
            </Button>
          </h5>

          <div className='panels'>
            <div>
              <ServiceProperties
                service={this.state.project}
                onLoading={this.props.onLoading}
                onSave={this.onSave}
                onError={this.onError}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  private onSave(): void {
    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  }

  private onDelete(): void {
    if (!this.state.project) {
      throw new Error('There is no project to delete.');
    }

    Edit.projectService.deleteProject('org', this.state.project);

    if (this.props.onSuccess) {
      this.props.onSuccess();
    }
  }

  private onError(err?: Error): void {
    if (this.props.onError) {
      this.props.onError(err);
    }
  }
}
