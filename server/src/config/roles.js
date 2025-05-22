const allRoles = {
  user: ['getProducts','getUsers','getSuppliers','getCustomers','getPurchases','getSales','getTransactions','getAccounts'],
  admin: ['getUsers', 'manageUsers', 'getProducts', 'manageProducts', 'getSuppliers', 'manageSuppliers', 'getCustomers', 'manageCustomers','getPurchases', 'managePurchases', 'getSales', 'manageSales', 'getTransactions', 'manageTransactions', 'getAccounts', 'manageAccounts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
