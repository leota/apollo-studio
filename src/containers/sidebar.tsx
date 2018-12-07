import * as React from 'react';
import * as _ from 'lodash';

import {withRouter} from 'react-router';

import { Project } from '../models/project';
import { Resolver } from '../services/resolverService';

import TextBox from 'react-uwp/TextBox';
import TreeView, { TreeItem } from 'react-uwp/TreeView';

export interface SidebarProps {
  items: Project[];
  match: any;
  location: any;
  history: any;
}

export interface SidebarState {
  // nothing
}

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {};
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

    _.each(projects, (project: Project) => {
      const branch: TreeItem = {};
      branch.title = project.name;
      branch.children = [];

      _.each(project.resolvers, (resolver: Resolver) => {
        if (branch.children) {
          branch.children.push({
            title: resolver.name
          });
        }
      });

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
        />
      </div>
    );
  }

  private onProjectSelected(item: Project): void {
    if (!this.props.history.location.pathname.match(new RegExp(`\/${item.id}$`, 'ig'))) {
      this.props.history.push(`/edit/${item.id}`);
    }
  }
}

export default withRouter(Sidebar);