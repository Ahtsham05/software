const httpStatus = require('http-status');
const Account = require('../models/account');
const ApiError = require('../utils/ApiError');

/**
 * Create an account
 * @param {Object} accountBody
 * @returns {Promise<Account>}
 */
const createAccount = async (accountBody) => {
  return Account.create(accountBody);
};

/**
 * Query for accounts
 * @param {Object} filter
 * @param {Object} options - Pagination and sort options
 * @returns {Promise<QueryResult>}
 */
const queryAccounts = async (filter, options) => {
  const accounts = await Account.paginate(filter, options);
  return accounts;
};

/**
 * Get account by id
 * @param {ObjectId} id
 * @returns {Promise<Account>}
 */
const getAccountById = async (id) => {
  return Account.findById(id).populate('customer supplier');
};

/**
 * Update account by id
 * @param {ObjectId} accountId
 * @param {Object} updateBody
 * @returns {Promise<Account>}
 */
const updateAccountById = async (accountId, updateBody) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  Object.assign(account, updateBody);
  await account.save();
  return account;
};

/**
 * Delete account by id
 * @param {ObjectId} accountId
 * @returns {Promise<Account>}
 */
const deleteAccountById = async (accountId) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  await account.remove();
  return account;
};

module.exports = {
  createAccount,
  queryAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
};
