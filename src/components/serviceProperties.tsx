import * as React from 'react';
import * as _ from 'lodash';

import { ProjectService } from '../services';
import { initialProject, IProject } from '../models/project';

import TextBox from 'react-uwp/TextBox';
import CheckBox from 'react-uwp/CheckBox';
import Button from 'react-uwp/Button';

interface ServicePropertiesProps {
  onLoading?: (state: boolean) => void;
  onSave?: () => void;
  onError?: (err?: Error) => void;
  service?: IProject;
}

interface ServicePropertiesState { }

class ServiceProperties extends React.PureComponent<ServicePropertiesProps, ServicePropertiesState> {
  public static service: IProject;

  private projectService: ProjectService = new ProjectService();

  constructor(props: ServicePropertiesProps) {
    super(props);
    this.state = { };
  }

  static getDerivedStateFromProps(
    props: ServicePropertiesProps,
    state: ServicePropertiesState
  ): ServicePropertiesState {
    ServiceProperties.service = props.service || _.cloneDeep(initialProject);
    return state;
  }

  public render() {
    const onNameChange = (value: any) => {
      /* do nothing */
    };

    return (
      <div className='service-properties'>
        {this.textProperty(
          'Service name',
          ServiceProperties.service.name,
          'name',
          onNameChange
        )}
        {this.textProperty(
          'Hosting domain',
          ServiceProperties.service.targetDomain,
          'targetDomain'
        )}
        {this.textProperty(
          'Default port',
          ServiceProperties.service.defaults.port,
          'defaults.port'
        )}
        {this.textProperty(
          'Default addr',
          ServiceProperties.service.defaults.addr,
          'defaults.addr'
        )}
        {this.textProperty(
          'GraphQL endpoint',
          ServiceProperties.service.graphql.path,
          'graphql.path'
        )}
        {this.textProperty(
          'REST endpoint',
          ServiceProperties.service.rest.path,
          'rest.path'
        )}
        {this.textProperty(
          'Views engine',
          ServiceProperties.service.views.engine,
          'views.engine'
        )}
        {this.textProperty(
          'Views source folder',
          ServiceProperties.service.views.src,
          'views.src'
        )}
        {this.multipleSelectionProperty(
          'Accepted domains',
          initialProject.cors.acceptedDomains,
          'cors.acceptedDomains'
        )}
        {this.multipleSelectionProperty(
          'Accepted methods',
          initialProject.cors.methods,
          'cors.methods'
        )}
        {this.booleanProperty(
          'Pre-flight continue',
          ServiceProperties.service.cors.preflightContinue,
          'cors.preflightContinue'
        )}
        {this.textProperty(
          'OPTIONs success status',
          ServiceProperties.service.cors.optionsSuccessStatus,
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
    if (ServiceProperties.service) {
      if (this.props.onLoading) {
        this.props.onLoading(true);
      }

      this.projectService
      .saveProject('org', ServiceProperties.service)
      .then(() => {
        if (this.props.onSave) {
          this.props.onSave();
        }

        if (this.props.onLoading) {
          this.props.onLoading(false);
        }
      })
      .catch((err: Error) => {
        if (this.props.onError) {
          this.props.onError(err);
        }

        if (this.props.onLoading) {
          this.props.onLoading(false);
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
              _.set(ServiceProperties.service, propertyPath, change);
              if (onChange) {
                onChange(change);
              }
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
        <span className='value input-checkbox'>
          {values.map((value: string, index: number): JSX.Element =>
            <CheckBox
              key={index}
              defaultChecked={
                !!_.get(
                  ServiceProperties.service,
                  // A bit dirty and hacky, plz refactor it asap :P
                  `${propertyPath}.${_.get(ServiceProperties.service, propertyPath).indexOf(value)}`
                )
              }
              label={value}
              labelPosition='left'
              onCheck={(change: boolean) => {
                let propertyValue: any[] = _.get(ServiceProperties.service, propertyPath);
                const propertyValueIndex = propertyValue.indexOf(value);

                if (change) {
                  if (propertyValueIndex < 0) {
                    propertyValue.push(value);
                  }
                } else {
                  _.set(
                    ServiceProperties.service,
                    propertyPath,
                    propertyValue.filter((value: any, index: number) => value != null && index != propertyValueIndex)
                  );
                }

                if (onChange) {
                  onChange(change);
                }
              }}
            />
          )}
        </span>
      </div>
    );
  }

  private booleanProperty(
    key: string,
    value: any,
    propertyPath: string,
    onChange?: (value: any) => void,
  ): JSX.Element {
    return (
      <div key={Math.random()} className='service-property'>
        <span className='label'>{key}</span>
        <span className='value input-checkbox'>
          <CheckBox
            defaultChecked={_.get(ServiceProperties.service, propertyPath)}
            onCheck={(change: boolean) => {
              _.set(ServiceProperties.service, propertyPath, change);
              if (onChange) {
                onChange(change);
              }
            }}
          />
        </span>
      </div>
    );
  }
}

export default ServiceProperties;