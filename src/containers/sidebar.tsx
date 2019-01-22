import * as React from 'react';
import * as _ from 'lodash';
import update from 'immutability-helper';

import { matchPath, withRouter } from 'react-router';

import { Project } from '../models/project';
import { Resolver } from '../services/resolverService';

import TextBox from 'react-uwp/TextBox';
import TreeView, { TreeItem } from 'react-uwp/TreeView';

export interface SidebarProps {
  // items is a list of orgs with projects inside
  items: any;
  match: any;
  location: any;
  history: any;
}

export interface SidebarState {
  selectedProjectId: string;
}

const addSign = '+';

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  private selectedProject: Project | undefined;
  private selectedResolver: Resolver | undefined;

  constructor(props: SidebarProps) {
    super(props);
    this.state = {
      selectedProjectId: '',
    };
    this.onItemSelected = this.onItemSelected.bind(this);
  }

  static getDerivedStateFromProps(
    props: SidebarProps,
    state: SidebarState
  ): SidebarState {
    // TODO: Improve this part
    const matchA = matchPath(props.location.pathname, {
      path: '/edit/:id',
      exact: true,
      strict: false
    });
    const matchB = matchPath(props.location.pathname, {
      path: '/resolvers/:projectId/new',
      exact: true,
      strict: false
    });
    const matchC = matchPath(props.location.pathname, {
      path: '/resolvers/:projectId/:hash',
      exact: true,
      strict: false
    });
    let projectId;
    if (matchA) {
      projectId = matchA.params['projectId'];
    }
    if (matchB) {
      projectId = matchB.params['projectId'];
    }
    if (matchC) {
      projectId = matchC.params['projectId'];
    }

    if (projectId) {
      return {
        selectedProjectId: projectId
      };
    } else {
      return state;
    }
  }

  public render() {
    const { items } = this.props;

    if (items) {
      const trees = _.map(
        items,
        (projects: Project[], org: string) => this.getProjectsTree(org, projects)
      );

      return (
        <div>
          <TextBox
            placeholder='Search...'
          />
          {trees}
        </div>
      );
    } else {
      return (
        <div>
          Loading projects
        </div>
      );
    }
  }

  private getProjectsTree(index: string, projects: Project[]): JSX.Element {
    const tree: TreeItem[] = [];

    tree.push({
      title: `${addSign} Add new project`
    });

    _.each(projects, (project: Project) => {
      const branch: TreeItem = {};
      branch.title = project.name;
      branch.expanded = this.state.selectedProjectId === project.id;
      branch.children = [];

      _.each(project.resolvers, (resolver: Resolver) => {
        if (branch.children) {
          branch.children.push({
            title: resolver.name
          });
        }
      });

      if (branch.children) {
        branch.children.push({
          title: `${addSign} Add new resolver`
        });
      }

      tree.push(branch);
    });

    return (
      <div key={index}>
        <TreeView
          style={{ width: '100%', padding: 0 }}
          iconDirection='left'
          itemHeight={36}
          listSource={tree}
          showFocus
          onChooseTreeItem={this.onItemSelected}
        />
      </div>
    );
  }

  private onItemSelected(item: TreeItem): void {
    // NOTE: Due to the limitations of the TreeView we had
    // to find this dirty hacky solution in order to understand
    // the kind of item who have been selected.
    if (item.title && item.title.indexOf(addSign) === 0) {
      // It's the adding action
      // TODO: Find a better solution for match the
      // adding actions.
      if (item.title.indexOf('project') > 0) {
        // Add a new project
        this.onNewProject();
      } else {
        // Add a new resolver
        if (!this.selectedProject) {
          throw new Error('Trying to select a resolver outside a project selection.');
        }
        this.onNewResolver(this.selectedProject.id);
      }
    } else if (item.children && item.children.length > 0) {
      // It's a project
      let project: Project | undefined;
      _.each(this.props.items, (org: any): any => {
        project = _.find(org, {name: item.title}) as Project;
        if (project) {
          return true;
        }
      });

      if (!project) {
        throw new Error('Trying to select a project that does not exist.');
      }

      this.onProjectSelected(project);
    } else {
      // It's a resolver
      if (!this.selectedProject) {
        throw new Error('Trying to select a resolver outside a project selection.');
      }

      const resolver = _.find(this.selectedProject.resolvers, {name: item.title});
      if (!resolver) {
        throw new Error('Trying to select a resolver that does not exist.');
      }

      this.onResolverSelected(this.selectedProject.id, resolver);
    }
  }

  private onProjectSelected(project: Project): void {
    this.selectedProject = project;
    this.selectedResolver = undefined;
    this.setState(update(
      this.state,
      {
        selectedProjectId: {$set: project.id}
      }
    ));

    if (!this.props.history.location.pathname.match(new RegExp(`\/${project.id}$`, 'ig'))) {
      this.props.history.push(`/edit/${project.id}`);
    }
  }

  private onResolverSelected(projectId: string, resolver: Resolver): void {
    this.selectedResolver = resolver;
    const resolverHash = btoa(resolver.name);
    if (!this.props.history.location.pathname.match(new RegExp(`\/${resolverHash}$`, 'ig'))) {
      this.props.history.push(`/resolvers/${projectId}/${resolverHash}`);
    }
  }

  private onNewResolver(projectId: string): void {
    if (!this.props.history.location.pathname.match(new RegExp(`\/resolvers\/${projectId}\/new$`, 'ig'))) {
      this.props.history.push(`/resolvers/${projectId}/new`);
    }
  }

  private onNewProject(): void {
    if (!this.props.history.location.pathname.match(new RegExp(`\/create$`, 'ig'))) {
      this.props.history.push(`/create`);
    }
  }
}

export default withRouter(Sidebar);