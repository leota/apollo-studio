import * as React from 'react';
import * as _ from 'lodash';

import { Project } from '../models/project';

import TextBox from 'react-uwp/TextBox';

export interface SidebarProps {
  items: Project[];
}

export interface SidebarState {
}

export default class Sidebar extends React.Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { items } = this.props;

    if (items) {
      const itemsEls = _.map(items, this.getItemElement);
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
    item = item[0];
    return (
      <div key={index}>
        <span className='project-name'>{item.name}</span>
      </div>
    );
  }
}
