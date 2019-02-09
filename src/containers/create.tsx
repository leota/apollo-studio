import * as React from 'react';
import * as PropTypes from 'prop-types';

import ServiceProperties from '../components/serviceProperties';

export interface ICreateProps {
  projectId?: string;
  onLoading?: (state: boolean) => void;
  onSuccess?: () => void;
  onError?: (err?: Error) => void;
}

interface CreateState {}

export default class Create extends React.PureComponent<ICreateProps, CreateState> {
  static contextTypes = { theme: PropTypes.object };
  public context: { theme: ReactUWP.ThemeType };

  constructor(props: ICreateProps) {
    super(props);
    this.state = {};
    this.onSave = this.onSave.bind(this);
    this.onError = this.onError.bind(this);
  }

  public render() {
    const { theme } = this.context;
    const { typographyStyles } = theme;
    const { subHeader } = typographyStyles || {subHeader: {fontSize: '12px'}};

    return (
      <div className='create screen'>
        <h5 className='content-title' style={subHeader}>
          Create a new service
        </h5>
        <ServiceProperties
          onLoading={this.props.onLoading}
          onSave={this.onSave}
          onError={this.onError}
        />
      </div>
    );
  }

  private onSave(): void {
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
