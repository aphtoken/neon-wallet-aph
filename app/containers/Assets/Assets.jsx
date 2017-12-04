// @flow
import React, { Component } from 'react'
import styles from './Assets.scss'
import { initiateGetAssetsBalance, addNepToStore, setNepToStore, removeNepFromStore } from '../../modules/nep';
import axios from 'axios';
import storage from 'electron-json-storage'
import SplitPane from 'react-split-pane'
import ReactTooltip from 'react-tooltip'

export let intervals = {}

type Props = {
  nep5: string[],
  balances: Object,
  symbols: Object,
  net: NetworkType,
  address: string,
  initiateGetAssetsBalance: Function,
  addNepToStore: Function,
  setNepToStore: Function,
  removeNepFromStore: Function
}

let hashToAdd;

export default class Assets extends Component<Props> {

  componentDidMount = () => {
    const { address, net, nep5, setNepToStore } = this.props
    storage.get('nep5list', (error, data) => {
      if(data) {
        setNepToStore(JSON.parse(data));
      }
    });
    this.resetAssetsBalanceSync(net, address, nep5);
  }

  resetAssetsBalanceSync = (net: NetworkType, address: string, nep5: string[]) => {
    const { initiateGetAssetsBalance } = this.props
    if (intervals.balance !== undefined) {
      clearInterval(intervals.balance)
    }
    intervals.balance = setInterval(() => {
      initiateGetAssetsBalance(net, address, nep5)
    }, 30000)
  }

  componentWillReceiveProps = (nextProps) => {
    const { initiateGetAssetsBalance } = this.props
    if(nextProps.nep5 !== this.props.nep5 || nextProps.net !== this.props.net){
      storage.set('nep5list', JSON.stringify(nextProps.nep5));
      initiateGetAssetsBalance(nextProps.net, this.props.address, nextProps.nep5)
      this.resetAssetsBalanceSync(nextProps.net, this.props.address, nextProps.nep5);
    }
  }

  addNep(hash){
    const {addNepToStore} = this.props
    addNepToStore(hash);
    hashToAdd.value = '';
  }

  render () {
    const {symbols, addNepToStore, removeNepFromStore} = this.props
    return (
      <div>
        <div className={styles.assetsContainer}>
          <div className={styles.controls}>
            <input placeholder="Write your NEP5 hashscript" ref={(node) => hashToAdd = node}/>
            <button className="loginButton" onClick={(e) => this.addNep( hashToAdd.value )}>Add</button>
          </div>
          <ul className={styles.assetList}>
            { this.props.nep5.map((hash, index) => {
              let balance = this.props.balances[hash];
              return (
                <li key={hash}>
                  <div className={styles.amountBig}>{ symbols[hash] ? symbols[hash].symbol + ' ' : '' }{ balance }</div>
                  <div>
                    <span><strong>Hash:</strong> { hash }</span>
                    <span id={'delete_' + hash} className={styles.delete} data-tip data-for={'deleteHash_' + index} onClick={(e) => removeNepFromStore( hash, index )}>X</span>
                    <ReactTooltip class='solidTip' id={'deleteHash_' + index} place='bottom' type='dark' effect='solid'>
                      <span>Remove Hash</span>
                    </ReactTooltip>
                  </div>
                </li>);
            })}
          </ul>
        </div>
      </div>
    )
  }
}
