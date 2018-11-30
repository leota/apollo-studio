import * as React from 'react';

export interface IWelcomeProps {
  // nothing
}

export default class Welcome extends React.PureComponent<IWelcomeProps, any> {
  constructor(props: IWelcomeProps) {
    super(props);
  }
  public render() {
    return (
      <div className='welcome screen'>
        <h2>Hello world!</h2>
      </div>
    );
  }
}
