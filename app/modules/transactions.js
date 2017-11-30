// @flow
/* eslint-disable camelcase */

import { ASSETS_LABELS, ASSETS } from '../core/constants'
import { validateTransactionBeforeSending } from '../core/wallet'
import { getTransactionHistory, doSendAsset, hardwareDoSendAsset, transferTransaction } from 'neon-js'
import { setTransactionHistory, getNeo, getGas } from './wallet'
import { log } from '../util/Logs'
import { showErrorNotification, showInfoNotification, showSuccessNotification } from './notifications'
import { getWif, getPublicKey, getSigningFunction, getAddress, LOGOUT } from './account'
import { getNetwork } from './metadata'
import asyncWrap from '../core/asyncHelper'

// Constants
export const TOGGLE_ASSET = 'TOGGLE_ASSET'
export const LOADING_TRANSACTIONS = 'LOADING_TRANSACTIONS'

export const toggleAsset = ( symbol: string,  hash: string) => ({
  type: TOGGLE_ASSET,
  asset: symbol,
  hash: hash
})

export const setIsLoadingTransaction = (isLoading: boolean) => ({
  type: LOADING_TRANSACTIONS,
  payload: {
    isLoadingTransactions: isLoading
  }
})

export const syncTransactionHistory = (net: NetworkType, address: string) => async (dispatch: DispatchType) => {
  dispatch(setIsLoadingTransaction(true))
  const [err, transactions] = await asyncWrap(getTransactionHistory(net, address))
  if (!err && transactions) {
    const txs = transactions.map(({ NEO, GAS, txid, block_index, neo_sent, neo_gas }: TransactionHistoryType) => ({
      type: neo_sent ? ASSETS.NEO : ASSETS.GAS,
      amount: neo_sent ? NEO : GAS,
      txid,
      block_index
    }))
    dispatch(setIsLoadingTransaction(false))
    dispatch(setTransactionHistory(txs))
  } else {
    dispatch(setIsLoadingTransaction(false))
  }
}

export const sendTransaction = (sendAddress: string, sendAmount: string) => async (dispatch: DispatchType, getState: GetStateType): Promise<*> => {

  const state = getState()
  const wif = getWif(state)
  const address = getAddress(state)
  const net = getNetwork(state)
  const neo = getNeo(state)
  const gas = getGas(state)
  const selectedAsset = getSelectedAsset(state)
  const selectedHash = getSelectedHash(state)
  const balances = state.nep.balances
  const signingFunction = getSigningFunction(state)
  const publicKey = getPublicKey(state)

  const rejectTransaction = (message: string) => dispatch(showErrorNotification({ message }))
  const { error, valid } = validateTransactionBeforeSending(neo, gas, selectedAsset, selectedHash, balances, sendAddress, sendAmount)

  if (valid) {
    if(selectedHash){
      //run this logic for nep5 contracts
      console.log('transfer money here');

      const [err, txResult] = await transferTransaction( [selectedHash], publicKey, sendAddress, sendAmount );
      console.log('the transaction looks like', txResult);
      if ( txResult === -1 || txResult == null || typeof txResult !== 'string') {
        return rejectTransaction('Transfer transaction creation failed.');
      }


    }else{
      const selfAddress = address
      const assetName = selectedAsset === ASSETS_LABELS.NEO ? ASSETS.NEO : ASSETS.GAS
      let sendAsset = {}
      sendAsset[assetName] = sendAmount

      dispatch(showInfoNotification({ message: 'Sending Transaction...', autoDismiss: 0 }))
      log(net, 'SEND', selfAddress, { to: sendAddress, asset: selectedAsset, amount: sendAmount })

      const isHardwareSend = !!publicKey

      let sendAssetFn
      if (isHardwareSend) {
        dispatch(showInfoNotification({ message: 'Please sign the transaction on your hardware device', autoDismiss: 0 }))
        sendAssetFn = () => hardwareDoSendAsset(net, sendAddress, publicKey, sendAsset, signingFunction)
      } else {
        sendAssetFn = () => doSendAsset(net, sendAddress, wif, sendAsset)
      }

      const [err, response] = await asyncWrap(sendAssetFn())
      if (err || response.result === undefined || response.result === false) {
        return rejectTransaction('Transaction failed!')
      } else {
        return dispatch(showSuccessNotification({ message: 'Transaction complete! Your balance will automatically update when the blockchain has processed it.' }))
      }
    }

  } else {
    return rejectTransaction(error)
  }
}

// state getters
export const getSelectedAsset = (state) => state.transactions.selectedAsset
export const getSelectedHash = (state) => state.transactions.selectedHash
export const getIsLoadingTransactions = (state) => state.transactions.isLoadingTransactions

const initialState = {
  selectedAsset: ASSETS_LABELS.NEO,
  selectedHash: null,
  isLoadingTransactions: false
}

export default (state: Object = initialState, action: Object) => {
  switch (action.type) {
    case LOADING_TRANSACTIONS:
      const { isLoadingTransactions } = action.payload
      return {
        ...state,
        isLoadingTransactions
      }
    case TOGGLE_ASSET:
      return {
        ...state,
        selectedAsset: action.asset,
        selectedHash: action.hash
      }
    case LOGOUT:
      return initialState
    default:
      return state
  }
}
