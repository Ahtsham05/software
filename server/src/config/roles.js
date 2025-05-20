const allRoles = {
  user: ['getProducts','getUsers','getSuppliers','getCustomers','getPurchases','getSales','getTransactions'],
  admin: ['getUsers', 'manageUsers', 'getProducts', 'manageProducts', 'getSuppliers', 'manageSuppliers', 'getCustomers', 'manageCustomers','getPurchases', 'managePurchases', 'getSales', 'manageSales', 'getTransactions', 'manageTransactions'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
