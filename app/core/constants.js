// @flow

export const NEON_WALLET_RELEASE_LINK = 'https://github.com/CityOfZion/neon-wallet/releases'

export const NETWORK = {
  MAIN: 'MainNet',
  TEST: 'TestNet',
  APHELION_MAIN: 'MainNet-A',
  APHELION_TEST: 'TestNet-A'
}

export const EXPLORER = {
  NEO_TRACKER: 'Neotracker',
  NEO_SCAN: 'Neoscan',
  ANT_CHAIN: 'Antchain'
}

export const ASSETS = {
  NEO: 'NEO',
  GAS: 'GAS'
}

export const ASSET_ID = {
  NEO: 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
  GAS: '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'
}

export const ASSETS_LABELS = {
  [ASSETS.NEO]: 'Neo',
  [ASSETS.GAS]: 'Gas'
}

export const DEFAULT_REQ = {
  jsonrpc: '',
  method: '',
  params: [],
  id: 0
}

export const ROUTES = {
  HOME: '',
  DASHBOARD: '/dashboard',
  CREATE_WALLET: '/create',
  ENCRYPT_KEY: '/encrypt-key',
  LOGIN_PRIVATE_KEY: '/login-private-key',
  LOGIN_LOCAL_STORAGE: '/login-local-storage',
  LOGIN_LEDGER_NANO_S: '/login-ledger-nano-s',
  LOGIN_NEP2: '/login-encrypted',
  LOGIN_TOKEN_SALE: '/login-token-sale',
  TOKEN_SALE: '/token-sale',
  SETTINGS: '/settings'
}

export const NOTIFICATION_LEVELS = {
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning'
}

export const NOTIFICATION_POSITIONS = {
  TOP_CENTER: 'tc',
  TOP_RIGHT: 'tr',
  TOP_LEFT: 'tl',
  BOTTOM_CENTER: 'bc',
  BOTTOM_RIGHT: 'br',
  BOTTOM_LEFT: 'bl'
}

export const BIP44_PATH =
  '8000002C' +
  '80000378' +
  '80000000' +
  '00000000' +
  '00000000'

export const MODAL_TYPES = {
  SEND_TRANSACTION: 'SEND_TRANSACTION',
  CONFIRM: 'CONFIRM'
}
