const BASE_URL = 'http://localhost:3000'
const HOME_URL = `${BASE_URL}/account`
const REQUEST_URL = `${BASE_URL}/requests`
const AUTH_URL = `${BASE_URL}/auth`
const HISTORY_URL = `${BASE_URL}/history`

const ACCOUNTS_FROM_MAKE = Object.keys(process.env).filter(prop =>
  prop.includes('TEST_ACCOUNT_')
)

const TEST_ACCOUNTS = ACCOUNTS_FROM_MAKE.sort((a, b) => (a > b ? -1 : 1)) // get vars from .env file created by make

const SELECTORS = {
  HOME: '[name="account-label"]',
  homeScreen: '[data-id="homeScreen"]',
  homeButton: '[data-id="homeButton"]',
  notificationButton: '[data-id="notificationButton"]',
  notificationsMenu: '[data-id="notificationsMenu"]',
  notificationsMenuItem: '[data-id="notificationsMenuItem"]',
  notificationsClearBtn: '[data-id="notificationsClear"]',
  backButton: '[data-id="backButton"]',
  historyItemIndicator: '[data-id="historyItemIndicator"]',
  transactionPartner: '[data-id="transactionPartner"]',
  emailCopyButton: '[data-id="emailCopyButton"]',
  contraAccountIndicator: '[data-id="contraAccountIndicator"]',
  sumTransactionItemValueIndicator:
    '[data-id="sumTransactionItemValueIndicator"]',
  transactionTimeIndicator: '[data-id="transactionTimeIndicator"]',
  transactionItemIndicator: '[data-id="transactionItemIndicator"]',
  transactionIdIndicator: '[data-id="transactionIdIndicator"]',
  ruleInstanceIdsIndicator: '[data-id="ruleInstanceIdsIndicator"]',
  preTransactionBalanceIndicator: '[data-id="preTransactionBalanceIndicator"]',
  postTransactionBalanceIndicator:
    '[data-id="postTransactionBalanceIndicator"]',
  disputeTransactionButton: '[data-id="disputeTransactionButton"]',
  historyScreen: '[data-id="historyScreen"]',
  currentAccountBalanceIndicator: '[data-id="currentAccountBalanceIndicator"]',
  creditButton: 'button[name="credit"]',
  debitButton: 'button[name="debit"]',
  transactionClear: 'button[data-id="transaction-clear"]',
  transactionAddName: 'input[name="transaction-add-name"]',
  transactionAddPrice: 'input[name="transaction-add-price"]',
  transactionAddQuantity: 'input[name="transaction-add-quantity"]',
  transactionDelete: 'button[name="delete-transaction"]',
  transactionFormToggle: 'button[data-id="hide-show-form"]',
  totalLabel: '[name="total-label"]',
  totalValue: '[name="total-value"]',
  accountLabel: '[name="account-label"]',
  accountValue: '[name="account-value"]',
  recipientInput: 'input[name="recipient"]',
  balance: '[placeholder="balance"]',
  requestCreditTransactionBtn: "button[data-id='credit']",
  requestDebitTransactionBtn: "button[data-id='debit']",
  recipient: '[name="recipient"]',
  requestItem: '[data-id="requestItemIndicator"]',
  transactionAddButton: 'button[data-id="transaction"]',
  approveModal: '[data-id=passwordApproveTransactionPopUp]',
  successModal: '[data-id=transactionSuccessPopup]',
  transactButton: '[data-id="transactButton"]',
  cancelButton: '[data-id="cancelButton"]',
  okButton: '[data-id="okButton"]',
  modalPasswordInput: '[data-id="passwordInputField"]',
  activeButton: 'button[data-id="activeButton"]',
  rejectedButton: 'button[data-id="rejectedButton"]',
  requestingAccountIndicator: '[data-id="requestingAccountIndicator"]',
  sumTransactionItemIndicator: '[data-id="sumTransactionItemIndicator"]',
  requestTimeIndicator: '[data-id="requestTimeIndicator"]',
  expirationTimeIndicator: '[data-id="expirationTimeIndicator"]',
  rejectButton: '[data-id="rejectButton"]',
  newButton: '[data-id="newButton"]',
  navButton: '[data-id="nav-button"]',
  navMenu: '[data-id="nav-menu"]',
  navMenuItem: '[data-id="nav-menu-item"]',
  navMenuTestItem: '[data-id="nav-menu-test-item"]',
  navMask: '[data-id="nav-mask"]',
  notFound: '[data-id="not-found"]',
  draftTransaction: '[data-id="draft-transaction"]',
  signOutButton: '[data-name="sign-out"]',
  landingScreenLogo: '.create-account-logo',
  ruleItem: '[data-id="rule-item"]',
  signInButton: '[data-id="signInButton"]',
  createAccountButton: '[data-id="createAccountButton"]',
  accountInput: '[name="account"]',
  passwordInput: '[name="password"]',
  appVersionLabel: '[data-id="appVersion"]'
}

module.exports = {
  SELECTORS,
  BASE_URL,
  HOME_URL,
  REQUEST_URL,
  AUTH_URL,
  HISTORY_URL,
  TEST_ACCOUNTS
}
