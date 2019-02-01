import * as React from 'react';

export interface IRunProps {
}

export default class Run extends React.PureComponent<IRunProps, any> {
  public render() {
    return (
      <div className='run screen'>
        <h2>Let's run your first GraphQL service!</h2>
      </div>
    );
  }
}
