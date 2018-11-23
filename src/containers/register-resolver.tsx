import * as React from 'react';

export interface IRegisterResolverProps {
}

export default class RegisterResolver extends React.PureComponent<IRegisterResolverProps, any> {
  public render() {
    return (
      <div className='register-resolver screen'>
        <h2>Let's register a new resolver for your first BFF!</h2>
      </div>
    );
  }
}
