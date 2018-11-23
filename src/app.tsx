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
  services: any;
}

export class App extends React.Component<undefined, AppState> {
  private configService: ConfigService = new ConfigService();
  private projectService: ProjectService = new ProjectService();

  constructor(props: any) {
    super(props);
    this.state = {
      configurations: this.configService.getConfigurations(),
      services: this.projectService.getServices(),
    };

    this.refresh = this.refresh.bind(this);
  }

  public render() {
    return (
      <UWPThemeProvider
        theme={getTheme({
          themeName: this.state.configurations.theme.name.value,
          accent: this.state.configurations.theme.accentColor.value,
          useFluentDesign: true,
        })}
      >
        <div className='sidebar'>
          <Sidebar items={this.state.services} />
        </div>
        <div className='content'>
          <Router>
            <Switch>
              <Route path='/' exact component={() => <Create onSuccess={this.refresh} />} />
              <Route path='/create' exact component={() => <Welcome />} />
              <Route path='/edit' exact component={() => <Edit />} />
              <Route path='/run' exact component={() => <Run />} />
              <Route path='/new/resolver' exact component={() => <RegisterResolver />} />
            </Switch>
          </Router>
        </div>
      </UWPThemeProvider>
    );
  }

  private refresh(): void {
    console.log('Refreshing main app');
    /*
    this.setState(update(
      this.state,
      {
        services: {$set: this.projectService.getServices()}
      }
    ));
    */
  }
}
