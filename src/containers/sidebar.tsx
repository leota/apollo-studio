import * as React from 'react';
import * as _ from 'lodash';

import {withRouter} from 'react-router';

import { Project } from '../models/project';

import TextBox from 'react-uwp/TextBox';

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
      const itemsEls = _.map(
        items,
        (projects: Project[], org: string) => _.map(
          projects,
          (item: Project, i: number) => this.getItemElement(item, i)
        )
      );

      return (
        <div>
          <TextBox
            placeholder='Search...'
          />
          {itemsEls}
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

  private getItemElement(item: Project, index: number): JSX.Element {
    return (
      <div key={index}>
        <span className='project-name' onClick={() => this.onProjectSelected(item) }>{item.name}</span>
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