export function getUserDefaultAccount(managedAccounts) {
  return managedAccounts.find(managedAccount => managedAccount.isCurrentUserDefaultAccount)?.id;
}
export function moveSelectedAccountToTop(managedAccounts) {
  const orderedManagedAccounts = managedAccounts.slice(0);
  const selectedAccountIndex = orderedManagedAccounts.findIndex(managedAccount => managedAccount.selected);
  if (selectedAccountIndex !== -1 && selectedAccountIndex !== 0) {
    const selectedAccount = orderedManagedAccounts.splice(selectedAccountIndex, 1)[0];
    orderedManagedAccounts.unshift(selectedAccount);
  }
  return orderedManagedAccounts;
}
export function updateSelectedStatus(managedAccounts, selectedAccountId) {
  return managedAccounts.map(managedAccount => {
    return {
      ...managedAccount,
      selected: managedAccount.id === selectedAccountId
    };
  });
}