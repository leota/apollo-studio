import * as React from 'react';
import update from 'immutability-helper';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Toast from 'react-uwp/Toast';
import ProgressBar from 'react-uwp/ProgressBar';

import {
  ConfigService,
  ProjectService,
} from './services';

// containers
import {
  Sidebar,
  Welcome,
  Create,
  Edit,
  RegisterResolver,
  Run,
} from './containers';

interface AppState {
  configurations: any;
  projects: any;
  showSuccess: boolean;
  showError: boolean;
  isLoading: boolean;
}

interface AppProps {}

export class App extends React.Component<AppProps, AppState> {
  private configService: ConfigService = new ConfigService();
  private projectService: ProjectService = new ProjectService();

  private successToastDelay = 5500;
  private successToastTitle = 'All done';
  private successToastLines = ['A new service is ready to be run', 'Enjoy!'];

  private errorToastDelay = 5500;
  private errorToastTitle = 'Ooops...';
  private errorToastLines = ['Something wrong happened', 'Check the preferencies or retry later :-('];

  constructor(props: AppProps) {
    super(props);

    this.state = {
      configurations: this.configService.getConfigurations(),
      // Projects are grouped by "orgs"
      projects: this.projectService.getProjects(),
      showSuccess: false,
      showError: false,
      isLoading: false,
    };

    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    this.onLoading = this.onLoading.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  public render() {
    const loader = this.state.isLoading
      ? (<ProgressBar className='loader' isIndeterminate />)
      : '';

    return (
      <Router>
        <UWPThemeProvider
          theme={getTheme({
            themeName: this.state.configurations.theme.name.value,
            accent: this.state.configurations.theme.accentColor.value,
            useFluentDesign: true,
          })}
        >
          <div className='sidebar'>
            <Sidebar items={this.state.projects} />
          </div>
          <div className='content'>
            {loader}
            <Switch>
              <Route path='/' exact component={(props: any) =>
                <Welcome {...props} />} />

              <Route path='/create' exact component={(props: any) =>
                <Create {...props} onLoading={this.onLoading} onSuccess={this.onSuccess} onError={this.onError} />} />

              <Route path='/edit/:id' exact component={(props: any) =>
                <Edit {...props} onLoading={this.onLoading} onSuccess={this.onSuccess} onError={this.onError} />} />

              <Route path='/resolvers/:projectId/new' exact component={(props: any) =>
                <RegisterResolver {...props} onSuccess={this.refresh} />} />

              <Route path='/resolvers/:projectId/:hash' exact component={(props: any) =>
                <RegisterResolver {...props} onSuccess={this.refresh} items={this.state.projects} />} />

              <Route path='/run' exact component={(props: any) =>
                <Run {...props} />} />
            </Switch>
          </div>
          <div className='fx bg-gradient'></div>
          <div className='fx corner-bottom-right'></div>
          <div className='fx smoke'></div>
          <Toast
            defaultShow={this.state.showSuccess}
            onToggleShowToast={() => this.setState(update(this.state, {$toggle: ['showSuccess']}))}
            title={this.successToastTitle}
            description={this.successToastLines}
            closeDelay={this.successToastDelay}
            showCloseIcon
          />
          <Toast
            defaultShow={this.state.showError}
            onToggleShowToast={() => this.setState(update(this.state, {$toggle: ['showError']}))}
            title={this.errorToastTitle}
            description={this.errorToastLines}
            closeDelay={this.errorToastDelay}
            showCloseIcon
          />
        </UWPThemeProvider>
      </Router>
    );
  }

  private onSuccess(): void {
    this.refresh();
    this.setState(update(
      this.state,
      {
        $toggle: ['showSuccess']
      }
    ));
  }

  private onError(): void {
    this.setState(update(
      this.state,
      {
        $toggle: ['showError']
      }
    ));
  }

  private onLoading(state: boolean): void {
    this.setState(update(
      this.state,
      {
        $toggle: ['isLoading']
      }
    ));
  }

  private refresh(): void {
    this.setState(update(
      this.state,
      {
        projects: {$set: this.projectService.getProjects()}
      }
    ));
  }
}
