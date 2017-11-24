// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import Assets from './Assets'
import initiateGetBalance from '../../modules/wallet'
import setNetwork from '../../modules/metadata'
import { addNepToStore, setNepToStore, initiateGetAssetsBalance } from '../../modules/nep'


const mapStateToProps = (state) => ({
  nep5: state.nep.nep5,
  balances: state.nep.balances,
  net: state.metadata.network,
  address: state.account.address
});

const actionCreators = {
  initiateGetBalance,
  initiateGetAssetsBalance,
  setNetwork,
  addNepToStore,
  setNepToStore
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Assets)
