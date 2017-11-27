import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addNep5, setNep5, addHashBalance } from '../modules/nep';
import * as Neon from 'neon-js'
import { clearTransactionEvent } from '../modules/transactions';
import storage from 'electron-json-storage';
import axios from 'axios';
import SplitPane from 'react-split-pane';

let hashToAdd;

const refreshAssetBalance = (dispatch, net, address, hashscript) => {
    Neon.getTokenBalance(net, hashscript.slice(2, hashscript.length), address).then((balance) => {
        balance = !balance || isNaN(balance) ? 0 : balance;
        dispatch(addHashBalance(hashscript, balance));
    }).catch((e) => {
        dispatch(addHashBalance(hashscript, 0));
        setTimeout(() => dispatch(clearTransactionEvent()), 5000);
        return false;
    });
}

class Assets extends Component {

    componentDidMount = () => {
        storage.get('nep5list', (error, data) => {
            if(data) {
                this.props.dispatch(setNep5(JSON.parse(data)));
            }
        });
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
        if(nextProps.nep5 !== this.props.nep5 || nextProps.net !== this.props.net){
            storage.set('nep5list', JSON.stringify(nextProps.nep5));
            this.refreshAllBalances(nextProps.net);
        }
    }

    refreshAllBalances = (net) => {
        if( this.props.nep5 && net && this.props.address && this.props.dispatch ){
            this.props.nep5.map((hash, index) => {
                //console.log('check hash', hash, index);
                //this.testInvokeRPC(net, hash, index);
                refreshAssetBalance(this.props.dispatch, net, this.props.address, hash);
            });
        }
    }

    addNepToStore = (dispatch) => {

        //let's add the nep5 to the local storage
        this.props.nep5.push(hashToAdd.value);
        dispatch(addNep5(hashToAdd.value));
    }

    render = () =>
        <div>
            <div className="assetsContainer">
                <div className="controls">
                    <input placeholder="Enter Scripthash" ref={(node) => hashToAdd = node} />
                    <button className="loginButton" onClick={(e) => this.addNepToStore( this.props.dispatch )}>Add</button>
                </div>
                <div class="spacer" ></div>
                <ul id="assetList">
                    { this.props.nep5.map((hash) => {
                        let balance = this.props.balances[hash];
                        let symbol = "";
                        if ( hash == 0xecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9)
                          symbol = "RPX ";
                        if ( hash == 0xa0777c3ce2b169d4a23bcba4565e3225a0122d95)
                          symbol = "APH ";
                        return (
                            <li key={hash} className="assetListItem">
                                <div className="amountBig">{ symbol }{ balance }</div>
                                <div><span><strong>Hash:</strong> { hash }</span></div>
                        </li>);
                    })}
                </ul>
            </div>
        </div>;
}

const mapStateToProps = (state) => ({
    nep5: state.nep.nep5,
    balances: state.nep.balances,
    net: state.metadata.network,
    address: state.account.address
});

Assets = connect(mapStateToProps)(Assets);

export default Assets;
