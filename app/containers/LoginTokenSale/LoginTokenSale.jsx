// @flow
import React, { Component } from 'react'
import Page from '../../components/Page'
import HomeButtonLink from '../../components/HomeButtonLink'
import { ROUTES } from '../../core/constants'
import loginStyles from '../../styles/login.scss'
import FaEye from 'react-icons/lib/fa/eye'
import FaEyeSlash from 'react-icons/lib/fa/eye-slash'

type Props = {
  loginWithPrivateKey: Function,
  history: Object
}

type State = {
  showKey: false,
  wif: string
}

export default class LoginTokenSale extends Component<Props, State> {
  state = {
    showKey: false,
    wif: ''
  }

  toggleKeyVisibility = () => {
    this.setState(prevState => ({
      showKey: !prevState.showKey
    }))
  }

  render () {
    const { history, loginWithPrivateKey } = this.props
    const { wif, showKey } = this.state
    const loginButtonDisabled = wif === ''

    return (
      <Page id='loginPage' className={loginStyles.loginPage}>
        <div className={loginStyles.title}>Participate in Token Sale:</div>
        <div className={loginStyles.loginForm}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder='Enter your private key here (WIF)'
            onChange={(e) => this.setState({ wif: e.target.value })}
            value={wif}
            autoFocus
          />
          {showKey
            ? <FaEyeSlash className={loginStyles.viewKey} onClick={this.toggleKeyVisibility} />
            : <FaEye className={loginStyles.viewKey} onClick={this.toggleKeyVisibility} />
          }
        </div>
        <div>
          <button
            onClick={() => loginWithPrivateKey(wif, history, ROUTES.TOKEN_SALE)}
            disabled={loginButtonDisabled}
            className={loginButtonDisabled ? 'disabled' : ''}>Login</button>
          <HomeButtonLink />
        </div>
      </Page>
    )
  }
}
