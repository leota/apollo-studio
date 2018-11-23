import * as React from 'react';

export interface IEditProps {
}

export default class Edit extends React.PureComponent<IEditProps, any> {
  public render() {
    return (
      <div className='edit screen'>
        <h2>Let's edit your first BFF!</h2>
      </div>
    );
  }
}
