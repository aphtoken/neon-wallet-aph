// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Send from './Send'
import { sendTransaction, toggleAsset, getSelectedAsset, getSelectedHash } from '../../modules/transactions'
import { showErrorNotification } from '../../modules/notifications'
import { togglePane, getConfirmPane } from '../../modules/dashboard'
import { getNeo, getGas } from '../../modules/wallet'
import { getBalances, getTokens, getNep5 } from '../../modules/nep'


const mapStateToProps = (state) => ({
  neo: getNeo(state),
  gas: getGas(state),
  selectedAsset: getSelectedAsset(state),
  selectedHash: getSelectedHash(state),
  confirmPane: getConfirmPane(state),
  nep5: getNep5(state),
  tokens: getTokens(state),
  balances: getBalances(state)
})

const actionCreators = {
  sendTransaction,
  toggleAsset,
  togglePane,
  showErrorNotification
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Send)
