// AUTH MODULE
// ===============================================
const AuthModule = (() => {
  let currentUser = null;
  function login(username, password) {
    const account = AccountsModule.getAllAccounts().find(a => a.username === username && a.password === password);
    if (account) { currentUser = account; return { success: true, role: account.role, message: `Welcome back, ${account.fullName}!` }; }
    return { success: false, message: 'Invalid credentials' };
  }
  function logout() { currentUser = null; }
  function getCurrentUser() { return currentUser; }
  function isAuthenticated() { return currentUser !== null; }
  function isAdmin() { return currentUser && currentUser.role === 'admin'; }
  return { login, logout, getCurrentUser, isAuthenticated, isAdmin };
})();

// ===============================================
