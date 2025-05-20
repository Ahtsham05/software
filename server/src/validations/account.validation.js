const Joi = require('joi');

const createAccount = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('receivable', 'payable').required(),
    balance: Joi.number().default(0),
    customer: Joi.string().optional(),
    supplier: Joi.string().optional(),
    transactionType: Joi.string().valid('cashReceived', 'expenseVoucher', 'generalLedger').required(),
  }),
};

const getAccounts = {
  query: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string().valid('receivable', 'payable'),
    customer: Joi.string(),
    supplier: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
  }),
};

const getAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().required(),
  }),
};

const updateAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string().valid('receivable', 'payable'),
    balance: Joi.number(),
    customer: Joi.string().allow(null),
    supplier: Joi.string().allow(null),
    transactionType: Joi.string().valid('cashReceived', 'expenseVoucher', 'generalLedger'),
  }),
};

const deleteAccount = {
  params: Joi.object().keys({
    accountId: Joi.string().required(),
  }),
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};
