// @flow
/* eslint-disable camelcase */

import { ASSETS_LABELS, ASSETS, ASSET_ID } from '../core/constants'
import { validateTransactionBeforeSending } from '../core/wallet'
import { getTransactionHistory, doSendAsset, hardwareDoSendAsset, getRPCEndpoint, getBalance, serializeTransaction } from 'neon-js'
import {setTransactionHistory, getNeo, getGas, createCoin} from './wallet'
import { log } from '../util/Logs'
import { showErrorNotification, showInfoNotification, showSuccessNotification } from './notifications'
import { getWif, getPublicKey, getSigningFunction, getAddress, LOGOUT } from './account'
import { getNetwork } from './metadata'
import asyncWrap from '../core/asyncHelper'
import { buildScript } from '../sc/scriptBuilder'
import { reverseHex } from 'neon-js/src/utils'
import { doInvokeScript } from 'neon-js/src/api'
import { getScriptHashFromAddress, getAccountFromWIFKey } from 'neon-js/src/wallet'
import { invocationTx } from 'neon-js/src/transactions/create'
import { signTransaction } from 'neon-js/src/transactions/index'
import { Query } from '../core/query'

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
  const account = getAccountFromWIFKey(wif)
  const publicKey = account.publicKeyEncoded
  const privateKey = account.privateKey
  const tokens = state.nep.tokens

  const rejectTransaction = (message: string) => dispatch(showErrorNotification({ message }))
  const { error, valid } = validateTransactionBeforeSending(neo, gas, selectedAsset, selectedHash, balances, sendAddress, sendAmount)

  if (valid) {
    if(selectedHash){

      let parsedValue = Math.round(sendAmount * Math.pow(10, tokens[selectedHash].decimals))

      //run this logic for nep5 contracts
      doTransferToken(net, selectedHash.slice(2), wif, publicKey, privateKey, address, sendAddress, parsedValue, 0, signingFunction)
        .then((result) => {

          if(result.result){
            return dispatch(showSuccessNotification({ message: 'The transaction was successful. Wait until the transfer is approved to see it on the balance.' }))
          }else{
            return rejectTransaction('Transaction failed!')
          }
      })

    }else{

      const selfAddress = address
      const assetName = selectedAsset === ASSETS_LABELS.NEO ? ASSETS.NEO : ASSETS.GAS
      let sendAsset = {}
      sendAsset[assetName] = sendAmount

      dispatch(showInfoNotification({ message: 'Sending Transaction...', autoDismiss: 0 }))
      log(net, 'SEND', selfAddress, { to: sendAddress, asset: selectedAsset, amount: sendAmount })

      const isHardwareSend = !publicKey

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

/**
 * Transfers NEP5 Tokens.
 * @param {string} net
 * @param {string} scriptHash
 * @param {string} wif
 * @param {string} publickey
 * @param {string} fromAddress
 * @param {string} toAddress
 * @param {number} transferAmount
 * @param {number} gasCost
 * @param {function} signingFunction
 * @return {Promise<Response>} RPC response
 */
const doTransferToken = (net, scriptHash, wif, publickey, privatekey, fromAddress, toAddress, transferAmount, gasCost = 0, signingFunction = null) => {
  const rpcEndpointPromise = getRPCEndpoint(net)
  const balancePromise = getBalance(net, fromAddress)
  let signedTx
  let endpt
  return Promise.all([rpcEndpointPromise, balancePromise])
    .then((values) => {
      endpt = values[0]
      const balances = values[1]
      const fromAddrScriptHash = reverseHex(getScriptHashFromAddress(fromAddress))
      const intents = [
        { assetId: ASSET_ID.GAS, value: 0.00000001, scriptHash: fromAddrScriptHash }
      ]
      const toAddrScriptHash = reverseHex(getScriptHashFromAddress(toAddress))
      const invoke = { scriptHash, operation: 'transfer', args: [fromAddrScriptHash, toAddrScriptHash, transferAmount] }
      const unsignedTx = invocationTx(publickey, balances, intents, invoke, gasCost, { version: 1 })
      if (signingFunction) {
        return signingFunction(unsignedTx, publickey)
      } else {
        return signTransaction(unsignedTx, privatekey)
      }
    })
    .then((signedResult) => {
      signedTx = signedResult
      return sendRawTransaction(signedTx).execute(endpt)
    })
    .then((res) => {
      if (res.result === true) {
        res.txid = signedTx
      }
      return res
    })
}

export const sendRawTransaction = (transaction) => {
  const serialized = typeof (transaction) === 'object' ? serializeTransaction(transaction) : transaction
  return new Query({
    method: 'sendrawtransaction',
    params: [serialized]
  })
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
