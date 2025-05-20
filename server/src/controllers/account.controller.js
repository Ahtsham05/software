const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { accountService } = require('../services');
const ApiError = require('../utils/ApiError');

const createAccount = catchAsync(async (req, res) => {
  const account = await accountService.createAccount(req.body);
  res.status(httpStatus.CREATED).send(account);
});

const getAccounts = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.name) filter.name = req.query.name;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.query.supplier) filter.supplier = req.query.supplier;

  const options = {
    sortBy: req.query.sortBy,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
  };

  const result = await accountService.queryAccounts(filter, options);
  res.send(result);
});

const getAccount = catchAsync(async (req, res) => {
  const account = await accountService.getAccountById(req.params.accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  res.send(account);
});

const updateAccount = catchAsync(async (req, res) => {
  const account = await accountService.updateAccountById(req.params.accountId, req.body);
  res.send(account);
});

const deleteAccount = catchAsync(async (req, res) => {
  await accountService.deleteAccountById(req.params.accountId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};
