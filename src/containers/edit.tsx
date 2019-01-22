import * as React from 'react';
import * as PropTypes from 'prop-types';
import update from 'immutability-helper';

import { Project } from '../models/project';

import ServiceProperties from '../components/serviceProperties';
import { ProjectService } from '../services';

import Toast from 'react-uwp/Toast';
import Button from 'react-uwp/Button';

export interface IEditProps {
  onSuccess?: () => void;
  match: any;
  location: any;
  history: any;
}

interface EditState {
  project?: Project;
  showSuccess?: boolean;
  showError?: boolean;
}

export default class Edit extends React.PureComponent<IEditProps, EditState> {
  static contextTypes = { theme: PropTypes.object };
  public context: { theme: ReactUWP.ThemeType };

  private successToastDelay = 5500;
  private successToastTitle = 'All done';
  private successToastLines = ['A new service is ready to be run', 'Enjoy!'];

  private errorToastDelay = 5500;
  private errorToastTitle = 'Ooops...';
  private errorToastLines = ['Something wrong happened', 'Check the preferencies or retry later :-('];

  private static projectService: ProjectService = new ProjectService();

  constructor(props: IEditProps, context?: any) {
    super(props, context);
    this.state = {
      showSuccess: false,
      showError: false,
    };
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
          <h5 style={subHeader}>
            Edit {this.state.project.name}
            <Button
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
                onSave={this.onSave}
                onError={this.onError}
              />
            </div>
          </div>

          <Toast
            defaultShow={this.state.showSuccess}
            onToggleShowToast={showSuccess => this.setState({ showSuccess })}
            title={this.successToastTitle}
            description={this.successToastLines}
            closeDelay={this.successToastDelay}
            showCloseIcon
          />
          <Toast
            defaultShow={this.state.showError}
            onToggleShowToast={showError => this.setState({ showError })}
            title={this.errorToastTitle}
            description={this.errorToastLines}
            closeDelay={this.errorToastDelay}
            showCloseIcon
          />
        </div>
      );
    }
  }

  private onSave(): void {
    this.setState({ showSuccess: true }, () => {
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    });
  }

  private onDelete(): void {
    if (!this.state.project) {
      throw new Error('There is no project to delete.');
    }

    Edit.projectService.deleteProject('org', this.state.project);

    this.setState({ showSuccess: true }, () => {
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    });
  }

  private onError(): void {
    this.setState({ showError: true });
  }
}
