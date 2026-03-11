export let CheckoutStatus = function (CheckoutStatus) {
  CheckoutStatus[CheckoutStatus["Unknown"] = 0] = "Unknown";
  CheckoutStatus[CheckoutStatus["Ready"] = 200] = "Ready";
  CheckoutStatus[CheckoutStatus["AsyncInProgress"] = 202] = "AsyncInProgress";
  CheckoutStatus[CheckoutStatus["ErrorNotFound"] = 404] = "ErrorNotFound";
  CheckoutStatus[CheckoutStatus["ErrorConflict"] = 409] = "ErrorConflict";
  CheckoutStatus[CheckoutStatus["ErrorDbLock"] = 423] = "ErrorDbLock";
  CheckoutStatus[CheckoutStatus["ErrorGone"] = 410] = "ErrorGone";
  CheckoutStatus[CheckoutStatus["ReadyWithError"] = 422] = "ReadyWithError";
  return CheckoutStatus;
}({});
export function checkoutStatusIsReady(checkoutStatus) {
  return !!checkoutStatus && [CheckoutStatus.Ready, CheckoutStatus.ReadyWithError].includes(checkoutStatus);
}