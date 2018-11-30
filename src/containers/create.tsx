import * as React from 'react';
import * as PropTypes from 'prop-types';
import Toast from 'react-uwp/Toast';

import ServiceProperties from '../components/serviceProperties';

export interface ICreateProps {
  projectId?: string;
  onSuccess?: () => void;
}

interface CreateState {
  showSuccess?: boolean;
  showError?: boolean;
}

export default class Create extends React.PureComponent<ICreateProps, CreateState> {
  static contextTypes = { theme: PropTypes.object };
  public context: { theme: ReactUWP.ThemeType };

  private successToastDelay = 5500;
  private successToastTitle = 'All done';
  private successToastLines = ['A new service is ready to be run', 'Enjoy!'];

  private errorToastDelay = 5500;
  private errorToastTitle = 'Ooops...';
  private errorToastLines = ['Something wrong happened', 'Check the preferencies or retry later :-('];

  constructor(props: ICreateProps) {
    super(props);
    this.state = {
      showSuccess: false,
      showError: false,
    };
    this.onSave = this.onSave.bind(this);
    this.onError = this.onError.bind(this);
  }

  public render() {
    const { theme } = this.context;
    const { typographyStyles } = theme;
    const { subHeader } = typographyStyles || {subHeader: {fontSize: '12px'}};

    return (
      <div className='create screen'>
        <h5 style={subHeader}>
          Create a new service
        </h5>
        <ServiceProperties
          onSave={this.onSave}
          onError={this.onError}
        />
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

  private onSave(): void {
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
