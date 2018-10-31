import * as React from 'react';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import {
  ConfigService,
  ProjectService,
} from './services';

// containers
import {
  Sidebar,
} from './containers';

interface AppState {
  configurations: any;
  organizations: any;
}

export class App extends React.Component<undefined, AppState> {
  private configService: ConfigService = new ConfigService();
  private projectService: ProjectService = new ProjectService();

  constructor(props: any) {
    super(props);

    this.state = {
      configurations: this.configService.getConfigurations(),
      organizations: this.projectService.getServices(),
    };
  }

  render() {
    return (
      <UWPThemeProvider
        theme={getTheme({
          themeName: this.state.configurations.theme.name.value,
          accent: this.state.configurations.theme.accentColor.value,
          useFluentDesign: true,
        })}
      >
        <Sidebar items={this.state.organizations} />
        <Router>
          <Route path='/' exact component={() => {/* */}} />
        </Router>
      </UWPThemeProvider>
    );
  }
}
