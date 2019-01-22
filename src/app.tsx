import * as React from 'react';
import update from 'immutability-helper';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

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
}

interface AppProps {}

export class App extends React.Component<AppProps, AppState> {
  private configService: ConfigService = new ConfigService();
  private projectService: ProjectService = new ProjectService();

  constructor(props: AppProps) {
    super(props);
    this.state = {
      configurations: this.configService.getConfigurations(),
      // Projects are grouped by "orgs"
      projects: this.projectService.getProjects(),
    };

    this.refresh = this.refresh.bind(this);
  }

  public render() {
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
            <Switch>
              <Route path='/' exact component={(props: any) =>
                <Welcome {...props} />} />

              <Route path='/create' exact component={(props: any) =>
                <Create {...props} onSuccess={this.refresh} />} />

              <Route path='/edit/:id' exact component={(props: any) =>
                <Edit {...props} onSuccess={this.refresh} />} />

              <Route path='/resolvers/:projectId/new' exact component={(props: any) =>
                <RegisterResolver {...props} onSuccess={this.refresh} />} />

              <Route path='/resolvers/:projectId/:hash' exact component={(props: any) =>
                <RegisterResolver {...props} onSuccess={this.refresh} items={this.state.projects} />} />

              <Route path='/run' exact component={(props: any) =>
                <Run {...props} />} />
            </Switch>
          </div>
        </UWPThemeProvider>
      </Router>
    );
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
