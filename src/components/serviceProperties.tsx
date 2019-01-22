import * as React from 'react';
import * as _ from 'lodash';
import update from 'immutability-helper';

import { ProjectService } from '../services';
import { Project, initialProject, IProject } from '../models/project';

import TextBox from 'react-uwp/TextBox';
import CheckBox from 'react-uwp/CheckBox';
import Button from 'react-uwp/Button';

interface ServicePropertiesProps {
  onSave?: () => void;
  onError?: () => void;
  service?: IProject;
}

interface ServicePropertiesState {
  service: IProject;
}

class ServiceProperties extends React.PureComponent<ServicePropertiesProps, ServicePropertiesState> {
  private projectService: ProjectService = new ProjectService();

  constructor(props: ServicePropertiesProps) {
    super(props);
    this.state = {
      service: props.service || initialProject,
    };
  }

  static getDerivedStateFromProps(
    props: ServicePropertiesProps,
    state: ServicePropertiesState
  ): ServicePropertiesState {
    return {
      service: props.service
        ? props.service
        : state.service
    };
  }

  public render() {
    const onNameChange = (value: any) => {
      /* do nothing */
    };

    return (
      <div className='service-properties'>
        {this.textProperty(
          'Service name',
          (this.state.service
            ? this.state.service.name
            : initialProject.name),
          'name',
          onNameChange
        )}
        {this.textProperty(
          'Target domain',
          (this.state.service
            ? this.state.service.targetDomain
            : initialProject.targetDomain),
          'targetDomain'
        )}
        {this.textProperty(
          'Default port',
          (this.state.service
            ? this.state.service.defaults.port
            : initialProject.defaults.port),
          'defaults.port'
        )}
        {this.textProperty(
          'Default addr',
          (this.state.service
            ? this.state.service.defaults.addr
            : initialProject.defaults.addr),
          'defaults.addr'
        )}
        {this.textProperty(
          'GraphQL endpoint',
          (this.state.service
            ? this.state.service.graphql.path
            : initialProject.graphql.path),
          'graphql.path'
        )}
        {this.textProperty(
          'REST endpoint',
          (this.state.service
            ? this.state.service.rest.path
            : initialProject.rest.path),
          'rest.path'
        )}
        {this.textProperty(
          'Views engine',
          (this.state.service
            ? this.state.service.views.engine
            : initialProject.views.engine),
          'views.engine'
        )}
        {this.textProperty(
          'Views source folder',
          (this.state.service
            ? this.state.service.views.src
            : initialProject.views.src),
          'views.src'
        )}
        {this.multipleSelectionProperty(
          'Accepted domains',
          (this.state.service
            ? this.state.service.cors.acceptedDomains
            : initialProject.cors.acceptedDomains),
          'cors.acceptedDomains'
        )}
        {this.multipleSelectionProperty(
          'Accepted methods',
          (this.state.service
            ? this.state.service.cors.methods
            : initialProject.cors.methods),
          'cors.methods'
        )}
        {this.booleanProperty(
          'Pre-flight continue',
          (this.state.service
            ? this.state.service.cors.preflightContinue
            : initialProject.cors.preflightContinue),
          'cors.preflightContinue'
        )}
        {this.textProperty(
          'OPTIONs success status',
          (this.state.service
            ? this.state.service.cors.optionsSuccessStatus
            : initialProject.cors.optionsSuccessStatus),
          'cors.optionsSuccessStatus'
        )}

        <div className='actions'>
          <Button
            icon='Save'
            onClick={() => { this.onSave(); }}
          >
            {this.props.service ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    );
  }

  private onSave(): void {
    if (this.state.service) {
      this.projectService
      .saveProject('org', this.state.service)
      .then(() => {
        if (this.props.onSave) {
          this.props.onSave();
        }
      })
      .catch((err: Error) => {
        if (this.props.onError) {
          this.props.onError();
        }
      });
    } else {
      throw new Error('The service does not exist in the state');
    }
  }

  private textProperty(
    key: string,
    value: any,
    propertyPath: string,
    onChange?: (value: any) => void,
  ): JSX.Element {
    if (value == null) {
      return (<div />);
    }

    return (
      <div key={Math.random()} className='service-property'>
        <span className='label'>{key}</span>
        <span className='value'>
          <TextBox
            background='none'
            defaultValue={value}
            onChangeValue={(change: string) => {
              let tempService = Object.assign({}, this.state.service);
              tempService = _.set(tempService, propertyPath, change);
              this.setState(
                update(
                  this.state,
                  {
                    $set: {
                      service: tempService
                    }
                  }
                ),
                () => {
                  if (onChange) {
                    onChange(change);
                  }
                }
              );
            }}
          />
        </span>
      </div>
    );
  }

  private multipleSelectionProperty(
    key: string,
    values: string[],
    propertyPath: string,
    onChange?: (value: any) => void,
  ): JSX.Element {
    return (
      <div key={Math.random()} className='service-property'>
        <span className='label'>{key}</span>
        <span className='value'>
          {values.map((value: string, index: number): JSX.Element =>
            <CheckBox
              key={index}
              defaultChecked={
                !!_.get(
                  this.state.service,
                  // A bit dirty and hacky, plz refactor it asap :P
                  `${propertyPath}.${_.get(this.state.service, propertyPath).indexOf(value)}`
                )
              }
              label={value}
              labelPosition='left'
              onCheck={(change: boolean) => {
                let tempService = Object.assign({}, this.state.service);
                const propertyValue = _.get(tempService, propertyPath);
                const propertyValueIndex = propertyValue.indexOf(value);

                if (change) {
                  if (propertyValueIndex < 0) {
                    propertyValue.push(value);
                  }
                } else {
                  _.unset(tempService, `${propertyPath}.${propertyValueIndex}`);
                }

                this.setState(
                  update(
                    this.state,
                    {
                      $set: {
                        service: tempService
                      }
                    }
                  ),
                  () => {
                    if (onChange) {
                      onChange(change);
                    }
                  }
                );
              }}
            />
          )}
        </span>
      </div>
    );
  }

  private booleanProperty(
    key: string,
    value: boolean,
    propertyPath: string,
    onChange?: (value: any) => void,
  ): JSX.Element {
    return (
      <div key={Math.random()} className='service-property'>
        <span className='label'>{key}</span>
        <span className='value'>
          <CheckBox
            defaultChecked={_.get(this.state.service, propertyPath)}
            onCheck={(change: boolean) => {
              let tempService = Object.assign({}, this.state.service);
              tempService = _.set(tempService, propertyPath, change);
              this.setState(
                update(
                  this.state,
                  {
                    $set: {
                      service: tempService
                    }
                  }
                ),
                () => {
                  if (onChange) {
                    onChange(change);
                  }
                }
              );
            }}
          />
        </span>
      </div>
    );
  }
}

export default ServiceProperties;