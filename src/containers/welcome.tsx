import * as React from 'react';

export interface IWelcomeProps {
}

export default class Welcome extends React.PureComponent<IWelcomeProps, any> {
  public render() {
    return (
      <div className='welcome screen'>
        <h2>Hello world!</h2>
      </div>
    );
  }
}
