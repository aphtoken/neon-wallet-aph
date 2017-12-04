// @flow
import React, { Component } from 'react'
import SplitPane from 'react-split-pane'
import ReactTooltip from 'react-tooltip'
import { validateTransactionBeforeSending } from '../../core/wallet'
import { ASSETS_LABELS, ASSETS } from '../../core/constants'

type Props = {
  togglePane: Function,
  showErrorNotification: Function,
  sendTransaction: Function,
  toggleAsset: Function,
  neo: number,
  gas: number,
  nep5: string[],
  tokens: Object[],
  balances: Object[],
  confirmPane: boolean,
  selectedAsset: string,
  selectedHash: string
}

type State = {
  sendAmount: string,
  sendAddress: string,
}

export default class Send extends Component<Props, State> {
  state = {
    sendAmount: '',
    sendAddress: ''
  }

  confirmButton: ?HTMLButtonElement

  // open confirm pane and validate fields
  openAndValidate = () => {
    const { neo, gas, selectedAsset, selectedHash, togglePane, showErrorNotification, balances } = this.props
    const { sendAddress, sendAmount } = this.state
    const { error, valid } = validateTransactionBeforeSending(neo, gas, selectedAsset, selectedHash, balances, sendAddress, sendAmount)
    if (valid) {
      togglePane('confirmPane')
    } else {
      showErrorNotification({ message: error })
    }
  }

  nextAsset = () => {
    const { selectedAsset, selectedHash, nep5, tokens, toggleAsset } = this.props
    let newAsset = ASSETS_LABELS.NEO;
    let currentIndex = nep5.findIndex( hash => hash === selectedHash );
    let nextHash = nep5[currentIndex + 1];
    let nextSymbol = tokens[nextHash] ? tokens[nextHash].symbol : undefined;
    if( selectedHash &&  nextHash && selectedAsset !== ASSETS_LABELS.NEO){
      newAsset = nextHash;
    }else if(selectedAsset === ASSETS_LABELS.NEO){
      newAsset = ASSETS_LABELS.GAS;
      nextSymbol = ASSETS_LABELS.GAS;
    }else if(selectedAsset === ASSETS_LABELS.GAS && Object.keys(tokens).length > 0){
      newAsset = tokens[ Object.keys(tokens)[0] ].symbol
    }
    if(newAsset === ASSETS_LABELS.NEO){
      nextSymbol = ASSETS_LABELS.NEO;
    }
    toggleAsset(nextSymbol ? nextSymbol : (currentIndex + 2)+'°', newAsset); //add +2 since humans count from 1
  }

  // perform send transaction
  sendTransaction = () => {
    const { sendTransaction, togglePane } = this.props
    const { sendAddress, sendAmount } = this.state
    sendTransaction(sendAddress, sendAmount).then(() => {
      togglePane('confirmPane')
      this.resetForm()
    })
  }

  resetForm () {
    this.setState({
      sendAddress: '',
      sendAmount: ''
    })
    if (this.confirmButton) {
      this.confirmButton.blur()
    }
  }

  render () {
    const { confirmPane, selectedAsset } = this.props
    const { sendAddress, sendAmount } = this.state
    const confirmPaneClosed = confirmPane ? '100%' : '69%'

    return (
      <SplitPane className='confirmSplit' split='horizontal' size={confirmPaneClosed} allowResize={false}>
        <div id='sendPane'>
          <div id='sendAddress'>
            <input
              autoFocus
              type='text'
              placeholder='Where to send the asset (address)'
              value={sendAddress}
              onChange={(e) => this.setState({ sendAddress: e.target.value })}
            />
          </div>
          <div id='sendAmount'>
            <input
              type='text'
              value={sendAmount}
              placeholder='Amount'
              onChange={(e) => this.setState({ sendAmount: e.target.value })}
            />
          </div>
          <button id='sendAsset' data-tip data-for='assetTip' onClick={() => this.nextAsset()}>{selectedAsset}</button>
          <ReactTooltip class='solidTip' id='assetTip' place='bottom' type='dark' effect='solid'>
            <span>Toggle NEO / GAS / Assets</span>
          </ReactTooltip>
          <button id='doSend' onClick={this.openAndValidate}>Send Asset</button>
        </div>
        <div id='confirmPane' onClick={this.sendTransaction}>
          <button ref={node => { this.confirmButton = node }}>Confirm Transaction</button>
        </div>
      </SplitPane>
    )
  }
}
