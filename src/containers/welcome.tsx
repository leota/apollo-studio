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
        <div className='hello'>
          <div className='logo'>
            Apollo <strong>Studio</strong>
          </div>
          <div className='logo-claim'>
            The easy way to set up a <span className='highlight'>GraphQL</span> service
          </div>
          <div>
            <div className='column left'>
              <h3>Welcome</h3>
              Apollo Studio lets you quickly set up a GraphQL Node.js service taking advantage of the <a href="https://github.com/marcellobarile/graphql-has" target="_blank">GraphQL HAS (Highly Automated Service)</a> project.<br /><br />
              <strong>Technologies under the hood</strong>
              <ul>
                <li>Webpack 4 + TypeScript 3</li>
                <li>Express 4 + ejs</li>
                <li>Apollo Server 2</li>
                <li>GraphQL 14</li>
                <li>Lodash</li>
                <li>Request Promise</li>
                <li>PM2 ready</li>
                <li>Docker ready</li>
              </ul>
            </div>
            <div className='column right'>
            <h3>Change notes</h3>
            <ul>
                <li><span className='date'>01/19</span><span className='version'>1.0</span> First release</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
