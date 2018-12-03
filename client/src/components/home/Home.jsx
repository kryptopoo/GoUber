import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import { withWeb3 } from 'react-web3-provider';

import css from '../../css/Home.css';

class Home extends Component {

  constructor(props, context) {
    super(props);

    // get account
    let _this = this;
    let web3 = this.props.web3;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];
      _this.setState({ account: account });
    });
  }

  state = {
    account: null
  }

  onGoClicked = () => {
    if (this.state.account){
      browserHistory.push({
        pathname: '/start'
      })
    } 
  }

  render() {
    const { web3, web3State } = this.props;

    return (
      <div className="Home">
        <pre>
          {web3State.isConnected && "Web3 Connected!\n"}
          {web3State.isLoading && "Web3 Loading...\n"}
          {web3State.error && `Connection error: ${web3State.error.message}\n`}
          Web3 version: {web3.version}
        </pre>
        <p>&nbsp;</p>
        <p>Please make sure that your account is already connected via Meta Mask. </p>
        <p>Your account:</p>
        <p>{this.state.account ? this.state.account : "N/A"}</p>
        <p>Click <a className="Home-link" href="" onClick={this.onGoClicked}>GO</a> to start app...</p>
      </div>
    );
  }
}

export default withWeb3(Home);