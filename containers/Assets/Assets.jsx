// @flow
import React, { Component } from 'react'
import styles from './Assets.scss'
import { initiateGetAssetsBalance, addNepToStore, setNepToStore } from '../../modules/nep';
import axios from 'axios';
import storage from 'electron-json-storage'

export let intervals = {}

type Props = {
  nep5: string[],
  balances: Object,
  net: NetworkType,
  address: string,
  initiateGetAssetsBalance: Function,
  addNepToStore: Function,
  setNepToStore: Function
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

  loadHashName = (net, scripthash, index) => {
    const jsonRequest = axios.create({ headers: { 'Content-Type': 'application/json' } });
    let method = 'getcontractstate';
    const jsonRpcData = { method: method, params: [scripthash], id: index, jsonrpc: '2.0' };
    let endpoint = net.indexOf('Test') < 0 ? 'http://test1.cityofzion.io:8880/' : 'https://seed2.neo.org/';
    return jsonRequest.post(endpoint, jsonRpcData).then((response) => {
      console.log('the response for the symbol was', response);
      return response.data
    })
  }

  componentWillReceiveProps = (nextProps) => {
    const { initiateGetAssetsBalance } = this.props
    if(nextProps.nep5 !== this.props.nep5 || nextProps.net !== this.props.net){
      storage.set('nep5list', JSON.stringify(nextProps.nep5));
      initiateGetAssetsBalance(nextProps.net, this.props.address, nextProps.nep5)
      this.resetAssetsBalanceSync(nextProps.net, this.props.address, nextProps.nep5);
      // this.refreshAllBalances(nextProps.net);
    }
  }

  render () {
    const {addNepToStore} = this.props
    return (
      <div>
        <div className={styles.assetsContainer}>
          <div className={styles.controls}>
            <input placeholder="Write your NEP5 hashscript" ref={(node) => hashToAdd = node}/>
            <button className="loginButton" onClick={(e) => addNepToStore( hashToAdd.value )}>Add</button>
          </div>
          <div class="spacer"></div>
          <ul id="assetList">
            { this.props.nep5.map((hash) => {
              let balance = this.props.balances[hash];
              return (
                <li key={hash} className={styles.assetListItem}>
                  <div className="amountBig">{ balance }</div>
                  <div><span><strong>Hash:</strong> { hash }</span></div>
                </li>);
            })}
          </ul>
        </div>
      </div>
    )
  }
}
