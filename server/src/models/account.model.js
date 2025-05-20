const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['receivable', 'payable'], required: true }, // Type: receivable (from customers), payable (to suppliers)
  balance: { type: Number, default: 0 }, // Current balance in the account
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Reference to customer (if receivable)
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }, // Reference to supplier (if payable)
  transactionType: { type: String, enum: ['cashReceived', 'expenseVoucher', 'generalLedger'], required: true },
}, {
  timestamps: true,
});

// Add plugin that converts mongoose to JSON
AccountSchema.plugin(toJSON);
AccountSchema.plugin(paginate);

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
