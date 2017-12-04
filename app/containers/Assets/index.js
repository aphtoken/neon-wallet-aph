// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import Assets from './Assets'
import initiateGetBalance from '../../modules/wallet'
import setNetwork from '../../modules/metadata'
import { addNepToStore, setNepToStore, initiateGetAssetsBalance, removeNepFromStore } from '../../modules/nep'


const mapStateToProps = (state) => ({
  nep5: state.nep.nep5,
  balances: state.nep.balances,
  tokens: state.nep.tokens,
  net: state.metadata.network,
  address: state.account.address
});

const actionCreators = {
  initiateGetBalance,
  initiateGetAssetsBalance,
  setNetwork,
  addNepToStore,
  setNepToStore,
  removeNepFromStore
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Assets)
